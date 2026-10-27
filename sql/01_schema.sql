DROP DATABASE IF EXISTS rental_analytics;
CREATE DATABASE rental_analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rental_analytics;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    city VARCHAR(50),
    CONSTRAINT chk_user_role CHECK (role IN ('Owner', 'Tenant'))
);

CREATE TABLE properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    city VARCHAR(50) NOT NULL,
    locality VARCHAR(100),
    property_type VARCHAR(30) NOT NULL,
    bedrooms INT,
    bathrooms INT,
    area_sqft INT,
    furnished VARCHAR(20),
    floor_no INT,
    amenity_count INT,
    rent DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    listed_date DATE,
    CONSTRAINT fk_prop_owner FOREIGN KEY (owner_id) REFERENCES users(user_id),
    CONSTRAINT chk_prop_status CHECK (status IN ('Available', 'Rented'))
);

CREATE TABLE inquiries (
    inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    tenant_id INT NOT NULL,
    inquiry_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_inq_property FOREIGN KEY (property_id) REFERENCES properties(property_id),
    CONSTRAINT fk_inq_tenant FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    CONSTRAINT chk_inq_status CHECK (status IN ('Pending', 'Accepted', 'Rejected'))
);

CREATE TABLE leases (
    lease_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    tenant_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    monthly_rent DECIMAL(10,2),
    CONSTRAINT fk_lease_property FOREIGN KEY (property_id) REFERENCES properties(property_id),
    CONSTRAINT fk_lease_tenant FOREIGN KEY (tenant_id) REFERENCES users(user_id)
);

CREATE INDEX idx_prop_city ON properties(city);
CREATE INDEX idx_prop_status ON properties(status);
CREATE INDEX idx_inq_date ON inquiries(inquiry_date);