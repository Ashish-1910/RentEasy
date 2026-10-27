USE rental_analytics;

-- Q0: installation check (Experiment 3)
SELECT VERSION() AS mysql_version, DATABASE() AS current_db;

-- Q1: inquiries per property, including properties with none (LEFT JOIN)
SELECT p.property_id, p.title, p.city, p.property_type, p.rent,
       COUNT(i.inquiry_id) AS total_inquiries
FROM properties p
LEFT JOIN inquiries i ON p.property_id = i.property_id
GROUP BY p.property_id, p.title, p.city, p.property_type, p.rent
ORDER BY total_inquiries DESC, p.property_id;

-- Q1b: properties with NO inquiries
SELECT p.property_id, p.title, p.city, p.rent
FROM properties p
LEFT JOIN inquiries i ON p.property_id = i.property_id
GROUP BY p.property_id, p.title, p.city, p.rent
HAVING COUNT(i.inquiry_id) = 0;

-- Q2: average rent by city and property type (GROUP BY, HAVING)
SELECT city, property_type, ROUND(AVG(rent), 2) AS avg_rent, COUNT(*) AS total_properties
FROM properties
GROUP BY city, property_type
HAVING COUNT(*) >= 2
ORDER BY city, avg_rent DESC;

-- Q3: ALL owners with total monthly income, including owners with no leases (Experiment 4 style)
SELECT u.user_id, u.name AS owner_name,
       COUNT(DISTINCT p.property_id) AS properties,
       COALESCE(SUM(l.monthly_rent), 0) AS total_monthly_income
FROM users u
LEFT JOIN properties p ON u.user_id = p.owner_id
LEFT JOIN leases l ON p.property_id = l.property_id
WHERE u.role = 'Owner'
GROUP BY u.user_id, u.name
ORDER BY total_monthly_income DESC;

-- Q3b: ALL tenants with total inquiries, including tenants with none
SELECT u.user_id, u.name AS tenant_name, COUNT(i.inquiry_id) AS total_inquiries,
       SUM(CASE WHEN i.status = 'Accepted' THEN 1 ELSE 0 END) AS accepted
FROM users u
LEFT JOIN inquiries i ON u.user_id = i.tenant_id
WHERE u.role = 'Tenant'
GROUP BY u.user_id, u.name
ORDER BY total_inquiries DESC;

-- Q4: properties priced above their city average (subquery)
SELECT p.property_id, p.city, p.property_type, p.rent
FROM properties p
WHERE p.rent > (SELECT AVG(rent) FROM properties WHERE city = p.city)
ORDER BY p.city, p.rent DESC;

-- Q5: vacancy rate by city (conditional expression)
SELECT city, COUNT(*) AS total_properties,
       SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS vacant,
       ROUND(100 * SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) / COUNT(*), 2) AS vacancy_percent
FROM properties
GROUP BY city
ORDER BY vacancy_percent DESC;

-- Q6: rent rank inside each city (window function)
SELECT property_id, city, rent,
       RANK() OVER (PARTITION BY city ORDER BY rent DESC) AS rent_rank
FROM properties;

-- Q7: monthly inquiry trend (date function)
SELECT DATE_FORMAT(inquiry_date, '%Y-%m') AS month_label, COUNT(*) AS inquiries
FROM inquiries
GROUP BY month_label
ORDER BY month_label;

-- Q8: SET operator and IN-subquery
SELECT city FROM properties
UNION
SELECT city FROM users WHERE role = 'Tenant';

SELECT DISTINCT city FROM properties
WHERE city IN (SELECT city FROM users WHERE role = 'Tenant');

-- Q9: single-row, conversion and conditional functions
SELECT property_id, UPPER(city) AS city_upper,
       CONCAT('Rs. ', FORMAT(rent, 0)) AS rent_formatted,
       ROUND(rent / area_sqft, 2) AS rent_per_sqft,
       CASE WHEN rent < 20000 THEN 'Affordable'
            WHEN rent < 45000 THEN 'Mid-Range'
            ELSE 'Premium' END AS price_category
FROM properties
ORDER BY rent DESC
LIMIT 10;

-- Q10: monthly lease revenue by city (join)
SELECT p.city, COUNT(l.lease_id) AS active_leases, SUM(l.monthly_rent) AS monthly_revenue
FROM leases l
JOIN properties p ON l.property_id = p.property_id
GROUP BY p.city
ORDER BY monthly_revenue DESC;

-- Q11: DML inside a transaction (rolled back so data stays intact)
START TRANSACTION;
UPDATE properties SET status = 'Rented' WHERE property_id = 5;
SELECT property_id, status FROM properties WHERE property_id = 5;
DELETE FROM inquiries WHERE inquiry_id = 1;
SELECT COUNT(*) AS inquiries_after_delete FROM inquiries;
ROLLBACK;
SELECT COUNT(*) AS inquiries_after_rollback FROM inquiries;

-- Q12: DDL - schema object (view) and data dictionary
CREATE OR REPLACE VIEW v_city_summary AS
SELECT city, COUNT(*) AS total_properties, ROUND(AVG(rent), 0) AS avg_rent,
       SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS vacant
FROM properties
GROUP BY city;

SELECT * FROM v_city_summary ORDER BY avg_rent DESC;

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'rental_analytics'
ORDER BY table_name, ordinal_position;