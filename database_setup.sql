-- Car Wash Management System Database Setup
-- Database: smart-park

USE `cwsms`;

-- Drop tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS ServicePackage;
DROP TABLE IF EXISTS Car;
DROP TABLE IF EXISTS Package;
DROP TABLE IF EXISTS User;

-- Create Package table
CREATE TABLE Package (
    PackageNumber INT AUTO_INCREMENT PRIMARY KEY,
    PackageName VARCHAR(50) NOT NULL,
    PackageDescription VARCHAR(100) NOT NULL,
    PackagePrice DECIMAL(10,2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Car table
CREATE TABLE Car (
    PlateNumber VARCHAR(20) PRIMARY KEY,
    CarType VARCHAR(50) NOT NULL,
    CarSize VARCHAR(20) NOT NULL,
    DriverName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create ServicePackage table
CREATE TABLE ServicePackage (
    RecordNumber INT AUTO_INCREMENT PRIMARY KEY,
    ServiceDate DATE NOT NULL,
    PlateNumber VARCHAR(20) NOT NULL,
    PackageNumber INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber) ON DELETE CASCADE,
    FOREIGN KEY (PackageNumber) REFERENCES Package(PackageNumber) ON DELETE CASCADE
);

-- Create Payment table
CREATE TABLE Payment (
    PaymentNumber INT AUTO_INCREMENT PRIMARY KEY,
    AmountPaid DECIMAL(10,2) NOT NULL,
    PaymentDate DATE NOT NULL,
    RecordNumber INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (RecordNumber) REFERENCES ServicePackage(RecordNumber) ON DELETE CASCADE
);

-- Create User table for authentication
CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample package data
INSERT INTO Package (PackageName, PackageDescription, PackagePrice) VALUES 
('Basic wash', 'Exterior hand wash', 5000.00),
('Premium wash', 'Exterior and interior cleaning', 8000.00),
('Deluxe wash', 'Full service with wax and polish', 12000.00),
('Quick wash', 'Fast exterior rinse', 3000.00);

-- Insert sample car data
INSERT INTO Car (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES 
('RAB123A', 'Sedan', 'Medium', 'John Doe', '+250788123456'),
('RAC456B', 'SUV', 'Large', 'Jane Smith', '+250788654321'),
('RAD789C', 'Hatchback', 'Small', 'Bob Johnson', '+250788987654');

-- Create indexes for better performance
CREATE INDEX idx_service_date ON ServicePackage(ServiceDate);
CREATE INDEX idx_payment_date ON Payment(PaymentDate);
CREATE INDEX idx_plate_number ON ServicePackage(PlateNumber);
CREATE INDEX idx_package_number ON ServicePackage(PackageNumber);
