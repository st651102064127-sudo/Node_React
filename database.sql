--
-- PostgreSQL database dump
--

\restrict PwYNAOaguo3Fc9dksMHr7GzDttxDud4Qwqi9FnOllL0G6M8KKhk5JGXwpqVWFOz

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-19 03:15:14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 233 (class 1259 OID 40993)
-- Name: attendance; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    enrollment_id integer,
    date date NOT NULL,
    status character varying(10) NOT NULL,
    "time" time without time zone
);


ALTER TABLE public.attendance OWNER TO root;

--
-- TOC entry 232 (class 1259 OID 40992)
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO root;

--
-- TOC entry 3541 (class 0 OID 0)
-- Dependencies: 232
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- TOC entry 231 (class 1259 OID 40962)
-- Name: classrooms; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.classrooms (
    classroom_id integer NOT NULL,
    course_id character varying(20),
    section character varying(10),
    year integer,
    semester integer,
    instructor_id character varying(20),
    "Start" time with time zone,
    "End" time without time zone,
    "Late" time without time zone
);


ALTER TABLE public.classrooms OWNER TO root;

--
-- TOC entry 230 (class 1259 OID 40961)
-- Name: classrooms_classroom_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.classrooms_classroom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classrooms_classroom_id_seq OWNER TO root;

--
-- TOC entry 3542 (class 0 OID 0)
-- Dependencies: 230
-- Name: classrooms_classroom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.classrooms_classroom_id_seq OWNED BY public.classrooms.classroom_id;


--
-- TOC entry 223 (class 1259 OID 16733)
-- Name: courses; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.courses (
    course_id character varying(32) NOT NULL,
    course_name character varying(100) NOT NULL,
    instructor_id character varying(32)
);


ALTER TABLE public.courses OWNER TO root;

--
-- TOC entry 222 (class 1259 OID 16732)
-- Name: courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_course_id_seq OWNER TO root;

--
-- TOC entry 3543 (class 0 OID 0)
-- Dependencies: 222
-- Name: courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;


--
-- TOC entry 220 (class 1259 OID 16697)
-- Name: departments; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(100) NOT NULL,
    faculty_id integer NOT NULL
);


ALTER TABLE public.departments OWNER TO root;

--
-- TOC entry 219 (class 1259 OID 16696)
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_department_id_seq OWNER TO root;

--
-- TOC entry 3544 (class 0 OID 0)
-- Dependencies: 219
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- TOC entry 235 (class 1259 OID 41008)
-- Name: enrollments; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    classroom_id integer NOT NULL,
    student_id character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.enrollments OWNER TO root;

--
-- TOC entry 234 (class 1259 OID 41007)
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO root;

--
-- TOC entry 3545 (class 0 OID 0)
-- Dependencies: 234
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- TOC entry 225 (class 1259 OID 16762)
-- Name: face_data; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.face_data (
    id integer NOT NULL,
    user_id character varying(32),
    face_embedding text
);


ALTER TABLE public.face_data OWNER TO root;

--
-- TOC entry 224 (class 1259 OID 16761)
-- Name: face_data_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.face_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.face_data_id_seq OWNER TO root;

--
-- TOC entry 3546 (class 0 OID 0)
-- Dependencies: 224
-- Name: face_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.face_data_id_seq OWNED BY public.face_data.id;


--
-- TOC entry 218 (class 1259 OID 16688)
-- Name: faculties; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.faculties (
    faculty_id integer NOT NULL,
    faculty_name character varying(100) NOT NULL
);


ALTER TABLE public.faculties OWNER TO root;

--
-- TOC entry 217 (class 1259 OID 16687)
-- Name: faculties_faculty_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.faculties_faculty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faculties_faculty_id_seq OWNER TO root;

--
-- TOC entry 3547 (class 0 OID 0)
-- Dependencies: 217
-- Name: faculties_faculty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.faculties_faculty_id_seq OWNED BY public.faculties.faculty_id;


--
-- TOC entry 227 (class 1259 OID 16776)
-- Name: notifications; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id character varying(32),
    message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO root;

--
-- TOC entry 226 (class 1259 OID 16775)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO root;

--
-- TOC entry 3548 (class 0 OID 0)
-- Dependencies: 226
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 216 (class 1259 OID 16679)
-- Name: roles; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO root;

--
-- TOC entry 215 (class 1259 OID 16678)
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_role_id_seq OWNER TO root;

