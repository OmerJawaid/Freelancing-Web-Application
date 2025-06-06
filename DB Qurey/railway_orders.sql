-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: gondola.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `User_Id` int NOT NULL,
  `Freelancer_Id` int NOT NULL,
  `Gig_Id` int NOT NULL,
  `Package_Id` int DEFAULT NULL,
  `Status` enum('pending','approved','in_progress','completed','rejected') DEFAULT 'pending',
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Updated_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `file_path` varchar(255) DEFAULT NULL,
  `file_uploaded_at` timestamp NULL DEFAULT NULL,
  `file_approved` tinyint(1) DEFAULT '0',
  `file_disapproved` tinyint(1) DEFAULT '0',
  `feedback` text,
  `Reviewed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id`),
  KEY `Package_Id` (`Package_Id`),
  KEY `idx_orders_user` (`User_Id`),
  KEY `idx_orders_freelancer` (`Freelancer_Id`),
  KEY `idx_orders_gig` (`Gig_Id`),
  KEY `idx_orders_file_path` (`file_path`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`User_Id`) REFERENCES `user` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`Freelancer_Id`) REFERENCES `freelancers` (`Id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`Gig_Id`) REFERENCES `gigs` (`Id`),
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`Package_Id`) REFERENCES `packages` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (20,49,48,13,14,'completed','2025-05-29 05:43:07','2025-06-03 09:16:50','public/uploads/orders/order-1748497767785-669411503.zip','2025-05-29 05:49:27',1,0,'nsljdnksajndjska',1),(21,49,48,14,15,'completed','2025-05-29 05:47:26','2025-05-29 05:48:17','public/uploads/orders/order-1748497665078-90168634.zip','2025-05-29 05:47:45',1,0,NULL,1),(22,49,48,13,14,'completed','2025-05-29 07:11:07','2025-05-29 10:57:34','public/uploads/orders/order-1748516209490-992791947.zip','2025-05-29 10:56:49',1,0,NULL,1),(23,49,48,13,14,'rejected','2025-06-03 07:46:58','2025-06-03 10:02:48',NULL,NULL,0,0,NULL,0);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-06  5:43:51
