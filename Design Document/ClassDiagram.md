# Class Diagram - Freelancing Web Application

## Overview
This diagram illustrates the key classes and their relationships in the Freelancing Web Application, aligned with the database schema and code implementation.

## Diagram

```plantuml
@startuml

' Visual Paradigm style theme
!define MAIN_COLOR #1976D2
!define SECONDARY_COLOR #64B5F6
!define ACCENT_COLOR #FF9800
!define DARK_TEXT #333333
!define LIGHT_TEXT #FFFFFF

' Styling
skinparam class {
  BackgroundColor SECONDARY_COLOR
  BorderColor MAIN_COLOR
  ArrowColor MAIN_COLOR
  FontColor DARK_TEXT
  BorderThickness 2
  Stereotypes {
    Font {
      Size 0
    }
  }
}

skinparam stereotypeCBackgroundColor SECONDARY_COLOR
skinparam stereotypeCBorderColor MAIN_COLOR

skinparam note {
  BackgroundColor #FFF9C4
  BorderColor #FFD54F
  FontColor DARK_TEXT
}

skinparam package {
  BackgroundColor #E3F2FD
  BorderColor MAIN_COLOR
}

skinparam arrow {
  Color MAIN_COLOR
  FontColor DARK_TEXT
}

' Make all lines straight with sharp edges
skinparam linetype ortho

hide empty members
hide stereotypes

' User Management Classes
class User {
  +int id
  +string email
  +string password
  +datetime created_at
  +authenticate()
  +register()
  +updateProfile()
}

class UserFactory {
  +{static} createUser(type, params)
}

class Client {
  +int id
  +string name
  +string image
  +getOrderHistory()
  +createOrder()
  +saveProfile(database_pool)
}

class Freelancer {
  +int id
  +string name
  +string bio
  +float rating
  +string skills
  +string image
  +createGig()
  +updateGig()
  +completeOrder()
  +updateProfile()
  +float getCompletionRate()
  +saveProfile(database_pool)
}

class FreelancerExperience {
  +int id
  +int freelancer_id
  +string title
  +string company
  +date start_date
  +date end_date
  +string description
  +datetime created_at
  +addExperience()
  +updateExperience()
  +deleteExperience()
}

' Gig Related Classes
class Gig {
  +int id
  +int freelancer_id
  +string title
  +string description
  +string category
  +string image
  +int state
  +int views
  +datetime created_at
  +datetime updated_at
  +createGig()
  +updateGig()
  +toggleState()
  +incrementViews()
  +fetchRandomGigs()
}

class Package {
  +int id
  +int gig_id
  +int type
  +float price
  +string package_details
  +int delivery_time
  +createPackage()
  +updatePackage()
}

' Order Classes
class Order {
  +int id
  +int client_id
  +int freelancer_id
  +int gig_id
  +int package_id
  +string status
  +string requirements
  +datetime delivery_date
  +datetime created_at
  +datetime updated_at
  +createOrder()
  +updateStatus()
  +cancelOrder()
  +completeOrder()
}

class WorkSubmission {
  +int id
  +int order_id
  +string content
  +string attachment_url
  +string status
  +datetime created_at
  +submitWork()
  +requestRevision()
  +acceptSubmission()
}

' Review Classes
class Review {
  +int id
  +int order_id
  +int client_id
  +int freelancer_id
  +int rating
  +string comment
  +datetime created_at
  +createReview()
  +updateReview()
}

' Messaging Classes
class Conversation {
  +int id
  +int user_one_id
  +int user_two_id
  +string last_message
  +datetime last_message_time
  +datetime created_at
  +createConversation()
  +updateLastMessage()
  +getMessages()
}

class Message {
  +int id
  +int conversation_id
  +int sender_id
  +string content
  +string attachment_url
  +string type
  +string status
  +datetime created_at
}

class MessagingFacade {
  +{static} sendMessage(messageData, file)
  +{static} getMessages(conversationId)
  +{static} markMessagesAsRead(conversationId, userId)
  +{static} deleteMessage(messageId, userId)
  -{static} _processMessageData(messageData, file)
  -{static} _saveMessageToDatabase(data)
  -{static} _updateConversation(conversationId, lastMessage)
  -{static} _notifyRecipient(data)
}

class MessagesController {
  +uploadMessages(req, res)
  +retrieveMessages(req, res)
  +markAsRead(req, res)
  +deleteMessage(req, res)
}

' Notification Classes
class Notification {
  +int id
  +int user_id
  +string type
  +string title
  +string message
  +int related_id
  +boolean is_read
  +datetime created_at
}

class NotificationService <<Singleton>> {
  +sendNotification(userId, type, title, message, relatedId)
  +saveToDatabase(userId, type, title, message, relatedId)
  +sendRealTimeNotification(userId, notificationId, type, title, message, relatedId)
  +getNotifications(userId)
  +markAsRead(notificationId)
  +markAllAsRead(userId)
  +getUnreadCount(userId)
}

class NotificationController {
  +createNotification(userId, type, title, message, relatedId)
  +getUserNotifications(req, res)
  +markNotificationAsRead(req, res)
  +markAllNotificationsAsRead(req, res)
  +getUnreadNotificationCount(req, res)
}

' Socket Classes
class SocketManager {
  +Map userConnections
  +Set onlineUsers
  +configureSocket()
  +registerUserEvents()
  +registerMessageEvents()
  +registerOrderEvents()
  +registerDisconnectEvents()
  +findUserBySocketId()
}

' Dashboard Classes
class FreelancerDashboard {
  +array gigs
  +string filterType
  +object dashboardStats
  +string selectedTimeRange
  +fetchGigs()
  +fetchDashboardStats()
  +filteredGigs()
  +getTopViewedGigs()
  +handleFilterChange()
  +toggleGigState()
  +handleTimeRangeChange()
}

' Authentication Classes
class AuthController {
  +signup(req, res)
  +login(req, res)
  +logout(req, res)
  +checkAuthStatus(req, res)
  +updateProfile(req, res)
}

' Relationships
User <|-- Client
User <|-- Freelancer
UserFactory ..> User : creates
UserFactory ..> Client : creates
UserFactory ..> Freelancer : creates
Freelancer "1" o-- "*" FreelancerExperience : has
Freelancer "1" o-- "*" Gig : creates
Gig "1" o-- "*" Package : has
Client "1" o-- "*" Order : places
Freelancer "1" o-- "*" Order : fulfills
Gig "1" o-- "*" Order : references
Package "1" o-- "*" Order : included in
Order "1" o-- "0..1" Review : receives
Order "1" o-- "*" WorkSubmission : has
User "1" o-- "*" Conversation : participates
Conversation "1" o-- "*" Message : contains
User "1" o-- "*" Notification : receives
MessagesController --> MessagingFacade : uses
MessagingFacade --> NotificationController : uses
NotificationController --> NotificationService : uses
NotificationService --> Notification : manages
SocketManager --> NotificationService : enables real-time notifications
AuthController --> UserFactory : uses
AuthController --> User : manages
SocketManager -- Message : transmits
SocketManager -- Order : updates
FreelancerDashboard -- Gig : displays

@enduml
```

