# Body Map AI Health Advisor

A hackathon prototype with an interactive 3D body map for general health education and a clinic intake workspace for organizing **synthetic** appointment requests. The app uses a Next.js frontend, a FastAPI backend, and Google's Gemini API for AI assistance.

The project explores two related health-support tasks: helping a person describe symptoms by body location, and helping clinic staff organize fictional appointment requests for review. It demonstrates an end-to-end web application with interactive 3D input, structured AI responses, rule-based safety checks, human review, and a local persistent queue. It is a prototype for education and demonstration, not a clinical service.

> **Health and privacy notice:** This prototype is not a medical device and does not diagnose, recommend treatment, or replace a qualified professional. AI output and routing suggestions may be wrong. Use fictional records only; do not enter real patient information. If someone may be in immediate danger, contact local emergency services.

## Features

- Select body regions and symptom severity on an interactive 3D body map, then request cautious, general health information.
- Use an optional guided interview to add symptom onset, change over time, and sensation details to the assessment request.
- Save body-map check-ins locally in the browser and compare selected regions and severity against the latest saved check-in.
- Download a visit summary containing reported regions, the description, optional interview answers, and any AI guidance received.
- Review and consent before sending assessment details to the backend and Gemini.
- Submit synthetic clinic intake requests and review suggested routing in a staff workspace at `/triage`.
- Apply deterministic emergency and same-day routing rules before or alongside AI classification. Unclear requests and AI failures fall back to same-day human review.
- Review the intake queue, refresh it, and filter requests by their final staff disposition.
- Record or update a staff disposition with a required decision note. The original routing suggestion and emergency guidance remain visible after an override.
- Use the Care Coordinator tab to view priority-based team queues, a fictional clinician roster, and demo case capacity; staff manually assign and can reassign clinicians with a recorded reason and history. Emergency cases remain an emergency-services escalation, not an appointment assignment.

## Project description

### Problem and goal

People may find it difficult to describe where they feel discomfort and how severe it is. Separately, a clinic may need to organize incoming appointment requests so staff can review urgent items. This prototype explores both needs in one application: a visual symptom-description experience for general health education and a separate administrative intake queue for synthetic requests.

### Main user experiences

**Body-map assessment (`/`):** The user rotates and zooms an interactive 3D body model, selects one or more regions, and cycles each selected region through a five-level severity scale. They add a written symptom description and may optionally add onset, trend, and sensation details with a guided interview. A summary can be downloaded to the device as a text file. Users can also save dated body-map-only snapshots in browser storage and compare current selections against the latest snapshot; snapshots exclude the written description and can be cleared in the interface. Explicit consent is required before assessment details are sent to Gemini. The UI presents structured guidance with a summary, possible low-risk next steps, follow-up questions, and situations in which to seek care.

**Clinic intake (`/triage`):** Staff or a demo user submits an appointment request using a `SYN-` fictional ID, symptom description, preferred appointment time, and requester-selected routine or urgent status. The backend applies the team's policy and, when configured, asks Gemini for a constrained routing classification. The result is saved in a local SQLite queue. The workspace can refresh the queue, filter by final disposition, review the original recommendation and its source, and save a final staff disposition with a required note. Its Care Coordinator tab maps routine and same-day priorities to administrative team queues, shows a fictional clinician roster and workload capacity, and lets staff manually assign or reassign a clinician while recording who made the assignment and why. Emergency cases are escalated to local emergency services and cannot be assigned as clinic appointments. The roster and capacity are demo data, not live scheduling information; specialty is not inferred from symptoms.

### Intake routing flow

The intake router evaluates signals in a safety-oriented order:

1. Deterministic emergency phrase rules run first. A match immediately returns emergency guidance without waiting for an AI call.
2. Deterministic same-day rules and requester-selected urgent status establish a minimum of same-day human review.
3. If Gemini is configured and the request can be classified, the model returns only a category, approved policy signal IDs, and a clarity flag. It does not supply free-text medical explanations.
4. Team policy and emergency rules take precedence over a lower-urgency model suggestion. Unclear requests, empty descriptions, and AI failures use same-day human review unless an emergency rule applies.
5. The recommendation is stored separately from the final staff disposition. Staff can save a final category and reason; emergency action text stays available even if staff changes the recorded category.

The current team policy recognizes severe chest pain, trouble breathing, loss of consciousness, severe bleeding, seizures, and stroke-like symptoms as emergency signals. Persistent fever together with marked weakness, persistent symptoms, worsening symptoms, and requester-marked urgency raise same-day review. Phrase matching accounts for common negation, historical, and hypothetical wording, but it is a lightweight prototype mechanism and cannot understand every context.

### Architecture and data flow

```text
Browser (Next.js / React)
  ├── Body-map experience ──> FastAPI /assessments ──> Gemini ──> guidance response
  └── Clinic workspace ─────> FastAPI /intakes ──────> policy + optional Gemini
                                  │                         │
                                  ├── SQLite intake queue <──┘
                                  ├── staff disposition endpoint
                                  └── staff assignment and audit endpoint
```

