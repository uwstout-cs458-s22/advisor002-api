-- Entities
-- "user" table uses quotes to avoid the user keyword.
CREATE TABLE IF NOT EXISTS "user"  (
	email text,
	enable boolean,
	id serial,
	role text CHECK (role IN ('user', 'director', 'admin')),
	"userId" text,
	PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "IDX_user_userId" ON "user" ("userId");

CREATE TABLE IF NOT EXISTS "course" (
	id serial,
	courseId integer,
	name text,
	credits integer,
	PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "IDX_course_id" ON "course" ("id");

CREATE TABLE IF NOT EXISTS "semester" (
	id serial,
	year int,
	type text CHECK (type IN ('winter', 'spring', 'summer', 'fall')),
	PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "IDX_semester_id" ON "semester" ("id");

-- Relations
CREATE TABLE IF NOT EXISTS "userCourse" (
	userId integer REFERENCES "user"(id),
	courseId integer REFERENCES course(id),
	semesterId integer REFERENCES semester(id),
	taken boolean,
	PRIMARY KEY (userId, courseId, semesterId)
);
CREATE INDEX IF NOT EXISTS "IDX_user_course_semester_id" ON "userCourse" (userId, courseId, semesterId);

-- Run to quickly remove all tables for testing.
-- DROP TABLE IF EXISTS "semester" cascade;
-- DROP TABLE IF EXISTS "course" cascade;
-- DROP TABLE IF EXISTS "user" cascade;
-- DROP TABLE IF EXISTS "userCourse" cascade;