--
-- TOC entry 3549 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- TOC entry 229 (class 1259 OID 24595)
-- Name: user_photos; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.user_photos (
    id integer NOT NULL,
    user_id character varying(20) NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    is_primary boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_photos OWNER TO root;

--
-- TOC entry 228 (class 1259 OID 24594)
-- Name: user_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.user_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_photos_id_seq OWNER TO root;

--
-- TOC entry 3550 (class 0 OID 0)
-- Dependencies: 228
-- Name: user_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.user_photos_id_seq OWNED BY public.user_photos.id;


--
-- TOC entry 221 (class 1259 OID 16710)
-- Name: users; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.users (
    user_id character varying(32) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    role_id integer NOT NULL,
    faculty_id integer,
    department_id integer,
    birth_date date
);


ALTER TABLE public.users OWNER TO root;

--
-- TOC entry 3326 (class 2604 OID 40996)
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- TOC entry 3325 (class 2604 OID 40965)
-- Name: classrooms classroom_id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.classrooms ALTER COLUMN classroom_id SET DEFAULT nextval('public.classrooms_classroom_id_seq'::regclass);


--
-- TOC entry 3318 (class 2604 OID 16700)
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- TOC entry 3327 (class 2604 OID 41011)
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- TOC entry 3319 (class 2604 OID 16765)
-- Name: face_data id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.face_data ALTER COLUMN id SET DEFAULT nextval('public.face_data_id_seq'::regclass);


--
-- TOC entry 3317 (class 2604 OID 16691)
-- Name: faculties faculty_id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.faculties ALTER COLUMN faculty_id SET DEFAULT nextval('public.faculties_faculty_id_seq'::regclass);


--
-- TOC entry 3320 (class 2604 OID 16779)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3316 (class 2604 OID 16682)
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- TOC entry 3322 (class 2604 OID 24598)
-- Name: user_photos id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_photos ALTER COLUMN id SET DEFAULT nextval('public.user_photos_id_seq'::regclass);


--
-- TOC entry 3533 (class 0 OID 40993)
-- Dependencies: 233
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.attendance (id, enrollment_id, date, status, "time") FROM stdin;
\.


--
-- TOC entry 3531 (class 0 OID 40962)
-- Dependencies: 231
-- Data for Name: classrooms; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.classrooms (classroom_id, course_id, section, year, semester, instructor_id, "Start", "End", "Late") FROM stdin;
1	CS102	1	2568	1	651102064128	\N	\N	\N
2	CS102	2	2568	1	651102064128	\N	\N	\N
\.


--
-- TOC entry 3523 (class 0 OID 16733)
-- Dependencies: 223
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.courses (course_id, course_name, instructor_id) FROM stdin;
TEST0198479	Programing Basicกหฟdsadasdasdsa	\N
CS103	Computer Programming II	\N
CS106	Computer Architecture	\N
CS107	Operating Systems	\N
CS108	Database Systems	\N
CS109	Computer Networks	\N
CS111	Object-Oriented Programming	\N
CS112	Software Engineering	\N
CS113	Human-Computer Interaction	\N
CS114	Algorithm Design and Analysis	\N
CS115	Mobile Application Development	\N
CS201	Artificial Intelligence	\N
CS202	Machine Learning	\N
CS203	Deep Learning	\N
CS204	Embedded Systems	\N
CS205	System Analysis and Design	\N
IT102	Digital Literacy	\N
IT103	System Administration	\N
IT104	Network Security Fundamentals	\N
IT105	Cloud Computing Basics	\N
IT106	Data Analytics	\N
IT107	Cybersecurity Essentials	\N
IT108	Web Technology	\N
IT109	IT Project Management	\N
IT110	Digital Transformation Strategy	\N
CS110	Web Programming1	\N
CS105	Data Structures and Algorithms	\N
IT101	Introduction to Information Technology	\N
CS104	Discrete Mathematics	\N
CS102	Computer Programming I	651102064128
\.


--
-- TOC entry 3520 (class 0 OID 16697)
-- Dependencies: 220
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.departments (department_id, department_name, faculty_id) FROM stdin;
1	วิทยาการคอมพิวเตอร์	1
2	เทคโนโลยีสาระสนเทศ	1
3	วิทยาศาตร์เคมี	1
5	คอมพิวเตอร์ธุรกิจดิจิทัล	11
\.


--
-- TOC entry 3535 (class 0 OID 41008)
-- Dependencies: 235
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.enrollments (id, classroom_id, student_id, created_at) FROM stdin;
2	2	651102064101	2025-11-18 18:52:09.821864
3	2	651102064102	2025-11-18 18:52:09.821864
16	1	651102064100	2025-11-18 18:59:52.485071
18	2	651102064104	2025-11-18 19:26:51.387761
19	2	651102064103	2025-11-18 19:26:51.389242
20	2	651102064105	2025-11-18 19:26:51.390858
21	2	651102064107	2025-11-18 19:26:51.392483
24	2	651102064106	2025-11-18 19:56:21.048329
25	2	651102064108	2025-11-18 19:56:21.053914
26	2	651102064109	2025-11-18 19:56:21.056548
27	2	651102064110	2025-11-18 19:56:21.059329
28	2	651102064111	2025-11-18 19:56:21.062166
29	2	651102064112	2025-11-18 19:56:21.065173
30	2	651102064113	2025-11-18 19:56:21.068296
31	2	651102064114	2025-11-18 19:56:21.071688
32	2	651102064115	2025-11-18 19:56:21.074648
33	2	651102064116	2025-11-18 19:56:21.077329
34	2	651102064117	2025-11-18 19:56:21.080116
35	2	651102064118	2025-11-18 19:56:21.083066
36	2	651102064119	2025-11-18 19:56:21.085546
37	2	651102064120	2025-11-18 19:56:21.087894
\.


--
-- TOC entry 3525 (class 0 OID 16762)
-- Dependencies: 225
-- Data for Name: face_data; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.face_data (id, user_id, face_embedding) FROM stdin;
\.


--
-- TOC entry 3518 (class 0 OID 16688)
-- Dependencies: 218
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.faculties (faculty_id, faculty_name) FROM stdin;
1	คณะวิทยาศาสตร์และเทคโนโลยี
6	คณะมนุษศาสตร์
10	คณะครุศาสตร์
11	คณะวิทยาการจัดการ
\.


--
-- TOC entry 3527 (class 0 OID 16776)
-- Dependencies: 227
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.notifications (id, user_id, message, created_at) FROM stdin;
\.


--
-- TOC entry 3516 (class 0 OID 16679)
-- Dependencies: 216
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.roles (role_id, role_name) FROM stdin;
1	นักศึกษา
2	อาจารย์
3	ผู้ดูแลระบบ
\.


--
-- TOC entry 3529 (class 0 OID 24595)
-- Dependencies: 229
-- Data for Name: user_photos; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.user_photos (id, user_id, file_name, file_path, is_primary, created_at) FROM stdin;
14	651102064128	074f409008ee98ca2bff9725b2583062.png	/Image/Profile/074f409008ee98ca2bff9725b2583062.png	t	2025-11-17 12:26:08.015739
21	Admin	d09d27e7c1936a26c6499cffb8cc5f9b.jpg	/Image/Profile/d09d27e7c1936a26c6499cffb8cc5f9b.jpg	t	2025-11-17 17:52:02.076518
24	651102064127	ff43a68d86fcdd3b8815732124e369d0.png	/Image/Profile/ff43a68d86fcdd3b8815732124e369d0.png	t	2025-11-17 17:59:13.067127
\.


--
-- TOC entry 3521 (class 0 OID 16710)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.users (user_id, password, full_name, email, role_id, faculty_id, department_id, birth_date) FROM stdin;
651102064128	$2b$10$2Icpej7dVkhfjvcIutA5cOSphoEWtLCkbmnsTi3YzGSaRKSF.EmWq	อารจารย์	651102064128@pcru.ac.th	2	1	1	2004-05-22
Admin	$2b$10$KdKgksYOC3gvCxohEV6sl.RYut.UbmJ7gDjKRo56BomFU5ZMVVd7G	คุณชายปอ	admin@admin.com	3	1	1	2025-11-11
651102064127	$2b$10$biyVPkh6LUZsIsMrwsCOeOo7gpJRpjEJEDJtsFXXcjmYq3nRcaXO6	เจษวิทย์ ศรีสุวรรณ	st651102064127@pcru.ac.th	3	1	1	2004-05-22
651102064129	$2b$10$U5oPYvguIHoE4eH21seka.y.xH8nVXK1grBPl5BHQ0RgaM670AbZ6	นักศึกษาตัวน้อยเบอร์1	651102064129@pcru.ac.th	1	1	2	2025-11-13
651102064100	$2b$10$n.YlJYLraEaWsBxABBcxUuEQjEDAwMj8iJ7472TAUKSfTwj9V.uHC	asdasdasdsadsa	651102064100@pcru.ac.th	1	1	1	2004-05-22
651102064101	$2b$10$U1V/FRt2/qHC.KJ.nSDnju/FFKr91jy0CMstEw3PBADJjjBxmCwoy	นักศึกษา  2	651102064101@pcru.ac.th	1	1	1	2005-05-22
651102064102	$2b$10$SGb6A8yA.8ENyi8WI6Rf..Z./gPKAHUVgk7VYkLQ2BKFu6W16PVeC	นักศึกษา  3	651102064102@pcru.ac.th	1	1	1	2006-05-22
651102064103	$2b$10$Qslsvjk7v/qKbdcYq/4wD.iHUu847HdPSF5gueHWY1VZ9mX5fuRja	นักศึกษา  4	651102064103@pcru.ac.th	1	1	1	2007-05-22
651102064104	$2b$10$PX4bfGlCRT1.gT7H.DG5X.oEhSPpKCJ70YWSO1xlfJO9fKc/XPRSm	นักศึกษา  5	651102064104@pcru.ac.th	1	1	1	2008-05-22
651102064105	$2b$10$SqMa5WU9xqtlm98VC5X0IebRqlw/rsPJHq7rjSpd3QZBH4MyB3aVe	นักศึกษา 6	651102064105@pcru.ac.th	1	1	1	2009-05-22
651102064106	$2b$10$oi6YHYLcVMgcuH8ww7zOdeVJJcvHImPbFxs2fJCb51UNzA.8ZT8qe	นักศึกษา  7	651102064106@pcru.ac.th	1	1	1	2010-05-22
651102064107	$2b$10$Ba.2d/XAqSgFWpT5DIXDV.ioeoWcB0fHnCGFx/yd.0C0khsxbg2jW	นักศึกษา 1 8	651102064107@pcru.ac.th	1	1	1	2011-05-22
651102064108	$2b$10$pWMtL7Ufmcf/jUE2C.ucqur8BwqePgXYqxqpcSII41/EKQwoRxAZa	นักศึกษา 1 9	651102064108@pcru.ac.th	1	1	1	2012-05-22
651102064109	$2b$10$7B9iPhjarbW4ygYchVCyR.G/U1N6DdH5TTlA4XAiYP1R4yqCPSSn2	นักศึกษา 1 10	651102064109@pcru.ac.th	1	1	1	2013-05-22
651102064110	$2b$10$Y1kCATpHXxLUXXc33KPtJuF5yyrUYwyIUr2Y/LsPY892kzXBcQii.	นักศึกษา 111	651102064110@pcru.ac.th	1	1	1	2014-05-22
651102064111	$2b$10$vMXgkV7rdez3fQo7neTZtOnfu7YFqx3bg0uaNRQSYQo58e/inR7Ju	นักศึกษา 1 12	651102064111@pcru.ac.th	1	1	1	2015-05-22
651102064112	$2b$10$osIzM/SK.ficGAFQzI./xOJtbzN.qlvURymjvp5f5SmXNYVH9F1Ym	นักศึกษา 113	651102064112@pcru.ac.th	1	1	1	2016-05-22
651102064113	$2b$10$WGn1F/kp2pZbDW7rznEBJ.lMbL/04k4Iqo8TDEL7OV8E1vaiP5tH6	นักศึกษา 114	651102064113@pcru.ac.th	1	1	1	2017-05-22
651102064114	$2b$10$5e5/.a/L9A4Pw.IuBJba5.2qayGxfhmfSsU.7d9BcKaFyPJqDDQly	นักศึกษา 115	651102064114@pcru.ac.th	1	1	1	2018-05-22
651102064115	$2b$10$Ts8aOakcxyi9ceCn1qe49ejjM9bmSLP.fFLZ3AcR3ft9QEGLoQfru	นักศึกษา 116	651102064115@pcru.ac.th	1	1	1	2019-05-22
651102064116	$2b$10$RL69BvtgTf2QYzhcKhmxw.nniW.s6wZFKk4iHdegcezg5MjZTIb/.	นักศึกษา 117	651102064116@pcru.ac.th	1	1	1	2020-05-22
651102064117	$2b$10$I36PYwg/qSI3FiS8Q5Do9OcLtC/nkfb.xYhGUfG336URWj1LuhuWe	นักศึกษา 118	651102064117@pcru.ac.th	1	1	2	2021-05-22
651102064118	$2b$10$eLI/kMW1kZGnL1mT8qIKPuverzuHs7DB48vn8IZAD3.DtRbKvQGpO	นักศึกษา 119	651102064118@pcru.ac.th	1	1	2	2022-05-22
651102064119	$2b$10$1yo45kYjM2wUIlh5wM5OkOHO95/xmYTVpwWUsKiLp9r12y/tA08Y2	นักศึกษา 120	651102064119@pcru.ac.th	1	1	2	2023-05-22
651102064120	$2b$10$xZblQ/9NRlNKPCXBAIKO9OaX0Nmr.j2S9ohiGvSNs4kyoe0JqIr3a	นักศึกษา 121	651102064120@pcru.ac.th	1	1	2	2024-05-22
\.


--
-- TOC entry 3551 (class 0 OID 0)
-- Dependencies: 232
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, false);


