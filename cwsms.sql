-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 29, 2025 at 12:11 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cwsms`
--

-- --------------------------------------------------------

--
-- Table structure for table `car`
--

CREATE TABLE `car` (
  `PlateNumber` varchar(20) NOT NULL,
  `CarType` varchar(50) NOT NULL,
  `CarSize` varchar(20) NOT NULL,
  `DriverName` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car`
--

INSERT INTO `car` (`PlateNumber`, `CarType`, `CarSize`, `DriverName`, `PhoneNumber`, `CreatedAt`, `UpdatedAt`) VALUES
('RAB201V', 'Sedan', 'Small', 'lois', '0792734569', '2025-05-29 09:51:02', '2025-05-29 09:51:02'),
('RAC456B', 'SUV', 'Large', 'Jane Smith', '+250788654321', '2025-05-29 08:14:43', '2025-05-29 08:14:43');

-- --------------------------------------------------------

--
-- Table structure for table `package`
--

CREATE TABLE `package` (
  `PackageNumber` int(11) NOT NULL,
  `PackageName` varchar(50) NOT NULL,
  `PackageDescription` varchar(100) NOT NULL,
  `PackagePrice` decimal(10,2) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package`
--

INSERT INTO `package` (`PackageNumber`, `PackageName`, `PackageDescription`, `PackagePrice`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Basic wash', 'Exterior hand wash', 5000.00, '2025-05-29 08:14:43', '2025-05-29 08:14:43'),
(2, 'Premium wash', 'Exterior and interior cleaning', 8000.00, '2025-05-29 08:14:43', '2025-05-29 08:14:43'),
(3, 'Deluxe wash', 'Full service with wax and polish', 12000.00, '2025-05-29 08:14:43', '2025-05-29 08:14:43'),
(4, 'Quick wash', 'Fast exterior rinse', 3000.00, '2025-05-29 08:14:43', '2025-05-29 08:14:43');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `PaymentNumber` int(11) NOT NULL,
  `AmountPaid` decimal(10,2) NOT NULL,
  `PaymentDate` date NOT NULL,
  `RecordNumber` int(11) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`PaymentNumber`, `AmountPaid`, `PaymentDate`, `RecordNumber`, `CreatedAt`, `UpdatedAt`) VALUES
(2, 5000.00, '2025-05-29', 1, '2025-05-29 09:31:12', '2025-05-29 09:31:12'),
(3, 8000.00, '2025-05-29', 2, '2025-05-29 09:51:37', '2025-05-29 09:51:37');

-- --------------------------------------------------------

--
-- Table structure for table `servicepackage`
--

CREATE TABLE `servicepackage` (
  `RecordNumber` int(11) NOT NULL,
  `ServiceDate` date NOT NULL,
  `PlateNumber` varchar(20) NOT NULL,
  `PackageNumber` int(11) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `servicepackage`
--

INSERT INTO `servicepackage` (`RecordNumber`, `ServiceDate`, `PlateNumber`, `PackageNumber`, `CreatedAt`, `UpdatedAt`) VALUES
(1, '2025-05-28', 'RAC456B', 1, '2025-05-29 08:26:04', '2025-05-29 09:02:03'),
(2, '2025-05-29', 'RAB201V', 2, '2025-05-29 09:51:15', '2025-05-29 09:51:15');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`UserID`, `Username`, `Password`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'lois', '$2b$10$8FBWdtCC4G91oCcNRcwVSOxB8IOlTCMYTktzdddcv9d5Xw30Wf9la', '2025-05-29 08:20:05', '2025-05-29 08:20:05'),
(2, 'Arsene', '$2b$10$.o8JB.NTIjx.DeqYPyYHmuU9v.y3yH5KpfP52uxIbP0GDSlFcPmKe', '2025-05-29 09:56:26', '2025-05-29 09:56:26');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `car`
--
ALTER TABLE `car`
  ADD PRIMARY KEY (`PlateNumber`);

--
-- Indexes for table `package`
--
ALTER TABLE `package`
  ADD PRIMARY KEY (`PackageNumber`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`PaymentNumber`),
  ADD KEY `RecordNumber` (`RecordNumber`),
  ADD KEY `idx_payment_date` (`PaymentDate`);

--
-- Indexes for table `servicepackage`
--
ALTER TABLE `servicepackage`
  ADD PRIMARY KEY (`RecordNumber`),
  ADD KEY `idx_service_date` (`ServiceDate`),
  ADD KEY `idx_plate_number` (`PlateNumber`),
  ADD KEY `idx_package_number` (`PackageNumber`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `package`
--
ALTER TABLE `package`
  MODIFY `PackageNumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `PaymentNumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `servicepackage`
--
ALTER TABLE `servicepackage`
  MODIFY `RecordNumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`RecordNumber`) REFERENCES `servicepackage` (`RecordNumber`) ON DELETE CASCADE;

--
-- Constraints for table `servicepackage`
--
ALTER TABLE `servicepackage`
  ADD CONSTRAINT `servicepackage_ibfk_1` FOREIGN KEY (`PlateNumber`) REFERENCES `car` (`PlateNumber`) ON DELETE CASCADE,
  ADD CONSTRAINT `servicepackage_ibfk_2` FOREIGN KEY (`PackageNumber`) REFERENCES `package` (`PackageNumber`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
