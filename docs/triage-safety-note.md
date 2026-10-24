# Clinic Intake Triage Safety Note

This hackathon prototype organizes synthetic appointment requests for staff review. It does not diagnose, recommend treatment, or replace a qualified clinician. Routing suggestions can be wrong or miss important context; staff must review the request and may change its recorded disposition.

If the requester may be in immediate danger, contact local emergency services now. Do not wait for AI classification, a clinic appointment, or review of the queue. Emergency guidance remains visible after a staff override.

Use fictional records only. Do not enter names, contact details, dates of birth, or real patient descriptions. When Gemini is configured, only the symptom description and requester-selected urgency are sent to Gemini; the synthetic ID and appointment preference remain in the local queue. The SQLite queue is intended for this local demo only.
