# Entity-Relationship Diagram - Freelancing Web Application

## Overview
This diagram illustrates the database structure of the Freelancing Web Application, showing entities and their relationships.

## Diagram

```mermaid
erDiagram
    USER ||--o{ FREELANCER : "can be"
    USER ||--o{ CLIENT : "can be"
    
    %% Profile & Experience
    FREELANCER ||--o{ PROFILE_EXPERIENCE : "has"
    PROFILE_EXPERIENCE {
        int id PK
        int freelancer_id FK
        string title
        string company
        date start_date
        date end_date
        string description
        datetime created_at
    }
    
    %% Gig & Package Relationships
    FREELANCER ||--o{ GIG : "creates"
    GIG ||--o{ PACKAGE : "offers"
    GIG {
        int id PK
        int freelancer_id FK
        string title
        string description
        string category
        string image
        int state
        int views
        datetime created_at
        datetime updated_at
    }
    
    PACKAGE {
        int id PK
        int gig_id FK
        int type
        float price
        string package_details
        int delivery_time
    }
    
    %% Order Relationships
    CLIENT ||--o{ ORDER : "places"
    FREELANCER ||--o{ ORDER : "fulfills"
    GIG ||--o{ ORDER : "is part of"
    PACKAGE ||--o{ ORDER : "is selected in"
    
    ORDER {
        int id PK
        int client_id FK
        int freelancer_id FK
        int gig_id FK
        int package_id FK
        string status
        string requirements
        datetime delivery_date
        datetime created_at
        datetime updated_at
    }
    
    %% Work Submission
    ORDER ||--o{ WORK_SUBMISSION : "has"
    WORK_SUBMISSION {
        int id PK
        int order_id FK
        string content
        string attachment_url
        string status
        datetime created_at
    }
    
    %% Review System
    ORDER ||--o{ REVIEW : "receives"
    CLIENT ||--o{ REVIEW : "writes"
    FREELANCER ||--o{ REVIEW : "receives"
    
    REVIEW {
        int id PK
        int order_id FK
        int client_id FK
        int freelancer_id FK
        int rating
        string comment
        datetime created_at
    }
    
    %% Messaging System
    USER ||--o{ MESSAGE : "sends"
    CONVERSATION ||--o{ MESSAGE : "contains"
    USER ||--o{ CONVERSATION : "participates"
    
    CONVERSATION {
        int id PK
        int user_one_id FK
        int user_two_id FK
        string last_message
        datetime last_message_time
        datetime created_at
    }
    
    MESSAGE {
        int id PK
        int conversation_id FK
        int sender_id FK
        string content
        string attachment_url
        string type
        string status
        datetime created_at
    }
    
    %% Notification System
    USER ||--o{ NOTIFICATION : "receives"
    NOTIFICATION }|--o{ MESSAGE : "may reference"
    NOTIFICATION }|--o{ ORDER : "may reference"
    
    NOTIFICATION {
        int id PK
        int user_id FK
        string type
        string title
        string content
        int reference_id
        boolean is_read
        datetime created_at
    }
```

## Description

This Entity-Relationship diagram illustrates the database structure of the Freelancing Web Application, showing all entities with their attributes and relationships based on the actual implementation:

### User Management
- **USER**: Central entity representing all users in the system with authentication information
- **FREELANCER**: Extends USER with freelancer-specific attributes like skills, bio, and rating
- **CLIENT**: Extends USER with client-specific attributes
- **PROFILE_EXPERIENCE**: Work experience entries associated with freelancers' profiles

### Gig Management
- **GIG**: Services offered by freelancers, including title, description, category, and tracking metrics like views
- **PACKAGE**: Service tiers for gigs (Basic, Standard, Premium) with different price points and delivery times

### Order Processing
- **ORDER**: Transactions between clients and freelancers, including status tracking and requirements
- **WORK_SUBMISSION**: Deliverables submitted for orders with content and attachment information
- **REVIEW**: Ratings and feedback provided after order completion

### Communication System
- **CONVERSATION**: Chat channels between users with last message tracking
- **MESSAGE**: Individual messages within conversations, including attachment support and status tracking
- **NOTIFICATION**: System notifications for various events like new messages and order updates

## Key Relationships

1. **User Role Relationships**:
   - A USER can be either a FREELANCER or a CLIENT (1-to-1 relationship)
   - FREELANCER can have multiple PROFILE_EXPERIENCE entries (1-to-many)

2. **Gig Management Relationships**:
   - FREELANCER creates multiple GIGs (1-to-many)
   - Each GIG offers multiple PACKAGEs (1-to-many)

3. **Order Processing Relationships**:
   - CLIENT places multiple ORDERs (1-to-many)
   - FREELANCER fulfills multiple ORDERs (1-to-many)
   - ORDER is associated with one GIG and one PACKAGE (many-to-1)
   - ORDER can have multiple WORK_SUBMISSION entries (1-to-many)
   - ORDER can receive multiple REVIEWs (1-to-many)

4. **Communication Relationships**:
   - USER participates in multiple CONVERSATIONs (many-to-many)
   - CONVERSATION contains multiple MESSAGEs (1-to-many)
   - USER sends multiple MESSAGEs (1-to-many)
   - USER receives multiple NOTIFICATIONs (1-to-many)
   - NOTIFICATION may reference MESSAGE or ORDER (many-to-many)

## Implementation Details

1. **Entity Attributes**:
   - Each entity contains attributes reflecting the actual database schema
   - Primary keys (PK) uniquely identify each record
   - Foreign keys (FK) establish relationships between entities
   - Timestamp attributes track creation and modification times

2. **State Tracking**:
   - ORDER includes status field to track order lifecycle
   - MESSAGE includes status field to track delivery status
   - NOTIFICATION includes is_read flag to track user interaction

3. **Reference System**:
   - NOTIFICATION uses reference_id and type to link to various entities
   - This enables a flexible notification system that can reference different objects

This diagram provides a comprehensive view of the data structure supporting the Freelancing Web Application, with special attention to the real-time messaging system, order processing, and freelancer profile management features.