--
-- TOC entry 3552 (class 0 OID 0)
-- Dependencies: 230
-- Name: classrooms_classroom_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.classrooms_classroom_id_seq', 2, true);


--
-- TOC entry 3553 (class 0 OID 0)
-- Dependencies: 222
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.courses_course_id_seq', 1, false);


--
-- TOC entry 3554 (class 0 OID 0)
-- Dependencies: 219
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 5, true);


--
-- TOC entry 3555 (class 0 OID 0)
-- Dependencies: 234
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 37, true);


--
-- TOC entry 3556 (class 0 OID 0)
-- Dependencies: 224
-- Name: face_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.face_data_id_seq', 1, false);


--
-- TOC entry 3557 (class 0 OID 0)
-- Dependencies: 217
-- Name: faculties_faculty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.faculties_faculty_id_seq', 11, true);


--
-- TOC entry 3558 (class 0 OID 0)
-- Dependencies: 226
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 3559 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 3, true);


--
-- TOC entry 3560 (class 0 OID 0)
-- Dependencies: 228
-- Name: user_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_photos_id_seq', 24, true);


--
-- TOC entry 3356 (class 2606 OID 40998)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 3354 (class 2606 OID 40969)
-- Name: classrooms classrooms_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.classrooms
    ADD CONSTRAINT classrooms_pkey PRIMARY KEY (classroom_id);


