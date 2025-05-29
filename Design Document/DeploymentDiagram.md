# Deployment Diagram - Freelancing Web Application

## Overview
This diagram illustrates the deployment architecture of the Freelancing Web Application, showing how the components are distributed across the infrastructure.

## Diagram

```plantuml
    @startuml

    !define DEVICE_BG_COLOR #E8EAF6
    !define DEVICE_BORDER_COLOR #3F51B5
    !define FRONTEND_BG_COLOR #E3F2FD
    !define FRONTEND_BORDER_COLOR #1976D2
    !define BACKEND_BG_COLOR #E0F7FA
    !define BACKEND_BORDER_COLOR #0097A7
    !define DATABASE_BG_COLOR #E8F5E9
    !define DATABASE_BORDER_COLOR #388E3C

    skinparam backgroundColor white
    skinparam handwritten false
    skinparam shadowing false
    skinparam defaultFontName Arial
    skinparam defaultFontSize 14

    skinparam node {
        BorderThickness 2
        FontStyle bold
    }

    skinparam database {
        BorderThickness 2
    }

    skinparam arrow {
        Color #424242
        Thickness 1.5
    }

    skinparam linetype ortho

    ' Client Devices
    node "Client Device" as ClientDevice {
        artifact "Web Browser" as Browser {
            component "React Application (Client)" as BrowserApp
        }
    }

    ' Frontend Hosting
    node "Frontend Hosting (Netlify/Vercel)" as FrontendHosting {
        artifact "React Application" as ReactApp {
            file "Static Assets" as StaticAssets
            file "JavaScript Bundles" as JSBundles
            file "CSS Files" as CSSFiles
            file "Media Files" as MediaFiles
        }
    }

    ' Backend Hosting
    node "Backend Hosting (Railway)" as BackendHosting {
        artifact "Express API Server" as APIServer {
            component "REST API Endpoints" as RESTEndpoints
            component "Authentication" as Auth
            component "Controllers" as Controllers
        }
        
        artifact "Socket.IO Server" as SocketServer {
            component "Real-time Messaging" as RTMessaging
            component "Notification Service" as Notifications
        }
        
        artifact "File Storage" as FileStorage
    }

    ' Database Hosting
    node "Database Hosting (Railway)" as DatabaseHosting {
        database "MySQL Database" as MySQL {
            storage "User Data" as UserDB
            storage "Gig Data" as GigDB
            storage "Order Data" as OrderDB
            storage "Message Data" as MessageDB
        }
    }

    ' Connections
    ClientDevice -[#1976D2,thickness=2]-> FrontendHosting : "HTTPS"
    BrowserApp -[#1976D2,thickness=2]-> APIServer : "REST API Calls"
    BrowserApp -[#9C27B0,dashed,thickness=2]-> SocketServer : "WebSocket Connection"

    APIServer -[#388E3C,thickness=2]-> MySQL : "SQL Queries"
    SocketServer -[#388E3C,thickness=2]-> MySQL : "SQL Queries"
    APIServer -[#F57C00,thickness=2]-> FileStorage : "File Operations"

    @enduml
```

## Description

This deployment diagram illustrates how the Freelancing Web Application is distributed across different hosting environments:

### Client Tier
- **Client Device**: End-user computers, tablets, or mobile devices
  - **Web Browser**: The client-side environment where users interact with the application
  - **React Application (Client)**: The client-side application running in the browser

### Frontend Tier (Netlify/Vercel)
- **React Application**: The compiled and optimized React application
  - **Static Assets**: Basic HTML files and resources
  - **JavaScript Bundles**: Compiled React code
  - **CSS Files**: Styling for the application
  - **Media Files**: Images, icons, and other media resources

### Backend Tier (Railway)
- **Express API Server**: Handles HTTP requests and business logic
  - **REST API Endpoints**: Interface for client communication
  - **Authentication**: User authentication and authorization
  - **Controllers**: Business logic implementation
- **Socket.IO Server**: Manages real-time communication
  - **Real-time Messaging**: Handles chat functionality
  - **Notification Service**: Manages user notifications
- **File Storage**: Stores uploaded files and documents (gig images, user profiles, etc.)

### Database Tier (Railway)
- **MySQL Database**: Stores all application data
  - **User Data**: User accounts, profiles, and authentication information
  - **Gig Data**: Freelancer service offerings and packages
  - **Order Data**: Client orders and work submissions
  - **Message Data**: Chat messages and notifications

### Communication Flows
- Clients communicate with the frontend via HTTPS
- Browser applications make REST API calls to the backend
- Real-time features use WebSocket connections to the Socket.IO server
- Backend services communicate with the database via SQL queries
- File operations are handled through the dedicated file storage service

- **Browser to React App**: HTTP/HTTPS requests for initial page load and static assets
- **Browser to Socket.IO Server**: WebSocket connection for real-time messaging and notifications
- **React App to API Server**: HTTP/HTTPS API requests for data operations
- **API Server to MySQL**: Database queries for CRUD operations
- **Socket.IO Server to MySQL**: Database queries for real-time features
- **API Server to File Storage**: File operations for uploads and retrievals

## Infrastructure Considerations

1. **Scalability**:
   - Frontend can scale horizontally through CDN distribution
   - Backend can scale with additional instances behind a load balancer
   - Socket.IO may require sticky sessions for persistent connections

2. **Security**:
   - HTTPS/WSS for all connections
   - JWT for authentication
   - CORS policies to prevent unauthorized access

3. **Performance**:
   - CDN caching for static assets
   - Connection pooling for database access
   - Optimized WebSocket configuration for real-time communication

4. **Reliability**:
   - Database backups
   - Error logging and monitoring
   - Graceful degradation when real-time features are unavailable
