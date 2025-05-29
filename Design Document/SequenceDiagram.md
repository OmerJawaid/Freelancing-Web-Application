# Sequence Diagrams - Freelancing Web Application

## Overview
These sequence diagrams illustrate key interactions and processes in the Freelancing Web Application, with special focus on the real-time messaging system, including the implemented Facade and Strategy design patterns.

## Real-Time Messaging Sequence

```plantuml
@startuml
!define LIGHTBLUE #ADD8E6
!define BLUE #2196F3

skinparam ParticipantBackgroundColor LIGHTBLUE
skinparam ParticipantBorderColor BLUE
skinparam ParticipantFontColor black
skinparam ParticipantFontStyle bold

skinparam SequenceArrowThickness 2
skinparam SequenceArrowColor black
skinparam SequenceLifeLineBorderColor BLUE

participant "Client (Browser)" as Client
participant "Messages Component" as FrontendMsg
participant "Socket.IO Client" as Socket
participant "Socket.IO Server" as SocketServer
participant "Message Controller" as MsgController
participant "Database" as DB

' Socket Connection
Client -> FrontendMsg: Open Messages Page
FrontendMsg -> Socket: Initialize Socket Connection
Socket -> SocketServer: Connect
SocketServer --> Socket: Connection Established (socket.id)
Socket -> SocketServer: join (userId)
SocketServer -> SocketServer: Register user in connections map
SocketServer --> Socket: user_status_change (online)

' Join Conversation
FrontendMsg -> Socket: join_conversation (conversationId)
Socket -> SocketServer: join_conversation
SocketServer -> SocketServer: Add socket to conversation room
SocketServer --> Socket: user_joined_conversation

' Load Messages
FrontendMsg -> MsgController: GET /messages/retrieve (conversationId)
MsgController -> DB: Query messages
DB --> MsgController: Return messages
MsgController --> FrontendMsg: Messages JSON
FrontendMsg -> FrontendMsg: Sort messages by timestamp
FrontendMsg -> FrontendMsg: Render messages
FrontendMsg -> FrontendMsg: Auto-scroll to latest

' Send Message
FrontendMsg -> FrontendMsg: User types and sends message
FrontendMsg -> MsgController: POST /messages/upload (with FormData)
MsgController -> DB: Insert message
MsgController -> DB: Update conversation last_message
DB --> MsgController: Confirm save
MsgController --> FrontendMsg: Success response with message details

' Real-time Message Delivery
FrontendMsg -> Socket: send_message (messageData)
Socket -> SocketServer: send_message
SocketServer -> SocketServer: Format message object
SocketServer -> SocketServer: Emit to conversation room
SocketServer --> Socket: receive_message (to sender)
SocketServer --> Socket: receive_message (to other participants)
Socket -> FrontendMsg: receive_message event
FrontendMsg -> FrontendMsg: Add message to chat
FrontendMsg -> FrontendMsg: Update conversation list
FrontendMsg -> FrontendMsg: Auto-scroll to latest

' Handling Attachments
FrontendMsg -> FrontendMsg: User selects file
FrontendMsg -> FrontendMsg: Preview attachment
FrontendMsg -> MsgController: POST /messages/upload (with file)
MsgController -> MsgController: Save file to storage
MsgController -> DB: Insert message with attachment URL
MsgController --> FrontendMsg: Success with attachment URL
FrontendMsg -> Socket: send_message (with attachment info)
Socket -> SocketServer: send_message
SocketServer --> Socket: receive_message
Socket -> FrontendMsg: receive_message event
FrontendMsg -> FrontendMsg: Display message with attachment
@enduml
```

## Authentication Sequence

