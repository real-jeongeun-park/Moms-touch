from fastapi import APIRouter
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import os

router = APIRouter()

def get_db():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

class SignupRequest(BaseModel):
    user_id: str  # 닉네임

class LoginRequest(BaseModel):
    user_id: str

class PreferencesRequest(BaseModel):
    user_id: int
    preferred_region: str
    preferred_food_type: str
    preferred_difficulty: int

@router.post("/auth/signup")
async def signup(req: SignupRequest):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "INSERT INTO users (user_id, password) VALUES (%s, %s) RETURNING id, user_id",
            (req.user_id, req.user_id)
        )
        user = dict(cur.fetchone())
        conn.commit()
        return {"success": True, "user": user}
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return {"success": False, "message": "이미 사용 중인 닉네임이에요"}
    except Exception as e:
        conn.rollback()
        print(f"signup 에러: {e}")
        raise
    finally:
        cur.close()
        conn.close()

@router.post("/preferences")
async def save_preferences(req: PreferencesRequest):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO user_preferences (user_id, preferred_region, preferred_food_type, preferred_difficulty)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                preferred_region = EXCLUDED.preferred_region,
                preferred_food_type = EXCLUDED.preferred_food_type,
                preferred_difficulty = EXCLUDED.preferred_difficulty
        """, (req.user_id, req.preferred_region, req.preferred_food_type, req.preferred_difficulty))
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        print(f"preferences 에러: {e}")
        raise
    finally:
        cur.close()
        conn.close()

@router.post("/auth/login")
async def login(req: LoginRequest):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "SELECT id, user_id FROM users WHERE user_id = %s",
            (req.user_id,)
        )
        user = cur.fetchone()
        if not user:
            return {"success": False, "message": "존재하지 않는 닉네임이에요"}
        return {"success": True, "user": dict(user)}
    except Exception as e:
        print(f"login 에러: {e}")
        raise
    finally:
        cur.close()
        conn.close()
