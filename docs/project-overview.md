# Project Overview: Body Map AI Health Advisor

This document describes the repository for project reports, demos, and presentation preparation. Implementation details reflect the current hackathon prototype.

## At a glance

**Body Map AI Health Advisor** is a web application prototype that combines a visual symptom-description tool with a synthetic clinic intake queue. Its two workflows address different users:

- A person can indicate symptom location and severity, describe what they are experiencing, and receive general AI-generated health education.
- A clinic staff member can organize fictional appointment requests, review a routing suggestion, and record a final disposition.

The system combines an interactive interface, a conventional API, deterministic policy checks, constrained generative AI, local persistence, and human review. The intent is to demonstrate how those parts can work together while making the system's limits visible.

## Why this project

Written symptom descriptions can omit useful context such as where discomfort is located and how strongly it is felt. A body map gives the user another way to structure that description. On the operational side, appointment requests can vary in urgency; a review queue can help staff see and organize requests. The prototype explores these two needs without presenting itself as a diagnostic system or replacing clinical judgment.

## Feature tour

### 1. Interactive body-map assessment

The home page contains a rotatable, zoomable 3D human model. Selecting a body region adds it to the assessment at severity 1. Selecting it again increases severity through levels 1 to 5; selecting at the maximum removes it. Users can clear all selections. Selected regions and their severity are summarized alongside a written description field.

Before the request can be sent, the user must provide a description that passes client-side validation and check a consent statement explaining that the selected regions and symptom description go to Google Gemini. The backend validates the request and asks Gemini for a structured response. The response includes:

- A short summary of the reported information.
- A small set of possible low-risk next steps.
- Follow-up questions the user may consider.
- Situations in which the user should seek care.
- A disclaimer that the output is general information, not a diagnosis or treatment plan.

The model instructions prohibit diagnosis, disease naming, medication dosing, and false reassurance. An emergency concern should prompt the user to contact local emergency services. These safeguards reduce risk but cannot guarantee that generated content is correct. Assessment requests and results are not stored by the app.

### 2. Synthetic clinic intake and staff queue

The `/triage` page is an administrative demo workspace. It accepts a synthetic patient ID, a symptom description, a preferred appointment time, and requester urgency (`routine` or `urgent`). The interface asks the submitter to confirm the request uses fictional data and warns not to enter identifying information.

Each saved item displays the original routing recommendation, its reason and source, the request details, and the current final staff disposition. The queue supports refresh and filters by the **final disposition**. Staff can set or confirm one of three categories and must enter a decision note before saving. The original suggestion remains visible after a staff change, and emergency action guidance stays visible if the recorded disposition is overridden.

### 3. Safety-oriented routing

Routing is designed around explicit precedence rather than accepting an AI answer without checks:

| Situation | Behavior |
| --- | --- |
| A deterministic emergency phrase matches | Return emergency guidance immediately; do not wait for Gemini. |
| A deterministic same-day signal matches | Enforce same-day human review as a minimum. |
| The requester marks the request urgent | Enforce same-day human review as a minimum. |
| Gemini identifies emergency risk | Return emergency guidance. |
| Gemini is unclear, unavailable, invalid, or fails | Use same-day human review unless an emergency rule already applies. |
| Gemini gives a clear routine result and no policy rule escalates | Suggest a routine appointment. |

Emergency signals in the current policy include severe chest pain, difficulty or trouble breathing, unconsciousness or unresponsiveness, severe bleeding, seizure activity, and stroke-like symptoms such as sudden one-sided weakness, face drooping, or trouble speaking. Same-day signals include persistent fever with marked weakness, persistent symptoms, worsening symptoms, and requester-marked urgency. The phrase matcher suppresses some common negated, historical, and hypothetical mentions. It is not a clinical language-understanding system and should not be treated as one.

Gemini's intake response is restricted to a routing category, approved policy signal IDs, and a clarity flag. The app maps those IDs to fixed reason text; Gemini does not write the explanation shown to staff. Team policy can raise urgency and cannot be downgraded by a routine model suggestion. If the API key is absent, intake submission remains usable and takes the safe same-day fallback when no emergency rule matches.

## System architecture

```text
┌──────────────────────────── Browser ──────────────────────────────┐
│ Next.js / React / TypeScript                                       │
│                                                                    │
│  `/` body map + assessment       `/triage` intake + staff queue     │
└──────────────────┬───────────────────────────────┬─────────────────┘
                   │ HTTP JSON                     │ HTTP JSON
                   ▼                               ▼
┌──────────────────────────── FastAPI ──────────────────────────────┐
│ Pydantic validation · policy routing · fixed reasons · API errors │
│                                                                    │
│ `/assessments`                 `/intakes`, `/intakes/{id}/override` │
└─────────────────┬───────────────────────────────┬──────────────────┘
                  │                               │
                  ▼                               ├────> SQLite
           Google Gemini API                      │       intake records
           general guidance                       │
           optional classification <──────────────┘
```

### Main technologies

