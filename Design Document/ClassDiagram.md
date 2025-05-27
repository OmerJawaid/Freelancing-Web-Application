# Class Diagram - Freelancing Web Application

## Overview
This diagram illustrates the key classes and their relationships in the Freelancing Web Application.

## Diagram

```mermaid
classDiagram
    %% User Management Classes
    class User {
        +int id
        +string email
        +string password
        +datetime created_at
        +string User_Type
        +string Image
        +authenticate()
        +register()
        +updateProfile()
    }
    
    class Client {
        +int id
        +string name
        +string bio
        +getOrderHistory()
        +createOrder()
    }
    
    class Freelancer {
        +int id
        +string name
        +string bio
        +float rating
        +string skills
        +string Image
        +createGig()
        +updateGig()
        +completeOrder()
    }
    
    %% Gig Related Classes
    class Gig {
        +int id
        +int freelancer_id
        +string title
        +string description
        +string category
        +string image
        +int state
        +int views
        +createGig()
        +updateGig()
        +deleteGig()
        +toggleState()
    }
    
    class Package {
        +int id
        +int gig_id
        +int type
        +float price
        +string title
        +string description
        +int delivery_time
        +int revisions
        +createPackage()
        +updatePackage()
    }
    
    %% Order Classes
    class Order {
        +int id
        +int client_id
        +int freelancer_id
        +int gig_id
        +int package_id
        +float amount
        +string status
        +datetime created_at
        +createOrder()
        +updateStatus()
        +cancelOrder()
        +completeOrder()
    }
    
    %% Review Classes
    class Review {
        +int id
        +int order_id
        +int client_id
        +int freelancer_id
        +int gig_id
        +int rating
        +string review_text
        +datetime created_at
        +createReview()
        +updateReview()
    }
    
    %% Messaging Classes
    class Conversation {
        +int id
        +int user_one_id
        +int user_two_id
        +string last_message
        +datetime last_message_time
        +int unread_count
        +createConversation()
        +markAsRead()
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
        +sendMessage()
        +markAsRead()
    }
    
    %% Notification Classes
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
    }

    %% Socket Classes
    class SocketManager {
        +Map userConnections
        +Set onlineUsers
        +configureSocket()
        +registerUserEvents()
        +registerMessageEvents()
        +registerNotificationEvents()
        +registerDisconnectEvents()
    }
    
    %% AuthContext Classes
    class AuthContext {
        +User user
        +boolean isAuthenticated
        +boolean loading
        +login()
        +logout()
        +register()
        +checkAuthStatus()
    }
    
    %% Relationships
    User <|-- Client : extends
    User <|-- Freelancer : extends
    Freelancer "1" -- "*" Gig : creates
    Gig "1" -- "*" Package : has
    Client "1" -- "*" Order : places
    Freelancer "1" -- "*" Order : fulfills
    Gig "1" -- "*" Order : references
    Package "1" -- "*" Order : included in
    Order "1" -- "0..1" Review : receives
    User "1" -- "*" Conversation : participates
    Conversation "1" -- "*" Message : contains
    User "1" -- "*" Notification : receives
    AuthContext -- User : manages
    SocketManager -- Message : transmits
    SocketManager -- Notification : dispatches
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
