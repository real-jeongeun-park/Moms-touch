from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from typing import Optional
import os, json
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

router = APIRouter()

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

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()
    result = json.loads(raw)
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
            1,  # 하드코딩
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