--
-- TOC entry 3346 (class 2606 OID 32771)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);


--
-- TOC entry 3338 (class 2606 OID 16704)
-- Name: departments departments_department_name_faculty_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_department_name_faculty_id_key UNIQUE (department_name, faculty_id);


--
-- TOC entry 3340 (class 2606 OID 16702)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- TOC entry 3358 (class 2606 OID 41014)
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- TOC entry 3348 (class 2606 OID 16769)
-- Name: face_data face_data_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.face_data
    ADD CONSTRAINT face_data_pkey PRIMARY KEY (id);


--
-- TOC entry 3334 (class 2606 OID 16695)
-- Name: faculties faculties_faculty_name_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_faculty_name_key UNIQUE (faculty_name);


--
-- TOC entry 3336 (class 2606 OID 16693)
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (faculty_id);


--
-- TOC entry 3350 (class 2606 OID 16784)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3330 (class 2606 OID 16684)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- TOC entry 3332 (class 2606 OID 16686)
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- TOC entry 3360 (class 2606 OID 41016)
-- Name: enrollments unique_classroom_student; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT unique_classroom_student UNIQUE (classroom_id, student_id);


--
-- TOC entry 3352 (class 2606 OID 24604)
-- Name: user_photos user_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_photos
    ADD CONSTRAINT user_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 3342 (class 2606 OID 16716)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3344 (class 2606 OID 16714)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3369 (class 2606 OID 41027)
