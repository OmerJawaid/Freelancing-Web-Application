# Software Design Document
# Freelancing Web Application

**Document Number:** SDD-001  
**Version:** 1.0  
**Date:** June 1, 2025  
**Status:** Draft  
**Prepared by:** Omer Jawaid  

## Revision History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 1.0 | 2025-06-01 | Initial version | Omer Jawaid |

## Table of Contents
1. [Introduction](#1-introduction)
2. [Referenced Documents](#2-referenced-documents)
3. [Design Stakeholders](#3-design-stakeholders)
4. [Design Views](#4-design-views)
5. [Interface Design](#5-interface-design)
6. [Data Design](#6-data-design)
7. [Design Rationale](#7-design-rationale)
8. [Design Constraints](#8-design-constraints)
9. [Appendices](#9-appendices)

## 1. Introduction

### 1.1 Purpose
This Software Design Document (SDD) describes the architectural and detailed design of the Freelancing Web Application. The document follows the IEEE 1016-2009 standard for software design descriptions and provides a comprehensive view of the system's architecture, components, and their interactions.

### 1.2 Scope
This document covers the design of the entire Freelancing Web Application system, including:
- Frontend web application
- Backend API server
- Database design
- Real-time communication system
- File storage mechanism

### 1.3 System Overview
The Freelancing Web Application is a platform that connects freelancers with clients, enabling service offerings, communication, order management, and payment processing. The system facilitates the entire freelancing workflow from gig creation to order completion.

### 1.4 Design Goals and Constraints
The primary design goals for the system are:
- Scalability: Support for a growing user base
- Responsiveness: Fast page loads and real-time updates
- Security: Protection of user data and secure transactions
- Maintainability: Modular architecture for easy updates
- Usability: Intuitive interface for both user types

### 1.5 Architectural Strategy
The application follows a client-server architecture with:
- **Frontend**: React-based single-page application (SPA)
- **Backend**: Node.js/Express RESTful API server
- **Database**: MySQL relational database
- **Real-time Communication**: Socket.IO for messaging and notifications
- **File Storage**: Local file system for user uploads

### 1.6 System Context
The system interacts with:
- **End Users**: Freelancers and clients
- **File System**: For storing uploaded files (profile images, order deliverables)
- **Browser Environment**: For rendering the application and handling client-side storage

## 2. Referenced Documents

### 2.1 External References
- IEEE 1016-2009 Standard for Software Design Descriptions
- React.js Documentation (https://reactjs.org/docs)
- Node.js Documentation (https://nodejs.org/en/docs)
- Express.js Documentation (https://expressjs.com)
- Socket.IO Documentation (https://socket.io/docs)
- MySQL Documentation (https://dev.mysql.com/doc)

### 2.2 Internal References
- System Requirements Specification (SRS-001)
- User Experience Design Document (UXD-001)
- Database Schema Documentation (DSD-001)
- API Documentation (API-001)

## 3. Design Stakeholders

### 3.1 Stakeholder Concerns
- **Developers**: Code maintainability, technical feasibility, development efficiency
- **End Users (Freelancers)**: Usability, performance, reliability, security
- **End Users (Clients)**: Usability, performance, reliability, security
- **System Administrators**: Deployability, monitorability, maintainability
- **Business Stakeholders**: Cost-effectiveness, market fit, competitive advantage

### 3.2 Design Viewpoints
This document addresses the following design viewpoints:
- Context viewpoint (system boundaries and external entities)
- Composition viewpoint (system decomposition and structure)
- Logical viewpoint (functional organization)
- Dependency viewpoint (component dependencies)
- Information viewpoint (data structure and flow)
- Interface viewpoint (component interactions)
- State dynamics viewpoint (system behavior over time)
- Algorithm viewpoint (key algorithms and processes)

## 4. Design Views

### 4.1 Context View

#### 4.1.1 System Context Diagram
```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                  Freelancing Web Application              │
│                                                           │
└───────────┬─────────────────────────────┬─────────────────┘
            │                             │
            ▼                             ▼
┌───────────────────────┐     ┌───────────────────────┐
│                       │     │                       │
│     Freelancers       │     │       Clients         │
│                       │     │                       │
└───────────────────────┘     └───────────────────────┘
            │                             │
            └─────────────┬───────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                    File Storage System                    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

#### 4.1.2 External Entities
- **Freelancers**: Provide services through the platform
- **Clients**: Purchase services from freelancers
- **File Storage System**: Stores uploaded files and deliverables

#### 4.1.3 External Interfaces
- **User Interfaces**: Web browsers on various devices
- **File System Interface**: For storing and retrieving files
- **Database Interface**: For persistent data storage

### 4.2 Composition View

#### 4.2.1 System Decomposition

**Frontend Layer**
- Authentication Module
- Gig Management Module
- Messaging Module
- Order Management Module
- Notification Module
- Profile Management Module
- UI Components

**Backend Layer**
- API Server
- Authentication Service
- WebSocket Server
- File Service
- Database Access Layer
- Notification Service

**Data Layer**
- MySQL Database
- File Storage

#### 4.2.2 Component Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   Auth   │  │   Gig    │  │ Messaging│  │      Order       │ │
│  │  Module  │  │  Module  │  │  Module  │  │     Module       │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│                                                                 │
│  ┌──────────┐  ┌──────────┐                                     │
│  │ Profile  │  │Notification                                    │
│  │  Module  │  │  Module  │                                     │
│  └──────────┘  └──────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Layer                           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   API    │  │   Auth   │  │ WebSocket│  │      File        │ │
│  │  Server  │  │  Service │  │  Server  │  │     Service      │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  Database Access │  │   Notification   │                     │
│  │      Layer       │  │     Service      │                     │
│  └──────────────────┘  └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Data Layer                             │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │                          │  │                              │ │
│  │      MySQL Database      │  │       File Storage           │ │
│  │                          │  │                              │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Logical View

#### 4.3.1 Functional Organization

**User Management Domain**
- User registration and authentication
- User profile management
- Role-based access control

**Gig Management Domain**
- Gig creation and editing
- Gig search and discovery
- Package management

**Order Management Domain**
- Order creation and tracking
- File upload and delivery
- Order status management

**Communication Domain**
- Messaging system
- Notification system
- Real-time updates

#### 4.3.2 Class Diagram (Key Components)
```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│     User      │       │      Gig      │       │    Package    │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id            │       │ id            │       │ id            │
│ name          │       │ freelancerId  │───┐   │ gigId         │───┐
│ email         │       │ title         │   │   │ name          │   │
│ password      │       │ description   │   │   │ description   │   │
│ userType      │       │ category      │   │   │ price         │   │
│ image         │       │ createdAt     │   │   │ deliveryTime  │   │
└───────┬───────┘       └───────────────┘   │   └───────────────┘   │
        │                                    │                       │
        │                                    │                       │
        │                                    │                       │
        │                                    │                       │
        │                                    │                       │
┌───────┴───────┐       ┌───────────────┐   │   ┌───────────────┐   │
│ Conversation  │       │     Order     │◄──┴───┤    Review     │   │
├───────────────┤       ├───────────────┤       ├───────────────┤   │
│ id            │       │ id            │◄──────┤ id            │   │
│ user1Id       │───┐   │ clientId      │       │ gigId         │◄──┘
│ user2Id       │───┘   │ freelancerId  │       │ clientId      │
│ createdAt     │       │ gigId         │       │ rating        │
│ updatedAt     │       │ packageId     │       │ comment       │
└───────┬───────┘       │ status        │       │ createdAt     │
        │               │ filePath      │       └───────────────┘
        │               │ fileUploadedAt│
┌───────┴───────┐       │ fileApproved  │
│    Message    │       └───────────────┘
├───────────────┤
│ id            │       ┌───────────────┐
│ conversationId│       │ Notification  │
│ senderId      │       ├───────────────┤
│ message       │       │ id            │
│ attachmentUrl │       │ userId        │
│ status        │       │ type          │
│ createdAt     │       │ title         │
└───────────────┘       │ message       │
                        │ relatedId     │
                        │ isRead        │
                        │ createdAt     │
                        └───────────────┘
```

### 4.4 Dependency View

#### 4.4.1 Component Dependencies

**Frontend Dependencies**
- React → React Router
- React → Context API
- React Components → Socket.IO Client
- Authentication Module → User Management API
- Messaging Module → Conversation API
- Messaging Module → Socket.IO Client
- Order Module → Order API
- Notification Module → Socket.IO Client

**Backend Dependencies**
- Express → Node.js
- Express → Authentication Middleware
- Socket.IO Server → HTTP Server
- Controllers → Database Access Layer
- File Service → Multer
- Authentication Service → JWT
- Notification Service → Socket.IO Server

#### 4.4.2 Third-Party Dependencies

**Frontend**
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.4.2
- socket.io-client: ^4.5.3
- axios: ^1.1.3
- react-toastify: ^9.0.8
- react-icons: ^4.6.0

**Backend**
- express: ^4.18.2
- socket.io: ^4.5.3
- jsonwebtoken: ^8.5.1
- bcrypt: ^5.1.0
- mysql2: ^2.3.3
- multer: ^1.4.5-lts.1
- cookie-parser: ^1.4.6
- cors: ^2.8.5
- dotenv: ^16.0.3

### 4.5 Information View

#### 4.5.1 Data Flow Diagram
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │
│  Client  │◄───►│ Frontend │◄───►│ Backend  │
│          │     │          │     │          │
└──────────┘     └──────────┘     └────┬─────┘
                                       │
                                       │
                                       ▼
                              ┌────────────────┐
                              │                │
                              │    Database    │
                              │                │
                              └────────────────┘
```

#### 4.5.2 Key Data Transformations

**User Authentication**
1. User credentials → Validated user → JWT token
2. JWT token → Authenticated requests

**Gig Creation**
1. Gig form data → Validated gig data → Database record
2. Database record → Gig display data

**Order Processing**
1. Package selection → Order creation → Notification
2. File upload → File storage → Order update
3. Order approval → Status update → Payment processing

### 4.6 State Dynamics View

#### 4.6.1 Order State Diagram
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│  Pending │────►│In Progress────►│ Delivered │────►│Completed │
│          │     │          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
      │                │                                 │
      │                │                                 │
      ▼                ▼                                 ▼
┌──────────┐     ┌──────────┐                     ┌──────────┐
│          │     │          │                     │          │
│ Cancelled│     │ Disputed │                     │  Rated   │
│          │     │          │                     │          │
└──────────┘     └──────────┘                     └──────────┘
```

#### 4.6.2 User Session State Diagram
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │
│ Anonymous│────►│  Logged  │────►│  Active  │
│          │     │    In    │     │          │
└──────────┘     └──────────┘     └──────────┘
                       │                │
                       │                │
                       ▼                ▼
                 ┌──────────┐     ┌──────────┐
                 │          │     │          │
                 │  Idle    │◄───►│   Away   │
                 │          │     │          │
                 └──────────┘     └──────────┘
                       │
                       │
                       ▼
                 ┌──────────┐
                 │          │
                 │ Logged   │
                 │   Out    │
                 └──────────┘
```

### 4.7 Algorithm View

#### 4.7.1 Real-time Message Delivery
1. User sends message through frontend
2. Message is sent to backend via Socket.IO
3. Backend saves message to database
4. Backend emits message event to recipient's socket
5. Recipient's frontend receives message and updates UI
6. Backend sends push notification if recipient is offline

#### 4.7.2 Order Matching Algorithm
1. Client selects a gig and package
2. System creates order record with client and freelancer IDs
3. System sends notification to freelancer
4. Freelancer accepts or rejects the order
5. If accepted, order status changes to "in progress"
6. If rejected, client is notified and can select another freelancer

### 4.8 Recent System Improvements

#### 4.8.1 Real-time Messaging Enhancements
The messaging system was recently improved to address performance and reliability issues:

1. **Socket Connection Configuration**: Implemented proper transport options (websocket, polling) with appropriate timeout settings to ensure reliable connections.

2. **Message Reception Handling**: Enhanced event registration for receiving messages to prevent duplicate messages and ensure proper delivery.

3. **Message History Loading**: Fixed conversation history fetching to properly load and display previous messages in chronological order.

4. **Direct Chat Updates**: Implemented immediate message display in the chat interface when messages are sent or received.

5. **Message Sorting**: Added proper sorting of messages by timestamp to ensure correct chronological display.

6. **Automatic Scrolling**: Implemented automatic scrolling to the latest messages when new messages arrive or when a conversation is opened.

#### 4.8.2 User Interface Enhancements

1. **Freelancer Profile Access**: Added a "My Profile" button to the Navbar dropdown menu that's only visible to users with the freelancer role.

2. **Profile Navigation**: Implemented navigation to the FreelancerProfile page using the format `/freelancer-profile/${user.id}` to direct to the specific freelancer's profile page.

3. **Work Experience Management**: Enhanced the FreelancerProfile page to allow freelancers to view and manage their work experience entries.

- **React**: Frontend library
- **Socket.IO**: Real-time communication
- **MySQL**: Database system
- **JWT**: Authentication mechanism
- **Multer**: File upload handling

## 3. Architectural Design

### 3.1 Major Components

#### 3.1.1 Frontend Components
- **Authentication Module**: Handles user registration, login, and session management
- **Gig Management Module**: For creating, editing, and browsing gigs
- **Messaging System**: Real-time chat between users
- **Order Management**: Tracking and managing service orders
- **Notification System**: Real-time and persistent notifications
- **Profile Management**: User profile creation and editing

#### 3.1.2 Backend Components
- **API Server**: Express application handling HTTP requests
- **Authentication Service**: User authentication and authorization
- **WebSocket Server**: Socket.IO server for real-time features
- **File Service**: Handles file uploads and downloads
- **Database Access Layer**: Interfaces with the MySQL database
- **Notification Service**: Manages system notifications

### 3.2 Component Interactions

#### 3.2.1 Authentication Flow
1. User submits credentials via the frontend
2. Backend validates credentials and generates JWT token
3. Token is stored in cookies and used for subsequent requests
4. Protected routes check token validity before processing requests

#### 3.2.2 Messaging Flow
1. User selects a conversation in the frontend
2. Frontend fetches message history from the backend API
3. Socket.IO connection established for real-time updates
4. New messages are sent via Socket.IO and stored in the database
5. Recipients receive real-time updates through their Socket.IO connections

#### 3.2.3 Order Management Flow
1. Client purchases a gig, creating an order
2. Freelancer receives notification of new order
3. Freelancer uploads completed work
4. Client receives notification of completed work
5. Client downloads and approves the work
6. System marks the order as complete

## 4. Detailed Design

### 4.1 Frontend Components

#### 4.1.1 Authentication Context
```jsx
// AuthContext.jsx
// Manages user authentication state throughout the application
// Provides login/logout functionality and user information
// Handles JWT token storage and validation
```

#### 4.1.2 Protected Routes
```jsx
// protectedRoute.jsx
// Prevents unauthorized access to role-specific pages
// Redirects users based on authentication status and user type
```

#### 4.1.3 Messaging Component
```jsx
// Messages.jsx
// Handles real-time chat functionality
// Manages conversation list and message display
// Supports text, image, and file attachments
// Tracks message status (sent/read)
```

#### 4.1.4 Order Management Components
```jsx
// ClientOrders.jsx & FreelancerOrders.jsx
// Display and manage orders for respective user types
// Support file uploads for completed work
// Enable order status updates and notifications
```

### 4.2 Backend Components

#### 4.2.1 Express Server Configuration
```javascript
// index.js
// Configures Express application and middleware
// Sets up routes and Socket.IO integration
// Handles static file serving and error handling
```

#### 4.2.2 Socket.IO Implementation
```javascript
// sockets.js
// Manages WebSocket connections and events
// Handles user presence (online/offline status)
// Routes messages to appropriate recipients
// Broadcasts notifications and order updates
```

#### 4.2.3 Notification Service
```javascript
// NotificationService.js
// Saves notifications to the database
// Sends real-time notifications via WebSockets
// Manages notification read/unread status
// Provides notification retrieval functionality
```

#### 4.2.4 File Handling
```javascript
// orderRouter.js (partial)
// Configures Multer for file uploads
// Processes and stores uploaded files
// Provides secure file download endpoints
```

## 5. Interface Design

### 5.1 API Endpoints

#### 5.1.1 Authentication
- `POST /authentication/login`: User login
- `POST /authentication/signup`: User registration
- `POST /authentication/logout`: User logout
- `GET /authentication/checkAuthentication`: Verify authentication status

#### 5.1.2 Gigs
- `GET /gigs`: List all gigs
- `GET /gigs/:id`: Get specific gig details
- `POST /gigs`: Create new gig
- `PUT /gigs/:id`: Update existing gig
- `DELETE /gigs/:id`: Delete gig

#### 5.1.3 Messages
- `GET /conversations`: List user conversations
- `GET /conversations/:id`: Get specific conversation
- `POST /conversations`: Create new conversation
- `GET /messages/:conversationId`: Get messages for a conversation
- `POST /messages`: Send a new message

#### 5.1.4 Orders
- `GET /orders/client`: Get client's orders
- `GET /orders/freelancer`: Get freelancer's orders
- `POST /orders`: Create new order
- `PUT /orders/:id/status`: Update order status
- `POST /orders/:id/upload`: Upload completed work
- `GET /orders/:id/download`: Download completed work

### 5.2 WebSocket Events

#### 5.2.1 User Events
- `join`: User connects to socket
- `join_conversation`: User enters a conversation room
- `user_status_change`: User's online status changes

#### 5.2.2 Message Events
- `send_message`: User sends a message
- `receive_message`: User receives a message
- `message_read`: Message is marked as read

#### 5.2.3 Order Events
- `join_order_updates`: Subscribe to order updates
- `order_status_updated`: Order status changes
- `order_status_change`: Notification of status change

#### 5.2.4 Notification Events
- `new_notification`: User receives a notification

## 6. Data Design

### 6.1 Database Schema

#### 6.1.1 Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  User_Type ENUM('client', 'freelancer') NOT NULL,
  Image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.2 Gigs Table
```sql
CREATE TABLE gigs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  freelancer_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (freelancer_id) REFERENCES users(id)
);
```

#### 6.1.3 Packages Table
```sql
CREATE TABLE packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gig_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  delivery_time INT NOT NULL,
  FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE
);
```

#### 6.1.4 Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  gig_id INT NOT NULL,
  package_id INT NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_path VARCHAR(255),
  file_uploaded_at TIMESTAMP NULL,
  file_approved BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (freelancer_id) REFERENCES users(id),
  FOREIGN KEY (gig_id) REFERENCES gigs(id),
  FOREIGN KEY (package_id) REFERENCES packages(id)
);
```

#### 6.1.5 Conversations Table
```sql
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user1_id INT NOT NULL,
  user2_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id)
);
```

#### 6.1.6 Messages Table
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT,
  attachment_url VARCHAR(255),
  status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

#### 6.1.7 Notifications Table
```sql
CREATE TABLE notifications (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  User_Id INT NOT NULL,
  Type VARCHAR(50) NOT NULL,
  Title VARCHAR(100) NOT NULL,
  Message TEXT NOT NULL,
  Related_Id INT,
  Is_Read BOOLEAN DEFAULT FALSE,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (User_Id) REFERENCES users(id)
);
```

### 6.2 Data Flow

#### 6.2.1 Gig Creation Flow
1. Freelancer submits gig details via frontend form
2. Data is validated and stored in the gigs table
3. Package information is stored in the packages table with foreign key to gig

#### 6.2.2 Order Creation Flow
1. Client selects a gig and package
2. Order record is created with initial "pending" status
3. Notification is sent to the freelancer
4. Order appears in both users' order lists

#### 6.2.3 Message Flow
1. User sends a message
2. Message is stored in the messages table
3. Real-time notification is sent to the recipient
4. Message status is updated as it's delivered and read

### 6.3 File Storage Strategy
- Profile images stored in `Backend/public/profileImages/`
- Order deliverables stored in `Backend/public/uploads/orders/`
- File paths stored in database with relative paths
- Access controlled through authenticated API endpoints

## 7. Appendices

### 7.1 Architecture Diagram
```
┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │
│  React Frontend │◄─────►│  Express Backend│
│                 │  HTTP │                 │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │                         │
         │                         │
┌────────▼────────┐       ┌────────▼────────┐
│                 │       │                 │
│  Socket.IO      │◄─────►│  MySQL Database │
│  Client         │WebSock│                 │
└─────────────────┘       └─────────────────┘
```

### 7.2 Authentication Flow Diagram
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│          │    │          │    │          │
│  Browser │───►│  Backend │───►│  Database│
│          │    │          │    │          │
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │
     │ 1. Login      │ 2. Verify     │
     │ Request       │ Credentials   │
     │               │               │
     │               │               │
┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐
│          │    │          │    │          │
│  Browser │◄───│  Backend │◄───│  Database│
│          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘
     │               │
     │ 4. Store      │ 3. Generate
     │ JWT Token     │ JWT Token
     │               │
     ▼               ▼
```

### 7.3 Glossary

- **Gig**: A service offered by a freelancer
- **Package**: A specific service tier within a gig (e.g., Basic, Standard, Premium)
- **Order**: A transaction where a client purchases a freelancer's service
- **JWT**: JSON Web Token, used for authentication
- **Socket.IO**: Library for real-time, bidirectional communication
- **Multer**: Middleware for handling file uploads

### 7.4 References

- Node.js Documentation: https://nodejs.org/en/docs/
- Express Documentation: https://expressjs.com/
- React Documentation: https://reactjs.org/docs/getting-started.html
- Socket.IO Documentation: https://socket.io/docs/
- MySQL Documentation: https://dev.mysql.com/doc/