| Layer | Technology | Role |
| --- | --- | --- |
| Web application | Next.js, React, TypeScript | Pages, interactive forms, queue, and API client |
| 3D visualization | Three.js, React Three Fiber, Drei | Interactive body model and selection controls |
| API | Python, FastAPI | Assessment and intake endpoints, CORS, error handling |
| Data validation | Pydantic | Request/response contracts and constrained AI output validation |
| Generative AI | Google Gemini via `google-genai` | General health-education response and optional intake classification |
| Persistence | SQLite | Local storage for synthetic intake records and staff dispositions |

## Data flows

### Assessment

1. The browser keeps the selected regions, severity values, and description in page state.
2. The UI validates input and requires a consent checkbox.
3. The browser sends the assessment payload to `POST /api/v1/assessments`.
4. FastAPI validates it and, if `GEMINI_API_KEY` is set, sends region/severity data and the description to Gemini.
5. The server validates the structured output and returns guidance plus a disclaimer.
6. The browser displays the result. The assessment is not written to SQLite.

### Clinic intake

1. The browser submits a synthetic ID, description, preferred time, and urgency to `POST /api/v1/intakes`.
2. FastAPI validates field lengths and the `SYN-` ID pattern.
3. Deterministic emergency and same-day rules run. If appropriate, the backend requests constrained classification from Gemini.
4. Policy precedence and safe fallback behavior produce a recommendation.
5. The backend stores the request, recommendation, and initial final category in local SQLite.
6. The browser displays the result and queue. Staff can retrieve the queue with `GET /api/v1/intakes`, then record a final category and reason through `PATCH /api/v1/intakes/{id}/override`.

## API surface

All routes are versioned under `/api/v1`:

| Endpoint | Description |
| --- | --- |
| `GET /health` | Returns service health and whether a Gemini key is configured. |
| `POST /assessments` | Validates an assessment and returns structured general guidance. Requires Gemini configuration. |
| `POST /intakes` | Classifies/routes and stores a synthetic intake. |
| `GET /intakes?limit=100` | Returns recent intake records; limit is 1 to 500. |
| `PATCH /intakes/{id}/override` | Saves a staff disposition and required reason. |

FastAPI's interactive API documentation is available at `/docs` while running locally.

## Data and privacy boundaries

- The body-map assessment sends selected region IDs/names, severity values, and description to the backend and Gemini after consent. Assessments are not persisted by the app.
- Gemini intake classification receives only symptom description and requester-selected urgency. The synthetic ID and preferred appointment time stay in the local backend database.
- Intake queue records are persisted in SQLite at `backend/data/intakes.sqlite3` by default. `TRIAGE_DB_PATH` can change the location.
- The UI's `SYN-` requirement and fictional-data checkbox are guardrails for demonstrations. They cannot establish that the free-text description is actually fictional.
- The Gemini API key belongs in `backend/.env`; it must not be exposed through a public frontend environment variable.

## Repository guide

```text
backend/app/core/config.py          Environment and service configuration
backend/app/core/triage_policy.py   Routing vocabulary, signal rules, precedence
backend/app/core/intake_store.py    SQLite schema and intake persistence
backend/app/routers/assessment.py   Assessment validation and Gemini request
backend/app/routers/intakes.py      Intake classification, policy, and API routes
backend/app/schemas/intake.py       Intake and constrained classification schemas
backend/tests/                      Synthetic routing tests and fixture cases
frontend/src/app/page.tsx           Body-map assessment page
frontend/src/app/triage/page.tsx    Clinic intake page
frontend/src/components/body3d/     3D body visualization components
frontend/src/components/assessment/ Assessment form and result components
frontend/src/components/triage/     Intake form, queue, filters, staff disposition
frontend/src/lib/api.ts             Frontend HTTP client
docs/triage-policy.md               Detailed routing policy
docs/triage-safety-note.md          Demo safety note
```

## Presentation/demo outline

1. **Need:** Explain the value of structured symptom location and organized appointment requests.
2. **Body map:** Select multiple regions, demonstrate severity changes, enter fictional details, show consent and the structured guidance layout.
3. **Staff intake:** Submit a synthetic request and show the recommendation, source, reason, and saved queue record.
4. **Safety behavior:** Use a known emergency phrase to show immediate policy routing, then use an unclear request to show same-day fallback.
5. **Human review:** Filter by final disposition, update a disposition with a note, and point out that the original recommendation and emergency instruction remain visible.
6. **Limits and next steps:** Emphasize synthetic data, no diagnosis, local demo storage, language-matching limits, and the need for clinical and privacy review before any real-world use.

## Limitations and future work

This repository is a hackathon prototype, not a production or clinical system. The policy phrase matcher covers a small set of English phrases and cannot reliably interpret all symptoms, negation, nuance, or context. AI can produce inaccurate guidance or classifications. The intake database is local SQLite, and the app has no authentication, roles, audit trail, deployment hardening, or production data governance. The safety language uses “local emergency services” rather than a location-specific number.

Possible future work includes clinical review of policy rules and user-facing content, broader usability and accessibility studies, stronger contextual language handling with validated evaluation data, authentication and role-based access, audited staff actions, secure managed storage, localization, and a formal privacy/security review. Such changes would need appropriate clinical, legal, and security oversight.
