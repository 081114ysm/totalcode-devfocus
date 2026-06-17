CREATE DATABASE IF NOT EXISTS devfocus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE devfocus;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  category VARCHAR(100) DEFAULT '전체',
  price INT NOT NULL DEFAULT 0,
  level ENUM('입문','초급','중급','고급') NOT NULL DEFAULT '입문',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  video_url VARCHAR(500),
  `order` INT DEFAULT 0,
  duration INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  watched_seconds INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_progress (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  lesson_id INT DEFAULT NULL,
  content TEXT NOT NULL,
  reply_content TEXT DEFAULT NULL,
  reply_user_id INT DEFAULT NULL,
  reply_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
  FOREIGN KEY (reply_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS course_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  rating TINYINT NOT NULL,
  content VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (user_id, course_id),
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enrollment (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS code_snippets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL DEFAULT 'javascript',
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 샘플 강의 데이터
INSERT IGNORE INTO courses (id, title, description, thumbnail, category, price, level) VALUES
(1, 'React Basics to Production', 'Learn components, state, and routing from the ground up.', '/images/react.png', 'Frontend', 49000, '초급'),
(2, 'Node.js and Express API Design', 'Build APIs with auth, validation, and operational patterns.', '/images/node.png', 'Backend', 59000, '중급'),
(3, 'MySQL and Deployment Operations', 'Cover schema design, migrations, deployment, and monitoring.', '/images/ts.png', 'Database', 39000, '초급');

INSERT IGNORE INTO lessons (id, course_id, title, video_url, `order`, duration) VALUES
(1, 1, 'Set up a React project', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 1, 600),
(2, 1, 'Components and props', 'https://www.youtube.com/watch?v=7fPXI_MnBOY', 2, 720),
(3, 1, 'State and effects', 'https://www.youtube.com/watch?v=0ZJgIjIuY7U', 3, 900),
(4, 2, 'Express project structure', 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 1, 480),
(5, 2, 'Express setup and routing', 'https://www.youtube.com/watch?v=L72fhGm1tfE', 2, 660),
(6, 2, 'REST API design', 'https://www.youtube.com/watch?v=lsMQRaeKNDk', 3, 840),
(7, 3, 'TypeScript basic types', 'https://www.youtube.com/watch?v=BwuLxPH8IDs', 1, 540),
(8, 3, 'Interfaces and type aliases', 'https://www.youtube.com/watch?v=d56mG7DezGs', 2, 720),
(9, 3, 'Using generics', 'https://www.youtube.com/watch?v=nViEqpgwxHE', 3, 780);

-- 기존 더미 URL을 실제 영상으로 덮어쓰기 (재실행 안전)
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' WHERE id = 1;
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=7fPXI_MnBOY' WHERE id = 2;
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=0ZJgIjIuY7U' WHERE id = 3;
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=TlB_eWDSMt4' WHERE id = 4;
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=L72fhGm1tfE' WHERE id = 5;
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=lsMQRaeKNDk' WHERE id = 6;
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=BwuLxPH8IDs' WHERE id = 7;
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=d56mG7DezGs' WHERE id = 8;
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=nViEqpgwxHE' WHERE id = 9;
