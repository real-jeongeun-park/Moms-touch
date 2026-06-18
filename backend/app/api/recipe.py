from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from typing import Optional
import os, json
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

router = APIRouter()

def serialize_row(row):
    r = dict(row)
    for key, val in r.items():
        if hasattr(val, 'isoformat'):
            r[key] = val.isoformat()
    return r

def get_db():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class RecipeRequest(BaseModel):
    transcript: str
    region: str

class SaveRecipeRequest(BaseModel):
    title: str
    description: str
    region: str
    duration: int
    difficulty: int
    ingredients: dict
    steps: list
    user_id: int = 1

class FollowRequest(BaseModel):
    user_id: int
    recipe_id: int


class Ingredient(BaseModel):
    name: str
    amount: str

class RecipeStep(BaseModel):
    id: int
    step_order: int
    title: Optional[str] = None
    description: Optional[str] = None
    timestamp: Optional[int] = None

class RecipeDetail(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    region: Optional[str] = None
    duration: Optional[int] = None
    difficulty: Optional[int] = None
    ingredients: list[Ingredient] = []
    steps: list[RecipeStep] = []

@router.post("/generate-recipe")
async def generate_recipe(req: RecipeRequest):
    prompt = f"""
        다음은 한국 가정식 레시피를 말로 설명한 내용이야:
        "{req.transcript}"

        위 내용을 분석해서 아래 JSON 형식으로만 응답해. 다른 말은 절대 하지 마. 마크다운 코드블록도 쓰지 마.

        {{
        "title": "요리 이름 (짧게)",
        "description": "요리에 대한 한 줄 설명",
        "ingredients": {{"재료명": "양/단위"}},
        "difficulty": 1~3 사이 숫자 (1=쉬움, 2=보통, 3=어려움),
        "duration": 전체 예상 소요 시간 (분 단위 숫자만),
        "steps": [
            {{
            "step_order": 1에서부터 1씩 증가,
            "title": "단계 제목 (짧게)",
            "description": "이 단계에서 해야 할 일 자세하게",
            "timestamp": "해당 단계의 예상 소요 시간 (분 단위 숫자)"
            }}
        ]
        }}

        주의할 점:
        1) steps는 실제 조리 흐름에 맞게 여러 개로 나눠줘.
        2) druation은 전체 예상 소요 시간이므로 각 step의 timestamp를 모두 더한 값이 되어야 해.
        """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
    except Exception as e:
        print(f"OpenAI 호출 에러: {e}")
        raise HTTPException(status_code=502, detail=f"AI 응답 생성에 실패했어요: {e}")

    raw = response.choices[0].message.content.strip()

    # 혹시 ```json ... ``` 코드펜스로 감싸 오면 벗겨낸다
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lstrip().lower().startswith("json"):
            raw = raw.lstrip()[4:]
        raw = raw.strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 에러: {e}\n원본 응답: {raw}")
        raise HTTPException(status_code=502, detail="AI가 올바른 형식으로 응답하지 않았어요. 다시 시도해 주세요.")

    result["region"] = req.region
    return result

@router.post("/save-recipe")
async def save_recipe(req: SaveRecipeRequest):
    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO recipes (user_id, title, description, region, duration, difficulty, ingredients)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            req.user_id,
            req.title,
            req.description,
            req.region,
            req.duration,
            req.difficulty,
            json.dumps(req.ingredients, ensure_ascii=False),
        ))

        recipe_id = cur.fetchone()[0]

        for step in req.steps:
            cur.execute("""
                INSERT INTO recipe_steps (recipe_id, step_order, title, description, timestamp)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                recipe_id,
                step["step_order"],
                step["title"],
                step["description"],
                int(step["timestamp"])
            ))

        conn.commit()
        return {"success": True, "recipe_id": recipe_id}

    except Exception as e:
        conn.rollback()
        print(f"DB 에러: {e}")
        raise

    finally:
        cur.close()
        conn.close()

@router.get("/get-recipe/{recipe_id}", response_model=RecipeDetail)
async def get_recipe(recipe_id: int):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # recipes 테이블
        cursor.execute("SELECT * FROM recipes WHERE id = %s", (recipe_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="레시피를 찾을 수 없어요")

        # column명 → dict 변환
        col_names = [desc[0] for desc in cursor.description]
        recipe = dict(zip(col_names, row))

        # recipe_steps 테이블
        cursor.execute(
            "SELECT * FROM recipe_steps WHERE recipe_id = %s ORDER BY step_order",
            (recipe_id,)
        )
        step_cols = [desc[0] for desc in cursor.description]
        steps = [dict(zip(step_cols, r)) for r in cursor.fetchall()]

        raw = recipe.get("ingredients") or {}
        if isinstance(raw, str):
            import json
            raw = json.loads(raw)

        ingredients = [{"name": k, "amount": v} for k, v in raw.items()]

        return {
            **recipe,
            "ingredients": ingredients,
            "steps": steps,
        }
    
    finally:
        cursor.close()
        conn.close()


@router.get("/recipes")
async def get_recipes(region: Optional[str] = Query(None)):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if region:
            cur.execute("""
                SELECT r.id, r.title, r.description, r.region, r.duration, r.difficulty, r.ingredients, r.created_at,
                       u.user_id AS author
                FROM recipes r LEFT JOIN users u ON r.user_id = u.id
                WHERE r.region = %s ORDER BY r.created_at DESC
            """, (region,))
        else:
            cur.execute("""
                SELECT r.id, r.title, r.description, r.region, r.duration, r.difficulty, r.ingredients, r.created_at,
                       u.user_id AS author
                FROM recipes r LEFT JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC
            """)
        return {"recipes": [serialize_row(r) for r in cur.fetchall()]}
    finally:
        cur.close()
        conn.close()


@router.get("/recipes/recommended")
async def get_recommended_recipes(user_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT preferred_region, preferred_difficulty FROM user_preferences WHERE user_id = %s", (user_id,))
        pref = cur.fetchone()
        cur.execute("""
            SELECT r.id, r.title, r.description, r.region, r.duration, r.difficulty, r.created_at,
                   u.user_id AS author
            FROM recipes r LEFT JOIN users u ON r.user_id = u.id
        """)
        recipes = cur.fetchall()
        if not pref:
            return {"recipes": [serialize_row(r) for r in recipes[:10]]}
        region = pref["preferred_region"]
        pref_diff = pref["preferred_difficulty"]
        if pref_diff <= 2:
            target_diff = 1
        elif pref_diff == 3:
            target_diff = 2
        else:
            target_diff = 3
        scored = []
        for r in recipes:
            score = 0
            if r["region"] == region:
                score += 3
            if r["difficulty"] == target_diff:
                score += 2
            scored.append((score, r))
        scored.sort(key=lambda x: x[0], reverse=True)
        return {"recipes": [serialize_row(r) for _, r in scored[:10]]}
    finally:
        cur.close()
        conn.close()


@router.get("/recipes/{recipe_id}")
async def get_recipe_by_id(recipe_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT r.*, u.user_id AS author
            FROM recipes r LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = %s
        """, (recipe_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="레시피를 찾을 수 없어요")
        recipe = serialize_row(row)
        if isinstance(recipe.get("ingredients"), str):
            recipe["ingredients"] = json.loads(recipe["ingredients"])
        cur.execute("SELECT * FROM recipe_steps WHERE recipe_id = %s ORDER BY step_order", (recipe_id,))
        recipe["steps"] = [serialize_row(s) for s in cur.fetchall()]
        return recipe
    finally:
        cur.close()
        conn.close()


@router.post("/recipe-follows")
async def follow_recipe(req: FollowRequest):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO recipe_follows (user_id, recipe_id)
            VALUES (%s, %s)
            ON CONFLICT (user_id, recipe_id) DO NOTHING
        """, (req.user_id, req.recipe_id))
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        print(f"follow 에러: {e}")
        raise
    finally:
        cur.close()
        conn.close()


@router.delete("/recipe-follows")
async def unfollow_recipe(req: FollowRequest):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "DELETE FROM recipe_follows WHERE user_id = %s AND recipe_id = %s",
            (req.user_id, req.recipe_id),
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        print(f"unfollow 에러: {e}")
        raise
    finally:
        cur.close()
        conn.close()


@router.post("/recipes/{recipe_id}/use")
async def increment_use_count(recipe_id: int):
    """레시피 따라하기 완료 시 도전자 수(use_count) +1"""
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE recipes SET use_count = COALESCE(use_count, 0) + 1 WHERE id = %s",
            (recipe_id,),
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        print(f"use_count 증가 에러: {e}")
        raise
    finally:
        cur.close()
        conn.close()


@router.get("/users/{user_id}/recipes/made")
async def get_made_recipes(user_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT id, title, description, region, duration, difficulty, created_at
            FROM recipes WHERE user_id = %s ORDER BY created_at DESC
        """, (user_id,))
        return {"recipes": [serialize_row(r) for r in cur.fetchall()]}
    finally:
        cur.close()
        conn.close()


