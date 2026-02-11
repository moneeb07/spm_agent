# SPM Agent — Setup Walkthrough

Everything is built. This walkthrough tells you how to set it all up.

---

## What Was Created

### Backend ([backend/](file:///home/moneeb/moneeb/projects/spm_agent/backend))

| File | Purpose |
|------|---------|
| [config.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/config.py) | Env vars via Pydantic Settings |
| [supabase_client.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/supabase_client.py) | Supabase admin client (service role key) |
| [schemas/auth.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/schemas/auth.py) | Request/response Pydantic models |
| [services/auth_service.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/services/auth_service.py) | Auth business logic (signup, login, refresh, profile) |
| [dependencies.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/dependencies.py) | JWT validation dependency |
| [routers/auth.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/routers/auth.py) | 8 auth endpoints |
| [middleware/cors.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/middleware/cors.py) | CORS config |
| [main.py](file:///home/moneeb/moneeb/projects/spm_agent/backend/app/main.py) | FastAPI app entry point |
| [Dockerfile](file:///home/moneeb/moneeb/projects/spm_agent/backend/Dockerfile) | Docker image |

**API Endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | ✗ | Register |
| POST | `/api/auth/login` | ✗ | Login → tokens |
| POST | `/api/auth/refresh` | ✗ | Refresh token |
| POST | `/api/auth/forgot-password` | ✗ | Send reset email |
| POST | `/api/auth/reset-password` | ✗ | Reset with token |
| POST | `/api/auth/logout` | ✓ | Logout |
| GET | `/api/auth/me` | ✓ | Get profile |
| PUT | `/api/auth/me` | ✓ | Update profile |

### Frontend ([frontend/](file:///home/moneeb/moneeb/projects/spm_agent/frontend))

| File | Purpose |
|------|---------|
| [types/auth.ts](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/types/auth.ts) | TypeScript interfaces |
| [lib/supabase.ts](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/lib/supabase.ts) | Supabase browser client |
| [lib/axios.ts](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/lib/axios.ts) | Axios + auto-refresh interceptor |
| [context/AuthContext.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/context/AuthContext.tsx) | Auth state + login/signup/logout |
| [components/ProtectedRoute.tsx](file:///home/moneeb/moneeb/projects/spm_agent/frontend/src/components/ProtectedRoute.tsx) | Auth guard component |
| Page stubs | Login, Signup, Forgot Password, Dashboard — **all logic done, design is yours** |

---

## Step-by-Step Setup

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Go to **Authentication → Providers** → enable **Email**
3. Go to **SQL Editor** → run this SQL:

```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    skill_level TEXT CHECK (skill_level IN ('junior', 'medium', 'senior')),
    available_hours_per_day NUMERIC DEFAULT 4,
    preferred_pace TEXT CHECK (preferred_pace IN ('relaxed', 'medium', 'aggressive')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

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
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Collect your keys from **Settings → API**:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon public)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role secret)
   - `SUPABASE_JWT_SECRET` (from Settings → API → JWT Settings)

### 2. Backend Setup

```bash
cd ~/moneeb/projects/spm_agent/backend

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure env
cp .env.example .env
# Edit .env and fill in your Supabase keys

# Run the server
uvicorn app.main:app --reload
```

Visit **http://localhost:8000/docs** — you should see all auth endpoints in Swagger UI.

### 3. Frontend Setup

```bash
cd ~/moneeb/projects/spm_agent/frontend

# Initialize Next.js (only the framework files — our src/ code is already written)
npx -y create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

> [!IMPORTANT]
> When prompted "The directory is not empty. Overwrite? (y/N)", choose **y**. Our `src/` files will be preserved or you can re-copy them if needed.

```bash
# Install additional dependencies
npm install axios @supabase/supabase-js

# Configure env
cp .env.local.example .env.local
# Edit .env.local and fill in your keys

# Run the dev server
npm run dev
```

Visit **http://localhost:3000** — should redirect to login page.

### 4. Test the Flow

1. Open **http://localhost:8000/docs** (Swagger UI)
2. Try `POST /api/auth/signup` with:
   ```json
   {"email": "test@test.com", "password": "Test1234!", "full_name": "Test User"}
   ```
3. Copy the `access_token` from the response
4. Click **Authorize** in Swagger → paste the token
5. Try `GET /api/auth/me` — should return your profile
6. Now test the frontend at **http://localhost:3000**

---

## Your Next Steps (Design)

Each page file has a big comment block at the top listing **every field, button, and link**. The logic (state, handlers, API calls) is all wired up. You just need to:

1. Open each page file
2. Read the comment block
3. Replace the bare HTML with your Tailwind design
4. The state variables and handlers are already there — just bind them to your styled inputs/buttons
