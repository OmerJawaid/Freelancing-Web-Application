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
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `User_Id` int NOT NULL,
  `Type` varchar(50) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `Related_Id` int DEFAULT NULL,
  `Is_Read` tinyint(1) DEFAULT '0',
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `idx_notifications_user_id` (`User_Id`),
  KEY `idx_notifications_is_read` (`Is_Read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`User_Id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (97,48,'order','New Order Received','You have received a new order. Check your orders page for details.',20,1,'2025-05-29 05:43:07'),(98,49,'order_update','Order Status Updated','Your order status has been updated to: approved',20,1,'2025-05-29 05:43:19'),(99,49,'order_update','Order Status Updated','Your order status has been updated to: in_progress',20,1,'2025-05-29 05:43:22'),(100,49,'order_work','Work Uploaded','A freelancer has uploaded work for your order. Check your orders page for details.',20,1,'2025-05-29 05:43:46'),(101,48,'order','New Order Received','You have received a new order. Check your orders page for details.',21,1,'2025-05-29 05:47:27'),(102,49,'order_update','Order Status Updated','Your order status has been updated to: approved',21,1,'2025-05-29 05:47:39'),(103,49,'order_update','Order Status Updated','Your order status has been updated to: in_progress',21,1,'2025-05-29 05:47:41'),(104,49,'order_work','Work Uploaded','A freelancer has uploaded work for your order. Check your orders page for details.',21,1,'2025-05-29 05:47:45'),(105,48,'order_approved','Work Approved','A client has approved your work. Check your orders page for details.',21,1,'2025-05-29 05:48:06'),(106,48,'order_revision','Revision Requested','A client has requested revisions for your work. Check your orders page for details.',20,1,'2025-05-29 05:49:08'),(107,49,'order_work','Work Uploaded','A freelancer has uploaded work for your order. Check your orders page for details.',20,1,'2025-05-29 05:49:28'),(108,48,'order_approved','Work Approved','A client has approved your work. Check your orders page for details.',20,1,'2025-05-29 05:49:41'),(109,48,'message','New Message','HI',8,1,'2025-05-29 05:50:16'),(110,48,'message','New Message','are you free',8,1,'2025-05-29 05:50:31'),(111,48,'message','New Message','I want to discuss a idea with you',8,1,'2025-05-29 05:51:27'),(112,48,'message','New Message','?',8,1,'2025-05-29 06:32:25'),(113,48,'message','New Message','?',8,1,'2025-05-29 06:32:40'),(114,48,'order','New Order Received','You have received a new order. Check your orders page for details.',22,1,'2025-05-29 07:11:08'),(115,49,'message','New Message','Why not Sir kindly share some details of the project.',8,1,'2025-05-29 10:54:14'),(116,49,'order_update','Order Status Updated','Your order status has been updated to: approved',22,1,'2025-05-29 10:56:35'),(117,49,'order_update','Order Status Updated','Your order status has been updated to: in_progress',22,1,'2025-05-29 10:56:41'),(118,49,'order_work','Work Uploaded','A freelancer has uploaded work for your order. Check your orders page for details.',22,1,'2025-05-29 10:56:49'),(119,48,'order_approved','Work Approved','A client has approved your work. Check your orders page for details.',22,1,'2025-05-29 10:57:11'),(120,48,'message','New Message','wait for a sec',8,1,'2025-05-29 21:45:43'),(121,49,'message','New Message','?',8,1,'2025-05-30 08:10:03'),(122,49,'message','New Message','?',8,1,'2025-05-30 11:32:56'),(123,48,'order','New Order Received','You have received a new order. Check your orders page for details.',23,1,'2025-06-03 07:46:59'),(124,48,'message','New Message','hi',8,1,'2025-06-03 09:15:09'),(125,48,'message','New Message','.',8,1,'2025-06-03 09:58:23'),(126,49,'message','New Message','.',8,0,'2025-06-03 10:00:33'),(127,49,'order_update','Order Status Updated','Your order status has been updated to: rejected',23,0,'2025-06-03 10:02:49'),(128,49,'message','New Message','hello',8,0,'2025-06-03 10:35:10');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-06  5:44:09
