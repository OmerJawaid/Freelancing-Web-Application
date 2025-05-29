# Class Diagram - Freelancing Web Application

## Overview
This diagram illustrates the key classes and their relationships in the Freelancing Web Application.

## Diagram

```plantuml
@startuml

' User Management Classes
class User {
  +int id
  +string email
  +string password
  +string role
  +datetime created_at
  +authenticate()
  +register()
  +updateProfile()
}

class Client {
  +int id
  +string name
  +string image
  +getOrderHistory()
  +createOrder()
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
}

class FreelancerExperience {
  +int id
  +int freelancer_id
  +string title
  +string company
  +date start_date
  +date end_date
  +string description
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
  +float amount
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
  +uploadMessage()
  +retrieveMessages()
  +processMessageData()
}

' Notification Classes
class Notification {
  +int id
  +int user_id
  +string type
  +string title
  +string content
  +int reference_id
  +boolean is_read
  +datetime created_at
  +createNotification()
  +markAsRead()
  +fetchNotifications()
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

' AuthContext Classes
class AuthContext {
  +User user
  +boolean isAuthenticated
  +boolean loading
  +login()
  +logout()
  +register()
  +checkAuthStatus()
}

' Relationships
User <|-- Client
User <|-- Freelancer
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
AuthContext -- User : manages
SocketManager -- Message : transmits
SocketManager -- Order : updates
FreelancerDashboard -- Gig : displays

@enduml
```

### Design Patterns Implementation

#### Facade Pattern for Messaging

```plantuml
@startuml

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
  
  MessagesController --> MessagingFacade : uses >
}

@enduml
```

#### Strategy Pattern for Notifications

```plantuml
@startuml

package "Notification System" {
  abstract class NotificationStrategy {
    + sendNotification(userId, type, title, message, relatedId): Promise<boolean>
    + saveToDatabase(userId, type, title, message, relatedId): Promise<number>
  }
  
  class InAppNotificationStrategy {
    + sendNotification(userId, type, title, message, relatedId): Promise<boolean>
  }
  
  class EmailNotificationStrategy {
    - transporter: NodemailerTransporter
    + constructor()
    + sendNotification(userId, type, title, message, relatedId): Promise<boolean>
    - getEmailSubject(type, title): string
    - getEmailBody(type, title, message, relatedId): string
  }
  
  class CombinedNotificationStrategy {
    - strategies: Array<NotificationStrategy>
    + constructor(strategies)
    + sendNotification(userId, type, title, message, relatedId): Promise<boolean>
  }
  
  class NotificationFactory {
    + {static} getStrategyForUser(userId): Promise<NotificationStrategy>
    - {static} createDefaultPreferences(userId): Promise<void>
  }
  
  class UserPreferences {
    - user_id: number
    - receive_in_app_notifications: boolean
    - receive_email_notifications: boolean
  }
  
  class NotificationController {
    + createNotification(userId, type, title, message, relatedId): Promise<void>
    + getUserNotifications(req, res): Promise<void>
    + markNotificationAsRead(req, res): Promise<void>
    + markAllNotificationsAsRead(req, res): Promise<void>
    + getUnreadNotificationCount(req, res): Promise<void>
  }
  
  NotificationStrategy <|-- InAppNotificationStrategy
  NotificationStrategy <|-- EmailNotificationStrategy
  NotificationStrategy <|-- CombinedNotificationStrategy
  NotificationFactory ..> NotificationStrategy : creates >
  NotificationFactory --> UserPreferences : reads >
  NotificationController --> NotificationFactory : uses >
  CombinedNotificationStrategy o-- NotificationStrategy : contains >
}

MessagingFacade --> NotificationController : uses for notifications >

@enduml
```

## Description

The class diagram illustrates the main entities and their relationships in the Freelancing Web Application:

### User Management
- **User**: The base class for all users in the system
- **Client**: Extends User, representing clients who order services
- **Freelancer**: Extends User, representing freelancers who provide services

### Gig Management
- **Gig**: Represents services offered by freelancers
- **Package**: Represents different service tiers for a gig (Basic, Standard, Premium)

### Order Management
- **Order**: Represents a transaction between a client and a freelancer
- **Review**: Represents feedback provided after order completion

### Communication
- **Conversation**: Manages communication between users
- **Message**: Individual messages within a conversation
- **Notification**: System notifications for various events

### System Components
- **SocketManager**: Handles real-time communications
- **AuthContext**: Manages authentication state

## Relationships

- A User can be either a Client or a Freelancer
- Freelancers create Gigs with multiple Packages
- Clients place Orders for specific Gigs and Packages
- Orders can receive Reviews after completion
- Users participate in Conversations that contain Messages
- Users receive Notifications about system events
- SocketManager handles real-time transmission of Messages and Notifications
- AuthContext manages the authentication state of Users