```plantuml
@startuml
!define LIGHTBLUE #ADD8E6
!define BLUE #2196F3

skinparam ParticipantBackgroundColor LIGHTBLUE
skinparam ParticipantBorderColor BLUE
skinparam ParticipantFontColor black
skinparam ParticipantFontStyle bold

skinparam SequenceArrowThickness 2
skinparam SequenceArrowColor black
skinparam SequenceLifeLineBorderColor BLUE

participant "User" as User
participant "Browser" as Browser
participant "Login/Signup Component" as AuthComponent
participant "Auth Context" as AuthContext
participant "API Server" as APIServer
participant "Auth Controller" as AuthController
participant "Database" as DB

' Login Flow
User -> Browser: Navigate to Login Page
Browser -> AuthComponent: Render Login Form
User -> AuthComponent: Enter Credentials
AuthComponent -> AuthContext: Call login()
AuthContext -> APIServer: POST /authentication/login
APIServer -> AuthController: Process Login
AuthController -> DB: Verify Credentials
DB --> AuthController: User Data
AuthController --> APIServer: Generate JWT Token
APIServer --> AuthContext: Return User Data & Token
AuthContext -> AuthContext: Store User in State
AuthContext -> Browser: Store User in LocalStorage
AuthContext --> AuthComponent: Update isAuthenticated
AuthComponent -> Browser: Redirect to Dashboard

' Auth Check
Browser -> AuthContext: Application Load
AuthContext -> Browser: Check LocalStorage
Browser --> AuthContext: Return Stored User
AuthContext -> AuthContext: Set User State
AuthContext -> APIServer: GET /authentication/check-auth
APIServer -> AuthController: Validate Token
AuthController --> APIServer: Validation Result
APIServer --> AuthContext: Auth Status
AuthContext -> AuthContext: Update Auth State
@enduml
```

## Order Creation Sequence

```plantuml
@startuml
!define LIGHTBLUE #ADD8E6
!define BLUE #2196F3

skinparam ParticipantBackgroundColor LIGHTBLUE
skinparam ParticipantBorderColor BLUE
skinparam ParticipantFontColor black
skinparam ParticipantFontStyle bold

skinparam SequenceArrowThickness 2
skinparam SequenceArrowColor black
skinparam SequenceLifeLineBorderColor BLUE

participant "Client User" as Client
participant "Gig Display Page" as GigPage
participant "Order API" as OrderAPI
participant "Order Controller" as OrderController
participant "Database" as DB
participant "Notification System" as NotificationSystem
participant "Freelancer Socket" as FreelancerSocket

' Browse and Select
Client -> GigPage: View Gig Details
GigPage -> OrderAPI: GET /gigs/retrieve-by-id
OrderAPI -> DB: Query Gig and Packages
DB --> OrderAPI: Gig Data
OrderAPI --> GigPage: Display Gig & Packages

' Create Order
Client -> GigPage: Select Package
Client -> GigPage: Click "Order Now"
GigPage -> OrderAPI: POST /orders/create
OrderAPI -> OrderController: Create Order
OrderController -> DB: Insert Order Record
DB --> OrderController: Order ID

' Notification
OrderController -> NotificationSystem: Create Order Notification
NotificationSystem -> DB: Save Notification
NotificationSystem -> FreelancerSocket: Emit notification event

' Response
OrderController --> OrderAPI: Order Created
OrderAPI --> GigPage: Success Response
GigPage -> Client: Redirect to Order Details
@enduml
```

## Gig Creation Sequence

```plantuml
@startuml
!define LIGHTBLUE #ADD8E6
!define BLUE #2196F3

skinparam ParticipantBackgroundColor LIGHTBLUE
skinparam ParticipantBorderColor BLUE
skinparam ParticipantFontColor black
skinparam ParticipantFontStyle bold

skinparam SequenceArrowThickness 2
skinparam SequenceArrowColor black
skinparam SequenceLifeLineBorderColor BLUE

participant "Freelancer User" as Freelancer
participant "Create Gig Page" as CreateGig
participant "Gig API" as GigAPI
participant "Gig Controller" as GigController
participant "File Upload Middleware" as FileMiddleware
participant "File Storage" as Storage
participant "Database" as DB

' Form Interaction
Freelancer -> CreateGig: Navigate to Create Gig
CreateGig -> Freelancer: Display Gig Form
Freelancer -> CreateGig: Fill Gig Details
Freelancer -> CreateGig: Add Packages
Freelancer -> CreateGig: Upload Images

' Form Submission
Freelancer -> CreateGig: Submit Form
CreateGig -> GigAPI: POST /gigs/create (FormData)
GigAPI -> FileMiddleware: Process Image Upload
FileMiddleware -> Storage: Save Image
Storage --> FileMiddleware: Image URL

' Database Operations
GigAPI -> GigController: Create Gig
GigController -> DB: Insert Gig Record
DB --> GigController: Gig ID
GigController -> DB: Insert Package Records
DB --> GigController: Package IDs

' Response
GigController --> GigAPI: Success Response
GigAPI --> CreateGig: Gig Created
CreateGig -> Freelancer: Redirect to Dashboard
@enduml
```

## Message Exchange with Facade Pattern

