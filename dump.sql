--
-- PostgreSQL database dump
--

\restrict RjMvBaATytsMEj8N5v8wvwLBUgkDVlutDWFSAb3JNgsZz9Ct7J4YBzG875Ha7Yc

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: recipe_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_steps (
    id bigint NOT NULL,
    recipe_id bigint NOT NULL,
    step_order integer NOT NULL,
    title character varying(100),
    description text,
    "timestamp" integer
);


ALTER TABLE public.recipe_steps OWNER TO postgres;

--
-- Name: recipe_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipe_steps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipe_steps_id_seq OWNER TO postgres;

--
-- Name: recipe_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipe_steps_id_seq OWNED BY public.recipe_steps.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipes (
    id bigint NOT NULL,
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


ALTER TABLE public.recipes OWNER TO postgres;

--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipes_id_seq OWNER TO postgres;

--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: recipe_steps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_steps ALTER COLUMN id SET DEFAULT nextval('public.recipe_steps_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Data for Name: recipe_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipe_steps (id, recipe_id, step_order, title, description, "timestamp") FROM stdin;
1	1	1	육수 끓이기	멸치 육수를 끓입니다.	5
2	1	2	된장 풀기	끓는 육수에 된장을 풀어줍니다.	2
3	1	3	감자와 양파 넣기	감자와 양파를 넣고 5분 정도 끓입니다.	5
4	1	4	두부와 애호박 넣기	두부와 애호박을 넣고 10분 더 끓입니다.	10
5	1	5	대파 넣기	마지막에 대파를 넣고 불을 끕니다.	3
6	2	1	육수 끓이기	멸치 육수를 끓입니다.	5
7	2	2	된장 풀기	끓는 육수에 된장을 풀어줍니다.	2
8	2	3	감자와 양파 넣기	감자와 양파를 넣고 5분 정도 끓입니다.	5
9	2	4	두부와 애호박 넣기	두부와 애호박을 넣고 10분 더 끓입니다.	10
10	2	5	대파 넣기	마지막에 대파를 넣고 불을 끕니다.	3
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipes (id, user_id, title, description, region, duration, difficulty, ingredients, use_count, created_at) FROM stdin;
1	1	된장찌개	한국 전통 된장으로 만든 찌개	충청남도	30	1	{"감자": "1 개", "대파": "조금", "된장": "2 큰술", "두부": "반 모", "양파": "반 개", "애호박": "반 개", "멸치 육수": "500 밀리리터"}	0	2026-06-17 22:41:05.849004
2	1	된장찌개	한국 전통 된장으로 만든 찌개	충청남도	30	1	{"감자": "1 개", "대파": "조금", "된장": "2 큰술", "두부": "반 모", "양파": "반 개", "애호박": "반 개", "멸치 육수": "500 밀리리터"}	0	2026-06-17 22:42:06.997214
\.


--
-- Name: recipe_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recipe_steps_id_seq', 10, true);


--
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recipes_id_seq', 2, true);


--
-- Name: recipe_steps recipe_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_steps
    ADD CONSTRAINT recipe_steps_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: recipe_steps recipe_steps_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_steps
    ADD CONSTRAINT recipe_steps_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict RjMvBaATytsMEj8N5v8wvwLBUgkDVlutDWFSAb3JNgsZz9Ct7J4YBzG875Ha7Yc

