# AI Software Product Manager — Auth System & Project Structure

Build the foundational auth system (FastAPI + Supabase) and the entire frontend structure (Next.js + Tailwind). The user will manually create files from the documentation. Backend code is complete; frontend code is complete except for GUI design (only field/layout comments provided for pages).

> [!IMPORTANT]
> **Instructor mode** — I will produce ready-to-paste code files organized by path. You will create each file manually. For frontend pages, I'll leave the actual UI design to you and only specify fields, API calls, and logic.

---

## User Review Required

> [!WARNING]
> **Supabase setup**: You must create a Supabase project at [supabase.com](https://supabase.com) and enable **Email Auth** in Authentication → Providers. You'll need `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (for backend) and `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for frontend).

> [!IMPORTANT]
> **Database table**: You will need a `profiles` table in Supabase. SQL to create it will be provided below.

---

## Proposed Project Structure

```
spm_agent/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── config.py                # Settings (env vars)
│   │   ├── dependencies.py          # Dependency injection (get current user)
│   │   ├── supabase_client.py       # Supabase client singleton
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── auth.py              # Auth endpoints (signup, login, logout, refresh, me)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── auth.py              # Pydantic models for auth
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── auth_service.py      # Business logic for auth
│   │   └── middleware/
│   │       ├── __init__.py
│   │       └── cors.py              # CORS config
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Landing / redirect
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx     # Login page (fields + logic, design = yours)
│   │   │   │   ├── signup/page.tsx    # Signup page (fields + logic, design = yours)
│   │   │   │   └── forgot-password/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx         # Authenticated layout wrapper
│   │   │       └── dashboard/page.tsx # Dashboard stub
│   │   ├── lib/
│   │   │   ├── axios.ts              # Axios instance + interceptors
│   │   │   └── supabase.ts           # Supabase browser client
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # React context for auth state
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx     # Auth guard component
│   │   └── types/
│   │       └── auth.ts               # TypeScript types for auth
│   ├── .env.local.example
│   ├── package.json                   # (created by create-next-app)
│   └── next.config.js
│
├── docker-compose.yml
└── README.md
```

---

## Proposed Changes

### Supabase Setup (Manual)

SQL to run in Supabase SQL Editor:

```sql
-- profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    skill_level TEXT CHECK (skill_level IN ('junior', 'medium', 'senior')),
    available_hours_per_day NUMERIC DEFAULT 4,
    preferred_pace TEXT CHECK (preferred_pace IN ('relaxed', 'medium', 'aggressive')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

---

### Backend — Config & Dependencies

#### [NEW] [.env.example](file:///home/moneeb/moneeb/projects/spm_agent/backend/.env.example)
Environment template with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `FRONTEND_URL`.

#### [NEW] [requirements.txt](file:///home/moneeb/moneeb/projects/spm_agent/backend/requirements.txt)
Dependencies: `fastapi`, `uvicorn`, `supabase`, `python-dotenv`, `pydantic-settings`, `python-jose[cryptography]`, `httpx`.

#### [NEW] [config.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/config.py)
Pydantic `Settings` class loading from `.env`.

#### [NEW] [supabase_client.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/supabase_client.py)
Singleton Supabase client using service role key.

---

### Backend — Auth System

#### [NEW] [schemas/auth.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/schemas/auth.py)
Pydantic models: `SignUpRequest`, `LoginRequest`, `AuthResponse`, `UserProfile`, `UpdateProfileRequest`.

#### [NEW] [services/auth_service.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/services/auth_service.py)
Business logic: `sign_up()`, `sign_in()`, `sign_out()`, `refresh_token()`, `get_profile()`, `update_profile()`. All call Supabase Auth API.

#### [NEW] [dependencies.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/dependencies.py)
`get_current_user` dependency — decodes JWT from `Authorization: Bearer <token>` header, verifies with Supabase JWT secret.

#### [NEW] [routers/auth.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/routers/auth.py)
Endpoints:
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns tokens |
| POST | `/api/auth/logout` | Yes | Logout |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/me` | Yes | Update profile |

#### [NEW] [middleware/cors.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/middleware/cors.py)
CORS setup allowing `FRONTEND_URL` origin.

#### [NEW] [main.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/main.py)
FastAPI app with CORS middleware, includes auth router, health-check endpoint.

---

### Backend — Docker

#### [NEW] [Dockerfile](file:///home/moneeb/moneeb/projects/spm_agent/backend/Dockerfile)
Python 3.11 slim image, installs deps, runs uvicorn.

#### [NEW] [docker-compose.yml](file:///home/moneeb/moneeb/projects/spm_agent/docker-compose.yml)
Services: `backend` (port 8000). Ready to add `frontend` service later.

---

### Frontend — Setup & Config

#### [NEW] [.env.local.example](file:///home/moneeb/moneeb/projects/spm_agent/frontend/.env.local.example)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`.

#### [NEW] [types/auth.ts](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/types/auth.ts)
TypeScript interfaces: `User`, `AuthTokens`, `LoginRequest`, `SignUpRequest`, `UserProfile`.

#### [NEW] [lib/supabase.ts](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/lib/supabase.ts)
Supabase browser client using `@supabase/supabase-js`.

#### [NEW] [lib/axios.ts](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/lib/axios.ts)
Axios instance with `baseURL` pointing to backend, interceptors for:
- Attaching `Authorization` header from stored token
- Auto-refreshing on 401 responses

---

### Frontend — Auth Logic

#### [NEW] [context/AuthContext.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/context/AuthContext.tsx)
React context providing: `user`, `loading`, `login()`, `signup()`, `logout()`, `refreshUser()`. Persists session via Supabase client-side listener `onAuthStateChange`.

#### [NEW] [components/ProtectedRoute.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/components/ProtectedRoute.tsx)
Wraps children; redirects to `/login` if not authenticated.

---

### Frontend — Page Stubs (Design = Yours)

Each page file will contain:
- A top comment block listing **all fields, buttons, and expected behavior**
- All `useState` hooks, form handlers, API calls, and error handling
- A placeholder `return` with basic field names — **you design the UI with Tailwind**

#### [NEW] [login/page.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/app/(auth)/login/page.tsx)
#### [NEW] [signup/page.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/app/(auth)/signup/page.tsx)
#### [NEW] [forgot-password/page.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/app/(auth)/forgot-password/page.tsx)
#### [NEW] [dashboard/layout.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/app/(dashboard)/layout.tsx)
#### [NEW] [dashboard/page.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/app/(dashboard)/dashboard/page.tsx)
#### [NEW] [layout.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/app/layout.tsx)
#### [NEW] [page.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/app/page.tsx)

---

## Verification Plan

### Manual Verification (by you)

1. **Backend startup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env   # fill in your Supabase keys
   uvicorn app.main:app --reload
   ```
   Visit `http://localhost:8000/docs` — you should see Swagger UI with all auth endpoints.

2. **Test signup**: POST to `/api/auth/signup` with `{"email": "test@test.com", "password": "Test1234!", "full_name": "Test User"}`. Should return `access_token` + `refresh_token`.

3. **Test login**: POST to `/api/auth/login` with the same email/password. Should return tokens.

4. **Test `/api/auth/me`**: GET with `Authorization: Bearer <access_token>`. Should return user profile.

5. **Frontend startup**:
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local   # fill in keys
   npm run dev
   ```
   Visit `http://localhost:3000` — should redirect to login page. After login, should redirect to dashboard.

> [!TIP]
> I recommend testing the backend with Swagger UI (`/docs`) or Postman first before integrating with the frontend.
