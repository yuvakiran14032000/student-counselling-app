-- MySQL. created_at is stored in UTC; compare to UTC_TIMESTAMP().
-- 1. Top five colleges with at least one lead in the rolling last 30 days.
-- Zero-lead colleges are excluded; ties are resolved by college ID.
SELECT c.id, c.name, c.city, COUNT(l.id) AS lead_count
FROM colleges AS c
INNER JOIN leads AS l ON l.college_id = c.id
WHERE l.created_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY
  AND l.created_at <= UTC_TIMESTAMP()
GROUP BY c.id, c.name, c.city
ORDER BY lead_count DESC, c.id ASC
LIMIT 5;

-- 2. All colleges with no leads at any time (not just in the last 30 days).
SELECT c.id, c.name, c.city
FROM colleges AS c
LEFT JOIN leads AS l ON l.college_id = c.id
WHERE l.id IS NULL
ORDER BY c.id;