The frontend is built with Next.js, React, TypeScript, Three.js, React Three Fiber, and Drei. The backend uses FastAPI and Pydantic for HTTP APIs and request validation, with SQLite for the local intake queue. Gemini is accessed through Google's `google-genai` SDK. Separate Pydantic schemas constrain provider output, and the backend validates the parsed response again before using it.

### Data handling and privacy boundaries

- Assessment requests are sent to the backend and Gemini only after the user checks the consent box. This application does not save assessment requests or responses.
- Intake records are stored in the backend's local SQLite database. The queue is intended for a local synthetic-data demo, not production patient records.
- When Gemini classifies an intake, only symptom description and requester-selected urgency are sent to it. Synthetic ID and preferred appointment time remain in the local application.
- The intake interface requires a fictional `SYN-` ID and explicit confirmation that the request uses fictional data. This is a demo guardrail, not a way to verify that free-text content contains no personal information.
- The Gemini API key is configured on the backend and is not exposed through a frontend `NEXT_PUBLIC_` variable.

### Demo narrative

For a presentation, demonstrate the body map first: select several regions, adjust severity, enter a fictional symptom description, review the payload summary, consent, and show the structured guidance. Then open `/triage`, submit a fictional request, show how an emergency phrase is escalated immediately or how an unclear request falls back to same-day review, and assign a same-day or routine request to a clinician from the matching demo team. Show how workload capacity updates and how reassignment notes appear in assignment history. Explain that priority organizes administrative review; staff choose the clinician and retain the final decision.

For a presentation-ready explanation of the modules, workflows, APIs, and limitations, see [the detailed project overview](docs/project-overview.md).

## Requirements

- Node.js and npm
- Python 3.10 or newer
- A Google Gemini API key for AI assessment guidance and optional intake classification

The frontend can start without a Gemini key. The assessment endpoint requires one; clinic intake still works without one and uses same-day human review when AI classification is unavailable.

## Run locally

Open two PowerShell terminals from the repository root.

### 1. Set up and start the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set `GEMINI_API_KEY` (optional for clinic intake; required for assessments). The example also sets the Gemini model, allowed frontend origins, and local SQLite path. Keep the key in this backend file; do not put it in a `NEXT_PUBLIC_` variable or commit `.env`.

Start the API from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

API health: <http://localhost:8000/api/v1/health>  
Interactive API docs: <http://localhost:8000/docs>

### 2. Set up and start the frontend

In the second terminal, from the repository root:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open <http://localhost:3000> for the body-map assessment or <http://localhost:3000/triage> for clinic intake. The frontend defaults to the API at `http://localhost:8000`. To change it, copy `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_API_BASE_URL`.

## API overview

All application endpoints use the `/api/v1` prefix:

| Method  | Path                     | Purpose                                            |
| ------- | ------------------------ | -------------------------------------------------- |
| `GET`   | `/health`                | Check API status and AI configuration              |
| `POST`  | `/assessments`           | Request general AI health guidance                 |
| `POST`  | `/intakes`               | Save a synthetic intake and its routing suggestion |
| `GET`   | `/intakes?limit=100`     | List recent intake records (limit 1-500)           |
| `PATCH` | `/intakes/{id}/override` | Save a staff disposition and required reason       |
| `GET`   | `/staffing/roster`          | Return fictional clinician profiles and current demo case capacity |
| `PATCH` | `/intakes/{id}/assignment`  | Assign or reassign a clinician and append a staff audit entry; emergency appointment assignment is rejected |

The assessment flow does not store assessments. Intake records are stored locally in SQLite at `backend/data/intakes.sqlite3` by default. Set `TRIAGE_DB_PATH` to change the path; relative paths are resolved from `backend/`.

For the intake contract and routing behavior, see [the clinic intake routing policy](docs/triage-policy.md). Read [the clinic intake safety note](docs/triage-safety-note.md) before a demo.

## Run backend routing tests

From `backend/` with dependencies installed:

```powershell
python -m unittest discover -s tests -v
```

These synthetic routing cases mock Gemini calls.

## Project layout

```text
backend/
  app/
    core/       Settings, triage policy, SQLite store, and API errors
    routers/    Health, assessment, and intake endpoints
    schemas/    Intake and routing API contracts
    main.py     FastAPI application and CORS configuration
  tests/        Synthetic intake routing tests and fixtures
  .env.example Backend configuration template
frontend/
  src/app/           Next.js pages, layout, and global styles
  src/app/triage/    Clinic intake workspace route
  src/components/    Assessment UI, triage UI, shared layout, and 3D body map
  src/hooks/         Body selection and assessment state
  src/lib/           Frontend API client
  src/types/         TypeScript request and response types
  .env.example       Frontend API URL template
docs/
  triage-policy.md       Intake routing policy
  triage-safety-note.md  Demo safety guidance
```