### Backend Design Patterns

Your Freelancing Web Application implements several design patterns to maintain a clean, maintainable, and extensible architecture. These patterns help organize your code, separate concerns, and make the system more robust.

#### 1. Factory Pattern (User Management)

```plantuml
@startuml

' Visual Paradigm style theme
!define MAIN_COLOR #1976D2
!define SECONDARY_COLOR #64B5F6
!define ACCENT_COLOR #FF9800
!define DARK_TEXT #333333
!define LIGHT_TEXT #FFFFFF

' Styling
skinparam class {
  BackgroundColor SECONDARY_COLOR
  BorderColor MAIN_COLOR
  ArrowColor MAIN_COLOR
  FontColor DARK_TEXT
  BorderThickness 2
  Stereotypes {
    Font {
      Size 0
    }
  }
}

skinparam stereotypeCBackgroundColor SECONDARY_COLOR
skinparam stereotypeCBorderColor MAIN_COLOR

skinparam note {
  BackgroundColor #FFF9C4
  BorderColor #FFD54F
  FontColor DARK_TEXT
}

skinparam package {
  BackgroundColor #E3F2FD
  BorderColor MAIN_COLOR
}

skinparam arrow {
  Color MAIN_COLOR
  FontColor DARK_TEXT
}

' Make all lines straight with sharp edges
skinparam linetype ortho

hide empty members
hide stereotypes

package "User Management" {
  abstract class User {
    + id: number
    + name: string
    + image: string
    + constructor(params)
    + saveProfile(database_pool): Promise<void>
  }
  
  class Client {
    + saveProfile(database_pool): Promise<void>
  }
  
  class Freelancer {
    + bio: string
    + constructor(params)
    + saveProfile(database_pool): Promise<void>
  }
  
  class UserFactory {
    + {static} createUser(type, params): User
  }
  
  class AuthController {
    + signup(req, res): Promise<void>
    + login(req, res): Promise<void>
    + logout(req, res): Promise<void>
    + checkAuthStatus(req, res): Promise<void>
  }
  
  User <|-- Client
  User <|-- Freelancer
  UserFactory ..> User : creates >
  UserFactory ..> Client : creates >
  UserFactory ..> Freelancer : creates >
  AuthController --> UserFactory : uses >
}

note bottom of UserFactory
  The Factory Pattern creates different user types
  based on the role (client or freelancer)
  without exposing the instantiation logic.
end note

@enduml
```

