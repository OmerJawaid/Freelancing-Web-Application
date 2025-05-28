# Use Case Diagrams - Freelancing Web Application

## Overview
These diagrams illustrate the primary use cases of the Freelancing Web Application from the perspective of its main actors. We've created separate diagrams for Client and Freelancer roles to better illustrate the distinct functionalities available to each user type.

## Client Use Case Diagram

```mermaid
graph TD
    %% Client Actor
    Client(["Client"])
    System(["System"])
    
    %% Authentication & Profile
    subgraph "Authentication & Profile"
        UC1[Register Account]
        UC2[Login]
        UC3[Manage Profile]
    end
    
    %% Communication
    subgraph "Communication"
        UC4[Send Messages]
        UC5[View Notifications]
    end
    
    %% Gig Interaction
    subgraph "Gig Interaction"
        UC6[Search Gigs]
        UC7[Browse Gigs]
        UC8[Place Order]
    end
    
    %% Order Management
    subgraph "Order Management"
        UC9[Review Freelancer]
        UC10[Track Order Status]
        UC11[Manage Orders]
    end
    
    %% System Services
    subgraph "System Services"
        UC18[Send Notifications]
        UC19[Process Payments]
        UC20[Manage Real-time Communications]
    end
    
    %% Client-System Relationships
    Client --- UC1
    Client --- UC2
    Client --- UC3
    Client --- UC4
    Client --- UC5
    Client --- UC6
    Client --- UC7
    Client --- UC8
    Client --- UC9
    Client --- UC10
    Client --- UC11
    
    %% System Relationships
    System --- UC18
    System --- UC19
    System --- UC20
    
    %% Dependencies and Relationships
    UC8 -.-> UC7["requires"]
    UC9 -.-> UC11["part of"]
    UC18 -.-> UC5["updates"]
    UC20 -.-> UC4["enables"]
    UC19 -.-> UC8["processes"]
```

## Freelancer Use Case Diagram

```mermaid
graph TD
    %% Freelancer Actor
    Freelancer(["Freelancer"])
    System(["System"])
    
    %% Authentication & Profile
    subgraph "Authentication & Profile"
        UC1[Register Account]
        UC2[Login]
        UC3[Manage Profile]
        UC22[View Freelancer Profile]
    end
    
    %% Communication
    subgraph "Communication"
        UC4[Send Messages]
        UC5[View Notifications]
    end
    
    %% Gig Management
    subgraph "Gig Management"
        UC12[Create Gig]
        UC13[Manage Gigs]
        UC14[Define Packages]
    end
    
    %% Order Fulfillment
    subgraph "Order Fulfillment"
        UC15[Accept/Reject Orders]
        UC16[Deliver Completed Work]
        UC17[Receive Payments]
    end
    
    %% System Services
    subgraph "System Services"
        UC18[Send Notifications]
        UC19[Process Payments]
        UC20[Manage Real-time Communications]
        UC21[Handle File Uploads]
    end
    
    %% Freelancer-System Relationships
    Freelancer --- UC1
    Freelancer --- UC2
    Freelancer --- UC3
    Freelancer --- UC4
    Freelancer --- UC5
    Freelancer --- UC12
    Freelancer --- UC13
    Freelancer --- UC14
    Freelancer --- UC15
    Freelancer --- UC16
    Freelancer --- UC17
    Freelancer --- UC22
    
    %% System Relationships
    System --- UC18
    System --- UC19
    System --- UC20
    System --- UC21
    
    %% Dependencies and Relationships
    UC13 -.-> UC12["includes"]
    UC13 -.-> UC14["includes"]
    UC16 -.-> UC15["requires"]
    UC17 -.-> UC16["follows"]
    UC18 -.-> UC5["updates"]
    UC20 -.-> UC4["enables"]
    UC21 -.-> UC12["supports"]
    UC21 -.-> UC16["supports"]
```

## Description

The Use Case Diagrams for the Freelancing Web Application depict the core functionalities available to clients and freelancers, presented as separate diagrams for clarity.

### Client Use Cases

#### Authentication & Profile
- **Register Account**: Sign up for a new client account
- **Login**: Authenticate and access the system
- **Manage Profile**: Update personal information and settings

#### Communication
- **Send Messages**: Communicate with freelancers
- **View Notifications**: See system and user-generated notifications

#### Gig Interaction
- **Search Gigs**: Find services using search functionality
- **Browse Gigs**: View available services offered by freelancers
- **Place Order**: Purchase a service package

#### Order Management
- **Review Freelancer**: Provide feedback after service completion
- **Track Order Status**: Monitor the progress of placed orders
- **Manage Orders**: View, cancel, or request revisions for orders

### Freelancer Use Cases

#### Authentication & Profile
- **Register Account**: Sign up for a new freelancer account
- **Login**: Authenticate and access the system
- **Manage Profile**: Update personal information and settings
- **View Freelancer Profile**: Access the freelancer's public profile page

#### Communication
- **Send Messages**: Communicate with clients
- **View Notifications**: See system and user-generated notifications

#### Gig Management
- **Create Gig**: Offer a new service
- **Manage Gigs**: Update or remove existing services
- **Define Packages**: Create different service tiers (Basic, Standard, Premium)

#### Order Fulfillment
- **Accept/Reject Orders**: Review and respond to incoming order requests
- **Deliver Completed Work**: Submit finished work to clients
- **Receive Payments**: Get compensated for completed services

### System Services (Supporting Both Actors)

- **Send Notifications**: Generate and deliver system notifications
- **Process Payments**: Handle financial transactions
- **Manage Real-time Communications**: Facilitate instant messaging
- **Handle File Uploads**: Process and store uploaded files (primarily for freelancers)

### Key Relationships

#### Client Dependencies
- Placing an order requires browsing gigs first
- Writing reviews is part of order management
- System services support client activities

#### Freelancer Dependencies
- Managing gigs includes creating gigs and defining packages
- Delivering work requires accepting orders first
- Receiving payments follows after work delivery
- File uploads support both gig creation and work delivery

These diagrams provide a clear separation of user roles, making it easier to understand the specific capabilities and workflows for each type of user in the Freelancing Web Application.