-- Name: attendance attendance_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- TOC entry 3368 (class 2606 OID 40970)
-- Name: classrooms classrooms_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.classrooms
    ADD CONSTRAINT classrooms_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- TOC entry 3365 (class 2606 OID 16739)
-- Name: courses courses_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_teacher_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3361 (class 2606 OID 16705)
-- Name: departments departments_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(faculty_id) ON DELETE CASCADE;


--
-- TOC entry 3366 (class 2606 OID 16770)
-- Name: face_data face_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.face_data
    ADD CONSTRAINT face_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3370 (class 2606 OID 41017)
-- Name: enrollments fk_enroll_classroom; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT fk_enroll_classroom FOREIGN KEY (classroom_id) REFERENCES public.classrooms(classroom_id) ON DELETE CASCADE;


--
-- TOC entry 3371 (class 2606 OID 41022)
-- Name: enrollments fk_enroll_student; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3367 (class 2606 OID 16785)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3362 (class 2606 OID 16727)
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- TOC entry 3363 (class 2606 OID 16722)
-- Name: users users_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(faculty_id);


--
-- TOC entry 3364 (class 2606 OID 16717)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


-- Completed on 2025-11-19 03:15:15

--
-- PostgreSQL database dump complete
--

\unrestrict PwYNAOaguo3Fc9dksMHr7GzDttxDud4Qwqi9FnOllL0G6M8KKhk5JGXwpqVWFOz