**Implementation**: The Factory Pattern is used in your `UserFactory` class to create different types of users (Client or Freelancer) based on the user type. This pattern encapsulates the object creation logic, making your code more maintainable and allowing for easy addition of new user types in the future.

**Benefits**:
- Centralizes user creation logic
- Makes the system more flexible when adding new user types
- Simplifies the authentication controller by delegating user creation

#### 2. Facade Pattern (Messaging System)

```plantuml
@startuml

' Visual Paradigm style theme
!define MAIN_COLOR #1976D2
!define SECONDARY_COLOR #64B5F6
!define ACCENT_COLOR #FF9800
!define DARK_TEXT #333333
!define LIGHT_TEXT #FFFFFF

' Styling
skinparam class {
  BackgroundColor SECONDARY_COLOR
  BorderColor MAIN_COLOR
  ArrowColor MAIN_COLOR
  FontColor DARK_TEXT
  BorderThickness 2
  Stereotypes {
    Font {
      Size 0
    }
  }
}

skinparam stereotypeCBackgroundColor SECONDARY_COLOR
skinparam stereotypeCBorderColor MAIN_COLOR

skinparam note {
  BackgroundColor #FFF9C4
  BorderColor #FFD54F
  FontColor DARK_TEXT
}

skinparam package {
  BackgroundColor #E3F2FD
  BorderColor MAIN_COLOR
}

skinparam arrow {
  Color MAIN_COLOR
  FontColor DARK_TEXT
}

' Make all lines straight with sharp edges
skinparam linetype ortho

hide empty members
hide stereotypes

package "Messaging Subsystem" {
  class MessagingFacade {
    + {static} sendMessage(messageData, file): Promise<Object>
    + {static} getMessages(conversationId): Promise<Array>
    + {static} markMessagesAsRead(conversationId, userId): Promise<Object>
    + {static} deleteMessage(messageId, userId): Promise<Object>
    - {static} _processMessageData(messageData, file): Object
    - {static} _saveMessageToDatabase(data): Promise<number>
    - {static} _updateConversation(conversationId, lastMessage): Promise<void>
    - {static} _notifyRecipient(data): Promise<void>
  }
  
  class MessagesController {
    + uploadMessages(req, res): Promise<void>
    + retrieveMessages(req, res): Promise<void>
    + markAsRead(req, res): Promise<void>
    + deleteMessage(req, res): Promise<void>
  }
  
  class Message {
    + id: number
    + conversation_id: number
    + sender_id: number
    + content: string
    + attachment_url: string
    + type: string
    + status: string
    + created_at: datetime
  }
  
  class Conversation {
    + id: number
    + user_one_id: number
    + user_two_id: number
    + last_message: string
    + last_message_time: datetime
    + created_at: datetime
  }
  
  class NotificationController {
    + createNotification(userId, type, title, message, relatedId): Promise<void>
  }
  
  MessagesController --> MessagingFacade : uses >
  MessagingFacade --> Message : manages >
  MessagingFacade --> Conversation : updates >
  MessagingFacade --> NotificationController : notifies recipients >
}

note bottom of MessagingFacade
  The Facade Pattern provides a simplified interface
  to the complex messaging subsystem, handling database
  operations, conversation updates, and notifications.
end note

@enduml
```

