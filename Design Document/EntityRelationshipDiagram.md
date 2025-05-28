# Entity-Relationship Diagram - Freelancing Web Application

## Overview
This diagram illustrates the database structure of the Freelancing Web Application, showing entities and their relationships.

## Diagram

```mermaid
erDiagram
    USER {
        int id PK
        string email
        string password
        datetime created_at
        string User_Type
        string Image
    }
    
    FREELANCERS {
        int Id PK, FK
        string Name
        string bio
        float Rating
        string skills
        string Image
    }
    
    CLIENTS {
        int Id PK, FK
        string Name
        string bio
        string Image
    }
    
    GIGS {
        int Id PK
        int Freelancer_Id FK
        string Title
        string Description
        string Category
        string Image
        int State
        int Views
        datetime created_at
    }
    
    PACKAGES {
        int Id PK
        int Gig_Id FK
        int Type
        float Price
        string Title
        string Description
        int delivery_time
        int revisions
    }
    
    ORDERS {
        int Id PK
        int Client_Id FK
        int Freelancer_Id FK
        int Gig_Id FK
        int Package_Id FK
        float Amount
        string Status
        datetime created_at
        datetime completed_at
        string requirements
    }
    
    REVIEWS {
        int Id PK
        int Order_Id FK
        int Client_Id FK
        int Freelancer_Id FK
        int Gig_Id FK
        int Rating
        string review_text
        datetime created_at
    }
    
    CONVERSATIONS {
        int Id PK
        int User_one_id FK
        int User_two_id FK
        string Last_message
        datetime Last_message_time
        int unread_count_user_one
        int unread_count_user_two
    }
    
    MESSAGES {
        int Id PK
        int Conversation_Id FK
        int Sender_Id FK
        string Content
        string Attachment_url
        string Type
        string Status
        datetime Created_at
    }
    
    NOTIFICATIONS {
        int Id PK
        int User_Id FK
        string type
        string title
        string content
        int reference_id
        boolean is_read
        datetime created_at
    }
    
    USER ||--o{ NOTIFICATIONS : receives
    USER ||--|| FREELANCERS : is_a
    USER ||--|| CLIENTS : is_a
    FREELANCERS ||--o{ GIGS : creates
    GIGS ||--o{ PACKAGES : offers
    CLIENTS ||--o{ ORDERS : places
    FREELANCERS ||--o{ ORDERS : fulfills
    GIGS ||--o{ ORDERS : includes
    PACKAGES ||--o{ ORDERS : selected_in
    ORDERS ||--o| REVIEWS : receives
    USER ||--o{ CONVERSATIONS : participates
    CONVERSATIONS ||--o{ MESSAGES : contains
```

## Description

The Entity-Relationship diagram illustrates the database structure of the Freelancing Web Application:

### User Entities
- **USER**: Central entity representing all users in the system
- **FREELANCERS**: Extends USER for freelancer-specific attributes
- **CLIENTS**: Extends USER for client-specific attributes

### Service Entities
- **GIGS**: Services offered by freelancers
- **PACKAGES**: Different service tiers for gigs (Basic, Standard, Premium)

### Transaction Entities
- **ORDERS**: Transactions between clients and freelancers
- **REVIEWS**: Feedback provided after order completion

### Communication Entities
- **CONVERSATIONS**: Communication channels between users
- **MESSAGES**: Individual messages within conversations
- **NOTIFICATIONS**: System notifications for various events

## Relationships

- A USER can be either a FREELANCER or a CLIENT (1-to-1 relationship)
- FREELANCERS create multiple GIGS (1-to-many relationship)
- GIGS offer multiple PACKAGES (1-to-many relationship)
- CLIENTS place multiple ORDERS (1-to-many relationship)
- FREELANCERS fulfill multiple ORDERS (1-to-many relationship)
- ORDERS include a specific GIG and PACKAGE (many-to-1 relationships)
- ORDERS can receive one REVIEW (1-to-0/1 relationship)
- USERS participate in multiple CONVERSATIONS (many-to-many relationship)
- CONVERSATIONS contain multiple MESSAGES (1-to-many relationship)
- USERS receive multiple NOTIFICATIONS (1-to-many relationship)

## Key Constraints
- Primary keys (PK) are used to uniquely identify each record
- Foreign keys (FK) establish relationships between entities
- User-related entities use the same ID as the base USER entity
