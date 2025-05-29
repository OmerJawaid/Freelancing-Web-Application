# Component Diagram - Freelancing Web Application

## Overview
This diagram illustrates the major components of the Freelancing Web Application and their interactions.

## Diagram

```plantuml
@startuml

!define COMPONENT_BG_COLOR #E3F2FD
!define COMPONENT_BORDER_COLOR #1976D2
!define COMPONENT_FONT_COLOR #000000
!define DATABASE_BG_COLOR #E8F5E9
!define DATABASE_BORDER_COLOR #388E3C
!define CLOUD_BG_COLOR #FFF8E1
!define CLOUD_BORDER_COLOR #FFA000
!define INTERFACE_COLOR #9E9E9E

skinparam backgroundColor white
skinparam handwritten false
skinparam shadowing false
skinparam linetype ortho

skinparam component {
    BackgroundColor COMPONENT_BG_COLOR
    BorderColor COMPONENT_BORDER_COLOR
    FontColor COMPONENT_FONT_COLOR
    BorderThickness 2
    FontSize 14
    FontStyle bold
    ArrowColor COMPONENT_BORDER_COLOR
    ArrowThickness 1.5
    Style rectangle
}

skinparam database {
    BackgroundColor DATABASE_BG_COLOR
    BorderColor DATABASE_BORDER_COLOR
    FontColor COMPONENT_FONT_COLOR
    BorderThickness 2
}

skinparam cloud {
    BackgroundColor CLOUD_BG_COLOR
    BorderColor CLOUD_BORDER_COLOR
    FontColor COMPONENT_FONT_COLOR
    BorderThickness 2
}

skinparam frame {
    BackgroundColor transparent
    BorderColor #78909C
    FontStyle bold
    FontSize 16
}

skinparam interface {
    BackgroundColor white
    BorderColor INTERFACE_COLOR
}

skinparam arrow {
    Color #424242
    Thickness 1.5
}

' Major Frontend Components
frame "Frontend (React)" {
    component "Client Application" as ClientApp
    component "React Router" as Router
    component "Auth Context" as AuthContext
    component "API Service" as ApiService
    component "Socket Service" as SocketService
}

' Major Backend Components
frame "Backend (Node.js/Express)" {
    component "API Server" as APIServer
    component "Socket.IO Server" as SocketServer
    component "Controllers" as Controller
    component "Middleware" as Middleware
    component "Database Connection" as DBConnection
}

' Database
frame "Database (MySQL)" {
    database "User Data" as UserDB
    database "Gig Data" as GigDB
    database "Order Data" as OrderDB
    database "Message Data" as MessageDB
}

' External Services
frame "External Services" {
    cloud "File Storage" as FileStorage
}

' Interfaces for connections
interface "API" as FrontendAPI
interface "WebSockets" as WebSockets
interface "Database" as DBInterface
interface "Storage" as FileStorageInterface

' Frontend internal connections
ClientApp -down-> Router
Router -down-> AuthContext
ClientApp -down-> ApiService
ClientApp -down-> SocketService

' Backend internal connections
APIServer -down-> Controller
SocketServer -down-> Controller
Controller -down-> Middleware
Controller -down-> DBConnection

' Frontend to Backend connections
ApiService -down-> FrontendAPI
FrontendAPI -down-> APIServer
SocketService -down-> WebSockets
WebSockets -down-> SocketServer

' Backend to Database connections
DBConnection -down-> DBInterface
DBInterface -down-> UserDB
DBInterface -down-> GigDB
DBInterface -down-> OrderDB
DBInterface -down-> MessageDB

' Backend to External Services
Middleware -down-> FileStorageInterface
FileStorageInterface -down-> FileStorage

@enduml
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