@router.get("/users/{user_id}/recipes/followed")
async def get_followed_recipes(user_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT r.id, r.title, r.description, r.region, r.duration, r.difficulty, r.created_at
            FROM recipes r
            JOIN recipe_follows rf ON r.id = rf.recipe_id
            WHERE rf.user_id = %s ORDER BY rf.created_at DESC
        """, (user_id,))
        return {"recipes": [serialize_row(r) for r in cur.fetchall()]}
    finally:
        cur.close()
        conn.close()


@router.get("/users/by-nickname/{nickname}/profile")
async def get_user_profile_by_nickname(nickname: str):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id, user_id FROM users WHERE user_id = %s", (nickname,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없어요")
        uid = user["id"]

        # 만든 레시피
        cur.execute("""
            SELECT r.id, r.title, r.description, r.region, r.duration, r.difficulty, r.created_at,
                   u.user_id AS author
            FROM recipes r LEFT JOIN users u ON r.user_id = u.id
            WHERE r.user_id = %s ORDER BY r.created_at DESC
        """, (uid,))
        made = [serialize_row(r) for r in cur.fetchall()]

        # 좋아요 누른 레시피
        cur.execute("""
            SELECT r.id, r.title, r.description, r.region, r.duration, r.difficulty, r.created_at,
                   u.user_id AS author
            FROM recipes r
            JOIN recipe_follows rf ON r.id = rf.recipe_id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE rf.user_id = %s ORDER BY rf.created_at DESC
        """, (uid,))
        liked = [serialize_row(r) for r in cur.fetchall()]

        # 좋아요 받은 수 (내가 만든 레시피들에 달린 좋아요 총합)
        cur.execute("""
            SELECT COUNT(*) AS cnt
            FROM recipe_follows rf JOIN recipes r ON rf.recipe_id = r.id
            WHERE r.user_id = %s
        """, (uid,))
        like_received = cur.fetchone()["cnt"]

        # 레시피 도전자 수 (내 레시피들의 use_count 합)
        cur.execute("SELECT COALESCE(SUM(use_count), 0) AS cnt FROM recipes WHERE user_id = %s", (uid,))
        challenger = cur.fetchone()["cnt"]

        return {
            "user": user,
            "made": made,
            "liked": liked,
            "stats": {
                "recipe_count": len(made),
                "challenger_count": challenger,
                "like_received": like_received,
            },
        }
    finally:
        cur.close()
        conn.close()