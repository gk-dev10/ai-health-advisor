# Clinic Intake Routing Policy

**Policy version:** `hackathon-v1`  
**Purpose:** Organize synthetic appointment requests for human review. This policy does not diagnose, recommend treatment, or replace clinical judgment.

## Intake contract

The prototype accepts a synthetic patient ID (`SYN-...`), symptom description (up to 2,000 characters; blank or unclear text is allowed), preferred appointment time, and requester urgency (`routine` or `urgent`). It does not collect names, dates of birth, contact details, or other identifying fields. The ID prefix is a guardrail, not proof that submitted text is synthetic; the UI must warn staff not to enter real patient data. Appointment preference is scheduling context and cannot lower routing urgency.

## Categories and precedence

| Category | Initial policy |
| --- | --- |
| Emergency guidance | Team emergency signals, or a clear Gemini emergency suggestion. Direct the requester to contact local emergency services immediately and not wait for a clinic appointment. |
| Same-day human review | Team same-day signals, requester-selected urgent status, an unclear/high-risk description, or Gemini failure, invalid output, or uncertainty. |
| Routine appointment | Only when Gemini gives a clear routine suggestion and no policy or requester-urgency rule escalates the request. |

Emergency takes precedence over all other routes. Same-day rules set a minimum route. A model suggestion cannot downgrade a deterministic policy match. The team policy signal or AI reason is displayed with the suggestion; fallbacks use a fixed explanation.

## Initial team signals

Emergency policy signals are severe chest pain, difficulty or trouble breathing, unconsciousness/unresponsiveness/passing out, severe bleeding, seizure activity, and stroke-like symptoms such as sudden one-sided weakness, facial drooping, or trouble speaking.

Same-day policy signals include persistent fever together with marked weakness, other persistent symptoms, and worsening symptoms. Unclear or potentially high-risk descriptions are reviewed by clinic staff the same day unless an emergency route applies.

Rules refer to current/recent reported symptoms. Explicit denials, historical mentions, hypothetical examples, and quoted instructions must not be treated as current symptoms solely because they contain a signal phrase. If context cannot be resolved safely, use same-day human review; do not invent or infer a diagnosis.

## AI output and safety

Gemini may return only a category, a short reason based on the request, and whether its classification is clear. It must not name a disease, diagnose, or recommend treatment. The backend validates this structure and applies team policy after receiving it. If the model is unavailable, invalid, or uncertain, use same-day human review unless a deterministic emergency signal applies.

The prototype is for synthetic records only. The UI must make that restriction visible and explain that symptom text is sent to Gemini. Do not add location-specific emergency phone numbers without a clinic location supplied by the team; use “local emergency services.” Staff may change the recorded disposition and must provide an override reason, but an emergency instruction already shown to the requester remains visible.
