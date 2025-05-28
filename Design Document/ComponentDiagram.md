# Component Diagram - Freelancing Web Application

## Overview
This diagram illustrates the major components of the Freelancing Web Application and their interactions.

## Diagram

```mermaid
graph TB
    %% Client-side Components
    subgraph "Frontend (React)"
        ClientApp["Client Application"]
        Router["React Router"]
        
        subgraph "Context"
            AuthContext["Auth Context"]
        end
        
        subgraph "Pages"
            HomeP["Home"]
            LoginP["Login"]
            SignupP["Signup"]
            MessageP["Messages"]
            GigP["Gig Display"]
            DashboardP["Dashboard"]
            OrdersP["Orders"]
            NotificationP["Notifications"]
            SettingsP["Settings"]
            CreateGigP["Create Gig"]
            EditGigP["Edit Gig"]
        end
        
        subgraph "Components"
            NavBar["Navbar"]
            Footer["Footer"]
            ReviewForm["Review Form"]
            ProtectedRoute["Protected Route"]
        end
    end
    
    %% Server-side Components
    subgraph "Backend (Node.js/Express)"
        APIServer["API Server"]
        SocketServer["Socket.IO Server"]
        
        subgraph "Router"
            AuthRouter["Authentication Router"]
            GigRouter["Gig Router"]
            OrderRouter["Order Router"]
            MessageRouter["Message Router"]
            ConversationRouter["Conversation Router"]
            NotificationRouter["Notification Router"]
            ProfileRouter["Profile Router"]
            ReviewRouter["Review Router"]
            PackageRouter["Package Router"]
        end
        
        subgraph "Controller"
            AuthController["Authentication Controller"]
            GigController["Gig Controller"]
            OrderController["Order Controller"]
            MessageController["Message Controller"]
            ConversationController["Conversation Controller"]
            NotificationController["Notification Controller"]
            ProfileController["Profile Controller"]
            ReviewController["Review Controller"]
            PackageController["Package Controller"]
        end
        
        subgraph "Middleware"
            AuthMiddleware["Authentication Middleware"]
            FileUploadMiddleware["File Upload Middleware"]
            ValidationMiddleware["Validation Middleware"]
        end
    end
    
    %% Database
    subgraph "Database (MySQL)"
        DBConnection["Database Connection"]
        UserTable["User Tables"]
        GigTable["Gig Tables"]
        OrderTable["Order Tables"]
        MessageTable["Message Tables"]
        NotificationTable["Notification Tables"]
        ReviewTable["Review Tables"]
    end
    
    %% External Services
    subgraph "External Services"
        Storage["File Storage"]
    end
    
    %% Connections between components
    %% Frontend internal connections
    ClientApp --> Router
    Router --> Pages
    Router --> AuthContext
    Pages --> Components
    
    %% Backend internal connections
    APIServer --> Router
    Router --> Controller
    Controller --> DBConnection
    Controller --> Middleware
    SocketServer --> MessageController
    SocketServer --> NotificationController
    
    %% Frontend to Backend connections
    ClientApp <--> APIServer
    ClientApp <--> SocketServer
    
    %% Backend to Database connections
    DBConnection --> UserTable
    DBConnection --> GigTable
    DBConnection --> OrderTable
    DBConnection --> MessageTable
    DBConnection --> NotificationTable
    DBConnection --> ReviewTable
    
    %% Backend to External Services
    APIServer --> Storage
```

## Description

The component diagram illustrates the high-level architecture of the Freelancing Web Application, showing major components and their interactions:

### Frontend (React)
- **Client Application**: The main React application
- **Router**: Manages navigation between different pages
- **Context**: Contains authentication and other global state
- **Pages**: Different views/screens of the application
- **Components**: Reusable UI components

### Backend (Node.js/Express)
- **API Server**: Handles HTTP requests
- **Socket.IO Server**: Manages real-time communications
- **Router**: Routes requests to appropriate controllers
- **Controller**: Contains business logic for each feature
- **Middleware**: Handles cross-cutting concerns like authentication

### Database (MySQL)
- **Database Connection**: Manages connections to the database
- **Tables**: Various database tables for storing application data

### External Services
- **File Storage**: Service for storing uploaded files

## Interactions
- The Frontend communicates with the Backend through HTTP requests and WebSocket connections
- The Backend interacts with the Database to store and retrieve data
- The Backend uses External Services for file storage
- Within the Frontend, the Router directs users to different Pages based on URL
- Within the Backend, Routers direct requests to appropriate Controllers, which interact with the Database
