INSERT INTO recipes (user_id, title, description, region, duration, difficulty, ingredients, use_count, created_at)
VALUES (1, '된장찌개', '한국 전통 된장으로 만든 찌개', '충청남도', 30, 1,
  '{"감자": "1개", "대파": "조금", "된장": "2큰술", "두부": "반모", "양파": "반개", "애호박": "반개", "멸치육수": "500ml"}',
  0, now())
RETURNING id;

INSERT INTO recipe_steps (recipe_id, step_order, title, description, timestamp)
SELECT id, 1, '육수 끓이기', '멸치 육수를 끓입니다.', 5 FROM recipes WHERE title = '된장찌개' ORDER BY id DESC LIMIT 1;

INSERT INTO recipe_steps (recipe_id, step_order, title, description, timestamp)
SELECT id, 2, '된장 풀기', '끓는 육수에 된장을 풀어줍니다.', 2 FROM recipes WHERE title = '된장찌개' ORDER BY id DESC LIMIT 1;

INSERT INTO recipe_steps (recipe_id, step_order, title, description, timestamp)
SELECT id, 3, '감자와 양파 넣기', '감자와 양파를 넣고 5분 끓입니다.', 5 FROM recipes WHERE title = '된장찌개' ORDER BY id DESC LIMIT 1;

INSERT INTO recipe_steps (recipe_id, step_order, title, description, timestamp)
SELECT id, 4, '두부와 애호박 넣기', '두부와 애호박을 넣고 10분 더 끓입니다.', 10 FROM recipes WHERE title = '된장찌개' ORDER BY id DESC LIMIT 1;

INSERT INTO recipe_steps (recipe_id, step_order, title, description, timestamp)
SELECT id, 5, '대파 넣기', '마지막에 대파를 넣고 불을 끕니다.', 3 FROM recipes WHERE title = '된장찌개' ORDER BY id DESC LIMIT 1;
