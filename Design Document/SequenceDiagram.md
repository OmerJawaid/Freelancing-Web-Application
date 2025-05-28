# Sequence Diagrams - Freelancing Web Application

## Overview
These sequence diagrams illustrate key interactions and processes in the Freelancing Web Application, with special focus on the real-time messaging system.

## Real-Time Messaging Sequence

```mermaid
sequenceDiagram
    participant Client as Client (Browser)
    participant FrontendMsg as Messages Component
    participant Socket as Socket.IO Client
    participant SocketServer as Socket.IO Server
    participant MsgController as Message Controller
    participant DB as Database
    
    %% Socket Connection
    Client->>FrontendMsg: Open Messages Page
    FrontendMsg->>Socket: Initialize Socket Connection
    Socket->>SocketServer: Connect
    SocketServer-->>Socket: Connection Established (socket.id)
    Socket->>SocketServer: join (userId)
    SocketServer->>SocketServer: Register user in connections map
    SocketServer-->>Socket: user_status_change (online)
    
    %% Join Conversation
    FrontendMsg->>Socket: join_conversation (conversationId)
    Socket->>SocketServer: join_conversation
    SocketServer->>SocketServer: Add socket to conversation room
    SocketServer-->>Socket: user_joined_conversation
    
    %% Load Messages
    FrontendMsg->>MsgController: GET /messages/retrieve (conversationId)
    MsgController->>DB: Query messages
    DB-->>MsgController: Return messages
    MsgController-->>FrontendMsg: Messages JSON
    FrontendMsg->>FrontendMsg: Sort messages by timestamp
    FrontendMsg->>FrontendMsg: Render messages
    FrontendMsg->>FrontendMsg: Auto-scroll to latest
    
    %% Send Message
    FrontendMsg->>FrontendMsg: User types and sends message
    FrontendMsg->>MsgController: POST /messages/upload (with FormData)
    MsgController->>DB: Insert message
    MsgController->>DB: Update conversation last_message
    DB-->>MsgController: Confirm save
    MsgController-->>FrontendMsg: Success response with message details
    
    %% Real-time Message Delivery
    FrontendMsg->>Socket: send_message (messageData)
    Socket->>SocketServer: send_message
    SocketServer->>SocketServer: Format message object
    SocketServer->>SocketServer: Emit to conversation room
    SocketServer-->>Socket: receive_message (to sender)
    SocketServer-->>Socket: receive_message (to other participants)
    Socket->>FrontendMsg: receive_message event
    FrontendMsg->>FrontendMsg: Add message to chat
    FrontendMsg->>FrontendMsg: Update conversation list
    FrontendMsg->>FrontendMsg: Auto-scroll to latest
    
    %% Handling Attachments
    FrontendMsg->>FrontendMsg: User selects file
    FrontendMsg->>FrontendMsg: Preview attachment
    FrontendMsg->>MsgController: POST /messages/upload (with file)
    MsgController->>MsgController: Save file to storage
    MsgController->>DB: Insert message with attachment URL
    MsgController-->>FrontendMsg: Success with attachment URL
    FrontendMsg->>Socket: send_message (with attachment info)
    Socket->>SocketServer: send_message
    SocketServer-->>Socket: receive_message
    Socket->>FrontendMsg: receive_message event
    FrontendMsg->>FrontendMsg: Display message with attachment
```

## Authentication Sequence

