# Body Map AI Health Advisor

A Next.js frontend with an interactive 3D body map and a FastAPI service that requests cautious, general health information from Google's Gemini API.

## Requirements

- Node.js and npm
- Python 3.10 or newer
- A Gemini API key for generating AI guidance

## Configure the backend

In PowerShell from the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Copy the values from `backend/.env.example` into `backend/.env` and set `GEMINI_API_KEY` to your key. Keep that key in the backend only; do not add it to a `NEXT_PUBLIC_` variable or commit `.env`.

Start the API in this terminal:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

API health: <http://localhost:8000/api/v1/health>  
Interactive API docs: <http://localhost:8000/docs>

## Run the frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open <http://localhost:3000>. The frontend defaults to `http://localhost:8000` for the API. To use a different backend address, create `frontend/.env.local` from `frontend/.env.example` and update `NEXT_PUBLIC_API_BASE_URL`.

## How an assessment works

1. Select body regions and set their severity on the 3D map.
2. Describe symptoms in the form.
3. Review the data notice and consent before sending the selected regions and description to Gemini.
4. The backend validates the request and returns structured, AI-generated guidance.

The API requires `GEMINI_API_KEY`; its health endpoint remains available without a key, while assessment requests return a clear configuration error. AI output is educational, can be inaccurate, and is not a diagnosis or treatment plan. The app does not store assessments.

## Project structure

```text
backend/
  app/
    core/       Settings and sanitized API error handling
    routers/    Health and assessment endpoints
    main.py     FastAPI application and CORS setup
  requirements.txt
  pyproject.toml
frontend/
  src/app/           Next.js page, layout, and global styles
  src/components/    Assessment UI, shared layout, and 3D body map
  src/hooks/         Body selection and assessment form state
  src/lib/           Frontend API client
  src/types/         Shared TypeScript request and response types
```
