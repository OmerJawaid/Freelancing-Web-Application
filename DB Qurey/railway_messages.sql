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
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Conversation_Id` int NOT NULL,
  `Sender_Id` int NOT NULL,
  `Content` longtext,
  `Attachment_url` varchar(500) DEFAULT NULL,
  `Type` enum('text','image','file') DEFAULT 'text',
  `Status` enum('sent','delivered','read') DEFAULT 'sent',
  `Created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `Conversation_Id` (`Conversation_Id`),
  KEY `Sender_Id` (`Sender_Id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`Conversation_Id`) REFERENCES `conversations` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`Sender_Id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (119,8,49,'HI',NULL,'text','sent','2025-05-29 05:50:15'),(120,8,49,'are you free',NULL,'text','sent','2025-05-29 05:50:29'),(121,8,49,'I want to discuss a idea with you',NULL,'text','sent','2025-05-29 05:51:26'),(122,8,49,'?',NULL,'text','sent','2025-05-29 06:32:24'),(123,8,49,'?',NULL,'text','sent','2025-05-29 06:32:39'),(124,8,48,'Why not Sir kindly share some details of the project.',NULL,'text','sent','2025-05-29 10:54:13'),(125,8,49,'wait for a sec',NULL,'text','sent','2025-05-29 21:45:42'),(126,8,48,'?',NULL,'text','sent','2025-05-30 08:10:01'),(127,8,48,'?',NULL,'text','sent','2025-05-30 11:32:54'),(128,8,49,'hi',NULL,'text','sent','2025-06-03 09:15:08'),(129,8,49,'.',NULL,'text','sent','2025-06-03 09:58:22'),(130,8,48,'.',NULL,'text','sent','2025-06-03 10:00:32'),(131,8,48,'hello',NULL,'text','sent','2025-06-03 10:35:09');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-06  5:44:00