**Implementation**: The `MessagingFacade` class provides a simplified interface to the complex messaging subsystem. It encapsulates database operations, conversation updates, and notification creation behind a clean API, making it easier for controllers to interact with the messaging system.

**Benefits**:
- Simplifies the messaging interface for client code
- Centralizes related operations (saving messages, updating conversations, sending notifications)
- Reduces dependencies between components
- Improves code maintainability

#### 3. Singleton Pattern (Notification Service)

```plantuml
@startuml

' Visual Paradigm style theme
!define MAIN_COLOR #1976D2
!define SECONDARY_COLOR #64B5F6
!define ACCENT_COLOR #FF9800
!define DARK_TEXT #333333
!define LIGHT_TEXT #FFFFFF

' Styling
skinparam class {
  BackgroundColor SECONDARY_COLOR
  BorderColor MAIN_COLOR
  ArrowColor MAIN_COLOR
  FontColor DARK_TEXT
  BorderThickness 2
  Stereotypes {
    Font {
      Size 0
    }
  }
}

skinparam stereotypeCBackgroundColor SECONDARY_COLOR
skinparam stereotypeCBorderColor MAIN_COLOR

skinparam note {
  BackgroundColor #FFF9C4
  BorderColor #FFD54F
  FontColor DARK_TEXT
}

skinparam package {
  BackgroundColor #E3F2FD
  BorderColor MAIN_COLOR
}

skinparam arrow {
  Color MAIN_COLOR
  FontColor DARK_TEXT
}

' Make all lines straight with sharp edges
skinparam linetype ortho

hide empty members
hide stereotypes

package "Notification System" {
  class Notification {
    + id: number
    + user_id: number
    + type: string
    + title: string
    + message: string
    + related_id: number
    + is_read: boolean
    + created_at: datetime
  }
  
  class NotificationService <<Singleton>> {
    + sendNotification(userId, type, title, message, relatedId): Promise<boolean>
    + saveToDatabase(userId, type, title, message, relatedId): Promise<number>
    + sendRealTimeNotification(userId, notificationId, type, title, message, relatedId): void
    + getNotifications(userId): Promise<Array>
    + markAsRead(notificationId): Promise<boolean>
    + markAllAsRead(userId): Promise<boolean>
    + getUnreadCount(userId): Promise<number>
  }
  
  class NotificationController {
    + createNotification(userId, type, title, message, relatedId): Promise<void>
    + getUserNotifications(req, res): Promise<void>
    + markNotificationAsRead(req, res): Promise<void>
    + markAllNotificationsAsRead(req, res): Promise<void>
    + getUnreadNotificationCount(req, res): Promise<void>
  }
  
  NotificationController --> NotificationService : uses >
  NotificationService --> Notification : manages >
}

note bottom of NotificationService
  The Singleton Pattern ensures a single instance
  of NotificationService is used throughout the application,
  providing a centralized point for notification management.
end note

@enduml
```

**Implementation**: The `NotificationService` is implemented as a singleton to ensure a single point of access throughout the application. This pattern is appropriate for services that need to maintain state and provide consistent behavior across the application.

**Benefits**:
- Ensures only one instance of the service exists
- Provides a global point of access to the service
- Conserves resources by avoiding multiple instances
- Maintains consistent state for notifications

#### 4. Observer Pattern (Socket Communication)