```plantuml
@startuml
participant User
participant "Chat UI" as UI
participant "Messages Controller" as MC
participant "MessagingFacade" as MF
participant "Database" as DB
participant "NotificationController" as NC
participant "Socket Server" as SS
participant "Recipient" as R

User -> UI: Enter message and click send
UI -> MC: POST /messages/send
MC -> MF: sendMessage(messageData, file)
activate MF

MF -> MF: _processMessageData()
note right: Process message content and attachments

MF -> DB: _saveMessageToDatabase()
note right: Save message to database with status="sent"
DB --> MF: Return messageId

MF -> DB: _updateConversation()
note right: Update conversation's last message and timestamp

MF -> NC: _notifyRecipient()
activate NC
NC -> DB: Query conversation participants
DB --> NC: Return conversation data
NC --> MF: Notification sent
deactivate NC

MF --> MC: Return success result
deactivate MF
MC --> UI: Return success response
UI -> UI: Update UI and show message as sent

alt Recipient is online
    SS -> R: Forward message via socket
    R -> R: Display message and notification
    R -> R: Update conversation
else Recipient is offline
    note right: Message will be retrieved when recipient connects
end
@enduml
```

## Notification Delivery with Strategy Pattern

```plantuml
@startuml
participant "MessagingFacade" as MF
participant "NotificationController" as NC
participant "NotificationFactory" as NF
participant "Database" as DB
participant "UserPreferences" as UP
participant "NotificationStrategy" as NS
participant "InAppStrategy" as IAS
participant "EmailStrategy" as ES
participant "Socket" as S
participant "Email Service" as EM
participant "User" as U

MF -> NC: createNotification(userId, type, title, message, relatedId)
activate NC

NC -> NF: getStrategyForUser(userId)
activate NF

NF -> DB: Query user preferences
DB --> NF: Return preferences

alt No preferences found
    NF -> DB: Create default preferences
    note right: in-app=true, email=false
end

note over NF: Determine which strategies to use

alt In-app notifications enabled
    NF -> IAS: Create InAppNotificationStrategy
    activate IAS
end

alt Email notifications enabled
    NF -> ES: Create EmailNotificationStrategy
    activate ES
end

alt Multiple strategies enabled
    NF -> NS: Create CombinedNotificationStrategy([strategies])
    activate NS
else Single strategy
    note over NF: Return single strategy
end

NF --> NC: Return appropriate strategy
deactivate NF

NC -> NS: sendNotification(userId, type, title, message, relatedId)

alt Using CombinedStrategy
    NS -> IAS: sendNotification()
    NS -> ES: sendNotification()
    
    IAS -> DB: Save notification to database
    DB --> IAS: Return notificationId
    
    IAS -> S: Emit notification to user
    S -> U: Display notification
    IAS --> NS: Return result
    
    ES -> DB: Save notification to database
    ES -> DB: Get user email
    DB --> ES: Return user email
    ES -> EM: Send formatted email
    EM --> ES: Email sent
    ES --> NS: Return result
    
    NS --> NC: Return combined result
else Using InAppStrategy only
    NC -> IAS: sendNotification()
    IAS -> DB: Save notification to database
    IAS -> S: Emit notification if user online
    IAS --> NC: Return result
else Using EmailStrategy only
    NC -> ES: sendNotification()
    ES -> DB: Save notification to database
    ES -> EM: Send email notification
    ES --> NC: Return result
end

NC --> MF: Notification sent
deactivate NC
@enduml
```

## Notable Interactions

These sequence diagrams illustrate key interactions in the Freelancing Web Application:

1. **Real-Time Messaging with Facade Pattern**:
   - Using MessagingFacade to simplify message handling
   - Centralized message processing and database operations
   - Notification delivery through the facade
   - Real-time message delivery via sockets

2. **Notification System with Strategy Pattern**:
   - Dynamic selection of notification strategies based on user preferences
   - In-app notifications through socket connections
   - Email notifications with formatted templates
   - Combined notification delivery for multiple channels

3. **Authentication**:
   - Login process
   - Token handling
   - Authentication checking

4. **Order Creation**:
   - Browsing gigs
   - Creating an order
   - Notification delivery

5. **Gig Creation**:
   - Form interaction
   - File upload handling
   - Database operations

These diagrams showcase the interaction between frontend components, backend services, and the database, highlighting the flow of data and the sequence of operations in the application. The implementation of design patterns improves code organization, maintainability, and extensibility.
