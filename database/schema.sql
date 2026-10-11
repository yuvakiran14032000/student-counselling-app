CREATE DATABASE IF NOT EXISTS student_counselling CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE student_counselling;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS colleges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(191) NOT NULL,
    city VARCHAR(80) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(80) NOT NULL,
    college_id INT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    demo_key VARCHAR(40) UNIQUE,
    INDEX leads_city_idx (city),
    INDEX leads_created_at_idx (created_at),
    INDEX leads_college_date_idx (college_id, created_at),
    CONSTRAINT leads_college_fk FOREIGN KEY (college_id) REFERENCES colleges (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;