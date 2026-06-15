USE devfocus;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO courses (id, title, description, thumbnail, category, price, level, published, instructor_id) VALUES
(1, 'React Basics to Production', 'Learn components, state, and routing from the ground up.', NULL, 'Frontend', 39000, '입문', TRUE, NULL),
(2, 'Node.js and Express API Design', 'Build APIs with auth, validation, and operational patterns.', NULL, 'Backend', 49000, '초급', TRUE, NULL),
(3, 'MySQL and Deployment Operations', 'Cover schema design, migrations, deployment, and monitoring.', NULL, 'Database', 59000, '중급', TRUE, NULL);

INSERT INTO lessons (course_id, title, video_url, `order`, duration) VALUES
(1, 'Set up a React project', NULL, 1, 900),
(1, 'Components and props', NULL, 2, 1200),
(1, 'State and events', NULL, 3, 1200),
(2, 'Express project structure', NULL, 1, 1200),
(2, 'REST APIs and routing', NULL, 2, 1500),
(2, 'JWT authentication basics', NULL, 3, 1500),
(3, 'MySQL schema design', NULL, 1, 1500),
(3, 'Indexes and performance tuning', NULL, 2, 1500),
(3, 'Docker and deployment checks', NULL, 3, 1800);

UPDATE courses SET
  title = 'React Basics to Production',
  description = 'Learn components, state, and routing from the ground up.',
  thumbnail = NULL,
  category = 'Frontend',
  price = 39000,
  level = '입문'
WHERE id = 1;

UPDATE courses SET
  title = 'Node.js and Express API Design',
  description = 'Build APIs with auth, validation, and operational patterns.',
  thumbnail = NULL,
  category = 'Backend',
  price = 49000,
  level = '초급'
WHERE id = 2;

UPDATE courses SET
  title = 'MySQL and Deployment Operations',
  description = 'Cover schema design, migrations, deployment, and monitoring.',
  thumbnail = NULL,
  category = 'Database',
  price = 59000,
  level = '중급'
WHERE id = 3;

UPDATE lessons SET title = 'Set up a React project' WHERE course_id = 1 AND `order` = 1;
UPDATE lessons SET title = 'Components and props' WHERE course_id = 1 AND `order` = 2;
UPDATE lessons SET title = 'State and events' WHERE course_id = 1 AND `order` = 3;
UPDATE lessons SET title = 'Express project structure' WHERE course_id = 2 AND `order` = 1;
UPDATE lessons SET title = 'REST APIs and routing' WHERE course_id = 2 AND `order` = 2;
UPDATE lessons SET title = 'JWT authentication basics' WHERE course_id = 2 AND `order` = 3;
UPDATE lessons SET title = 'MySQL schema design' WHERE course_id = 3 AND `order` = 1;
UPDATE lessons SET title = 'Indexes and performance tuning' WHERE course_id = 3 AND `order` = 2;
UPDATE lessons SET title = 'Docker and deployment checks' WHERE course_id = 3 AND `order` = 3;
