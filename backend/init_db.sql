CREATE TABLE IF NOT EXISTS public.users (
    id bigserial PRIMARY KEY,
    user_id character varying(50) NOT NULL UNIQUE,
    password character varying(255),
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id bigint PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_region character varying(50),
    preferred_food_type character varying(50),
    preferred_difficulty smallint
);

CREATE TABLE IF NOT EXISTS public.recipes (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    region character varying(50),
    duration integer,
    difficulty smallint,
    ingredients jsonb,
    use_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_steps (
    id bigserial PRIMARY KEY,
    recipe_id bigint NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    step_order integer NOT NULL,
    title character varying(100),
    description text,
    "timestamp" integer
);

CREATE TABLE IF NOT EXISTS public.recipe_follows (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipe_id bigint NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    created_at timestamp without time zone DEFAULT now(),
    UNIQUE (user_id, recipe_id)
);
