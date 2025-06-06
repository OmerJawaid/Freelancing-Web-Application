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
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `Id` int NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Image` varchar(500) NOT NULL DEFAULT 'https://media-hosting.imagekit.io/86a88d09aae2472d/download.png?Expires=1839859669&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=0WnB0Iv-RFGZawC~X5GWgn2GwyN7SSljbZHhScYVtt23khRq2V6ra-E-donYyO3RZxkvkqdkDxJqyEkt9cBns4HndW1X5M~jMvG2PmG5rkjdEsatBTTlARuddXC5uTu7Gcp~rojvToPaS5TkGszf7jS1z0AEcZvlhmIXtRNIfx1LQgxnv1yda9rstMn~-eZzHS0vzeyVIGTj~4HuqOgxyozVjshUBM-gyVft3VmZ-b2dN3AZ-VfccVnieynhgnqTRMhT5MYdifXKyiT4wctoFReBsGQTAeVqaGGrNcPzk3hFYxCeNLwLcZToQopHx0ydw7s2IK-zFYFKsPqWRHga4Q__',
  KEY `Id` (`Id`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`Id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (47,'Client','/public/profileImages/profile-1748497129768-759404755.jpg'),(49,'client','/public/profileImages/profile-1748497185648-336767883.jpg');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-06  5:45:09