```plantuml
@startuml

' Visual Paradigm style theme
!define MAIN_COLOR #1976D2
!define SECONDARY_COLOR #64B5F6
!define ACCENT_COLOR #FF9800
!define DARK_TEXT #333333
!define LIGHT_TEXT #FFFFFF

' Styling
skinparam class {
  BackgroundColor SECONDARY_COLOR
  BorderColor MAIN_COLOR
  ArrowColor MAIN_COLOR
  FontColor DARK_TEXT
  BorderThickness 2
  Stereotypes {
    Font {
      Size 0
    }
  }
}

skinparam stereotypeCBackgroundColor SECONDARY_COLOR
skinparam stereotypeCBorderColor MAIN_COLOR

skinparam note {
  BackgroundColor #FFF9C4
  BorderColor #FFD54F
  FontColor DARK_TEXT
}

skinparam package {
  BackgroundColor #E3F2FD
  BorderColor MAIN_COLOR
}

skinparam arrow {
  Color MAIN_COLOR
  FontColor DARK_TEXT
}

' Make all lines straight with sharp edges
skinparam linetype ortho

hide empty members
hide stereotypes

package "Real-time Communication" {
  class SocketManager {
    + userConnections: Map
    + onlineUsers: Set
    + configureSocket(server): Object
    + registerUserEvents(socket, io): void
    + registerMessageEvents(socket, io): void
    + registerOrderEvents(socket, io): void
    + registerDisconnectEvents(socket, io): void
  }
  
  class Client {
    + onReceiveMessage(data): void
    + onUserStatusChange(data): void
    + onNotification(data): void
  }
  
  class NotificationService {
    + sendRealTimeNotification(): void
  }
  
  class MessagingFacade {
    + sendMessage(): Promise<Object>
  }
  
  SocketManager --> Client : notifies >
  NotificationService --> SocketManager : uses >
  MessagingFacade --> SocketManager : uses >
}

note bottom of SocketManager
  The Observer Pattern allows clients to subscribe
  to real-time events (messages, notifications, status changes)
  and receive updates when those events occur.
end note

@enduml
```

**Implementation**: Your socket implementation uses the Observer Pattern to handle real-time communication. Clients subscribe to events (by joining rooms or registering event handlers), and the server notifies them when relevant events occur (new messages, notifications, status changes).

**Benefits**:
- Enables real-time updates without polling
- Decouples event producers from event consumers
- Allows for dynamic subscription and unsubscription
- Supports broadcasting to multiple clients

## Description

The class diagram illustrates the main entities and their relationships in the Freelancing Web Application, aligned with the database schema and code implementation:

### User Management
- **User**: The base class for all users in the system
- **UserFactory**: Creates appropriate user types based on role
- **Client**: Extends User, representing clients who order services
- **Freelancer**: Extends User, representing freelancers who provide services
- **AuthController**: Handles authentication operations including signup, login, and session management

### Gig Management
- **Gig**: Represents services offered by freelancers
- **Package**: Represents different service tiers for a gig (Basic, Standard, Premium)

### Order Management
- **Order**: Represents a transaction between a client and a freelancer
- **WorkSubmission**: Deliverables submitted for orders
- **Review**: Represents feedback provided after order completion

### Communication
- **Conversation**: Manages communication between users
- **Message**: Individual messages within a conversation
- **MessagingFacade**: Simplifies interactions with the messaging subsystem
- **Notification**: System notifications for various events

### System Components
- **SocketManager**: Handles real-time communications
- **NotificationService**: Singleton service for managing notifications
- **FreelancerDashboard**: Manages the freelancer's view of their gigs and statistics

## Design Patterns

1. **Factory Pattern**: The UserFactory creates appropriate user objects (Client or Freelancer) based on the user type.

2. **Facade Pattern**: The MessagingFacade simplifies complex messaging operations behind a clean interface.

3. **Singleton Pattern**: The NotificationService is implemented as a singleton to ensure a single point of access.

4. **Observer Pattern**: The socket implementation allows clients to subscribe to events and receive real-time updates.

## Relationships

- A User can be either a Client or a Freelancer
- The UserFactory creates User objects of different types
- Freelancers create Gigs with multiple Packages
- Clients place Orders for specific Gigs and Packages
- Orders can receive Reviews and WorkSubmissions
- Users participate in Conversations that contain Messages
- Users receive Notifications about system events
- SocketManager enables real-time communication for Messages and Notifications