```mermaid
sequenceDiagram
    participant User as User
    participant Browser as Browser
    participant AuthComponent as Login/Signup Component
    participant AuthContext as Auth Context
    participant APIServer as API Server
    participant AuthController as Auth Controller
    participant DB as Database
    
    %% Login Flow
    User->>Browser: Navigate to Login Page
    Browser->>AuthComponent: Render Login Form
    User->>AuthComponent: Enter Credentials
    AuthComponent->>AuthContext: Call login()
    AuthContext->>APIServer: POST /authentication/login
    APIServer->>AuthController: Process Login
    AuthController->>DB: Verify Credentials
    DB-->>AuthController: User Data
    AuthController-->>APIServer: Generate JWT Token
    APIServer-->>AuthContext: Return User Data & Token
    AuthContext->>AuthContext: Store User in State
    AuthContext->>Browser: Store User in LocalStorage
    AuthContext-->>AuthComponent: Update isAuthenticated
    AuthComponent->>Browser: Redirect to Dashboard
    
    %% Auth Check
    Browser->>AuthContext: Application Load
    AuthContext->>Browser: Check LocalStorage
    Browser-->>AuthContext: Return Stored User
    AuthContext->>AuthContext: Set User State
    AuthContext->>APIServer: GET /authentication/check-auth
    APIServer->>AuthController: Validate Token
    AuthController-->>APIServer: Validation Result
    APIServer-->>AuthContext: Auth Status
    AuthContext->>AuthContext: Update Auth State
```

## Order Creation Sequence

```mermaid
sequenceDiagram
    participant Client as Client User
    participant GigPage as Gig Display Page
    participant OrderAPI as Order API
    participant OrderController as Order Controller
    participant DB as Database
    participant NotificationSystem as Notification System
    participant FreelancerSocket as Freelancer Socket
    
    %% Browse and Select
    Client->>GigPage: View Gig Details
    GigPage->>OrderAPI: GET /gigs/retrieve-by-id
    OrderAPI->>DB: Query Gig and Packages
    DB-->>OrderAPI: Gig Data
    OrderAPI-->>GigPage: Display Gig & Packages
    
    %% Create Order
    Client->>GigPage: Select Package
    Client->>GigPage: Click "Order Now"
    GigPage->>OrderAPI: POST /orders/create
    OrderAPI->>OrderController: Create Order
    OrderController->>DB: Insert Order Record
    DB-->>OrderController: Order ID
    
    %% Notification
    OrderController->>NotificationSystem: Create Order Notification
    NotificationSystem->>DB: Save Notification
    NotificationSystem->>FreelancerSocket: Emit notification event
    
    %% Response
    OrderController-->>OrderAPI: Order Created
    OrderAPI-->>GigPage: Success Response
    GigPage->>Client: Redirect to Order Details
```

## Gig Creation Sequence

```mermaid
sequenceDiagram
    participant Freelancer as Freelancer User
    participant CreateGig as Create Gig Page
    participant GigAPI as Gig API
    participant GigController as Gig Controller
    participant FileMiddleware as File Upload Middleware
    participant Storage as File Storage
    participant DB as Database
    
    %% Form Interaction
    Freelancer->>CreateGig: Navigate to Create Gig
    CreateGig->>Freelancer: Display Gig Form
    Freelancer->>CreateGig: Fill Gig Details
    Freelancer->>CreateGig: Add Packages
    Freelancer->>CreateGig: Upload Images
    
    %% Form Submission
    Freelancer->>CreateGig: Submit Form
    CreateGig->>GigAPI: POST /gigs/create (FormData)
    GigAPI->>FileMiddleware: Process Image Upload
    FileMiddleware->>Storage: Save Image
    Storage-->>FileMiddleware: Image URL
    
    %% Database Operations
    GigAPI->>GigController: Create Gig
    GigController->>DB: Insert Gig Record
    DB-->>GigController: Gig ID
    GigController->>DB: Insert Package Records
    DB-->>GigController: Package IDs
    
    %% Response
    GigController-->>GigAPI: Success Response
    GigAPI-->>CreateGig: Gig Created
    CreateGig->>Freelancer: Redirect to Dashboard
```

## Notable Interactions

These sequence diagrams illustrate key interactions in the Freelancing Web Application:

1. **Real-Time Messaging**:
   - Socket connection establishment
   - Joining conversation rooms
   - Message retrieval and sorting
   - Real-time message delivery
   - Attachment handling

2. **Authentication**:
   - Login process
   - Token handling
   - Authentication checking

3. **Order Creation**:
   - Browsing gigs
   - Creating an order
   - Notification delivery

4. **Gig Creation**:
   - Form interaction
   - File upload handling
   - Database operations

These diagrams showcase the interaction between frontend components, backend services, and the database, highlighting the flow of data and the sequence of operations in the application.
