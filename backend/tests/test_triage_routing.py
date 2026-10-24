import json
from dataclasses import replace
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from pydantic import ValidationError

from app.core.config import settings
from app.core.intake_store import apply_override, create_intake, list_intakes
from app.core.triage_policy import (
    EMERGENCY_ACTION,
    PolicySignalId,
    RequesterUrgency,
    RoutingCategory,
    RoutingSource,
)
from app.routers.intakes import _classify
from app.schemas.intake import AIClassification, IntakeSubmission, RoutingSuggestion


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "triage_cases.json"


class TriageRoutingFixtureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with FIXTURE_PATH.open(encoding="utf-8") as fixture_file:
            cls.cases = json.load(fixture_file)

    def setUp(self):
        self.ai_settings = replace(settings, gemini_api_key="synthetic-test-key")
        self.settings_patch = patch("app.routers.intakes.settings", self.ai_settings)
        self.settings_patch.start()

    def tearDown(self):
        self.settings_patch.stop()

    def test_synthetic_policy_fixtures(self):
        for case in self.cases:
            with self.subTest(case=case["name"]):
                request = IntakeSubmission.model_validate(case["request"])
                expected_call = case["expectModelCall"]
                with patch("app.routers.intakes._generate_classification") as generate:
                    if case.get("modelFailure"):
                        generate.side_effect = RuntimeError("Synthetic provider failure")
                    elif case.get("modelInvalid"):
                        generate.side_effect = ValueError("Synthetic invalid model response")
                    elif "model" in case:
                        generate.return_value = AIClassification.model_validate(case["model"])

                    if case.get("modelFailure") or case.get("modelInvalid"):
                        with self.assertLogs("app.intakes", level="WARNING"):
                            result = _classify(request)
                    else:
                        result = _classify(request)

                    if expected_call:
                        generate.assert_called_once_with(request)
                    else:
                        generate.assert_not_called()

                self.assertEqual(result.category.value, case["expectedCategory"])
                self.assertEqual(result.source.value, case["expectedSource"])
                if result.category == RoutingCategory.EMERGENCY_GUIDANCE:
                    self.assertEqual(result.action, EMERGENCY_ACTION)
                self.assertNotIn("diagnosis", result.reason.casefold())

    def test_missing_ai_configuration_uses_safe_fallback(self):
        request = IntakeSubmission(
            synthetic_patient_id="SYN-NOAI",
            symptom_description="A request without an escalation signal.",
            preferred_appointment_time="Next available",
            requester_urgency=RequesterUrgency.ROUTINE,
        )
        with (
            patch("app.routers.intakes.settings", replace(settings, gemini_api_key="")),
            patch("app.routers.intakes._generate_classification") as generate,
        ):
            result = _classify(request)
        generate.assert_not_called()
        self.assertEqual(result.category, RoutingCategory.SAME_DAY_HUMAN_REVIEW)
        self.assertEqual(result.source, RoutingSource.SAFE_FALLBACK)

    def test_ai_schema_rejects_free_text_reason(self):
        with self.assertRaises(ValidationError):
            AIClassification.model_validate(
                {
                    "category": "routine_appointment",
                    "signalIds": ["no_policy_signal"],
                    "isClear": True,
                    "reason": "Possible disease name should never be returned.",
                }
            )

    def test_intake_requires_synthetic_patient_id_prefix(self):
        with self.assertRaises(ValidationError):
            IntakeSubmission(
                synthetic_patient_id="P00123",
                symptom_description="Synthetic-only test description.",
                preferred_appointment_time="Next available",
                requester_urgency=RequesterUrgency.ROUTINE,
            )


class IntakeStoreTests(unittest.TestCase):
    def test_override_preserves_recommendation_and_emergency_action(self):
        request = IntakeSubmission(
            synthetic_patient_id="SYN-OVERRIDE1",
            symptom_description="Mild symptoms described for a synthetic record.",
            preferred_appointment_time="Next available",
            requester_urgency=RequesterUrgency.ROUTINE,
        )
        suggestion = RoutingSuggestion(
            category=RoutingCategory.ROUTINE_APPOINTMENT,
            reason="Clear request with no escalation signal.",
            source=RoutingSource.AI_ASSIST,
        )
        with tempfile.TemporaryDirectory() as directory:
            temp_settings = replace(
                settings,
                triage_db_path=Path(directory) / "synthetic-intakes.sqlite3",
            )
            with patch("app.core.intake_store.settings", temp_settings):
                created = create_intake(request, suggestion)
                updated = apply_override(
                    created.id,
                    RoutingCategory.EMERGENCY_GUIDANCE,
                    "Synthetic staff review escalated the disposition.",
                )
                queued = list_intakes()

        self.assertIsNotNone(updated)
        self.assertEqual(updated.recommendation.category, RoutingCategory.ROUTINE_APPOINTMENT)
        self.assertEqual(updated.final_category, RoutingCategory.EMERGENCY_GUIDANCE)
        self.assertEqual(updated.final_action, EMERGENCY_ACTION)
        self.assertEqual(updated.override_reason, "Synthetic staff review escalated the disposition.")
        self.assertEqual(queued[0].id, created.id)


if __name__ == "__main__":
    unittest.main()
