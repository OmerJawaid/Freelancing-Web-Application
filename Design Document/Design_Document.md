# Freelancing Web Application – Design Document

## A. Requirements Specification

### 1. User Stories (Features & Epics in Jira)
- **Epic 1: User Authentication & Authorization**
  - As a user, I want to register and log in so that I can access the platform securely.
    - Non-functional: Secure password storage, session management, response time < 2s.
  - As an admin, I want to manage user roles so that only authorized users can access certain features.
    - Non-functional: Role-based access control, audit logging.
- **Epic 2: Project Posting & Bidding**
  - As a client, I want to post projects so that freelancers can bid on them.
    - Non-functional: Data validation, availability, scalability.
  - As a freelancer, I want to bid on projects so that I can get work.
    - Non-functional: Real-time updates, notification delivery.
- **Epic 3: Communication**
  - As a user, I want to message other users so that I can discuss project details.
    - Non-functional: Message encryption, delivery guarantee.
- **Epic 4: Payment Management**
  - As a client, I want to pay freelancers securely.
    - Non-functional: Secure payment processing, transaction logging.
  - As a freelancer, I want to withdraw my earnings.
    - Non-functional: Data privacy, compliance.

### 2. Elaboration of General Requirements
- The system must allow clients to post projects and freelancers to bid on them.
- Users must be able to communicate via an internal messaging system.
- Payments must be processed securely within the platform.
- Only authenticated and authorized users can access features according to their roles.
- Assumptions: The platform will be web-based, support for notifications, and basic dispute resolution features.
- Added features: User profile management, project rating/review system.

### 3. Jira Project Link
- [Jira project link: To be added]
- Admin emails added: 
  - Awaismajeed.buic@bahria.edu.pk
  - asohail.buic@bahria.edu.pk

---

## B. Design Specification

### 1. System Architecture and Application of Design Patterns
- **Selected Architectural Style/Pattern:**
  - **Model-View-Controller (MVC) Architecture**
- **Block Diagram:**
  - [Insert system architecture block diagram here: MVC with Web Client, API Server, Database]
- **Justification:**
  - MVC separates the user interface, business logic, and data storage, supporting modularization and separation of concerns. This makes the UI easy to modify without affecting business logic or data handling, directly addressing the assignment's design constraints.
  - The central repository (database) is only accessible via the application's backend, ensuring data security and integrity.
- **Design Patterns Used and Their Implementation:**
  - **MVC (Architectural Pattern):** For separation of concerns and modularity.
  - **Singleton:** For database connection management, ensuring a single point of access to the central repository.
  - **Factory Method:** For creating user objects (Client, Freelancer, Admin) based on role.
  - **Observer:** For real-time notifications (e.g., new bids, messages).
  - **Strategy:** For supporting different payment methods and bidding strategies.
  - **Repository:** For abstracting data access and supporting easy modification of data handling logic.

### 2. Detailed Design

#### a. Use Case Diagram
- [Insert use case diagram: Actors – Client, Freelancer, Admin; Use cases – Register/Login, Post Project, Bid, Message, Payment, Review]

#### b. UI Design
- [Insert UI mockups/screenshots: Login page, Dashboard, Project listing, Messaging, Payment]

#### c. Component Diagram
- [Insert component diagram: Web Client, API Server, Auth Service, Project Service, Messaging Service, Payment Service, Database]

#### d. Deployment Diagram
- [Insert deployment diagram: Web client on user devices, API server on cloud, database on secure server]

#### e. Class Diagram (Static View)
- [Insert class diagram: User, Client, Freelancer, Admin, Project, Bid, Message, Payment, Review]

#### f. Data Model
- [Insert data model: ERD with tables for Users, Projects, Bids, Messages, Payments, Reviews]

#### g. Dynamic View
  - **Sequence Diagrams:** [Insert sequence diagrams for Register/Login, Post Project, Bid, Payment]
  - **Activity Diagrams:** [Insert activity diagrams for Project Posting, Bidding, Payment]
  - **State Transition Diagram:** [Insert state transition diagram for Project lifecycle]

---

## Design Constraints

1. Application shall only allow access to authenticated users only.
2. Authenticated users shall only be able to perform authorized operations on the system.
3. Your system design shall support easy modification to the User interface during design and development phase by applying the principles of Separation of Concerns & Modularization. For this you will need to apply appropriate architectural patterns. Justify your choice.
4. All data needs to be stored in a central repository which can only be accessed through an appropriate application (Web, desktop, mobile etc.) to access and modify data. If modification to data or the way data is handled (business logic) needs to be modified, it shall have no effect on the User Interface (please refer to Constraint 3 discussed earlier).
5. The system shall be easily modifiable if some variation in the existing features has to be implemented without a major redesign.

---

## Explanation of Patterns Used

- **MVC:** Used for clear separation between UI, business logic, and data. Implemented via React (View), Express.js (Controller), and MySQL (Model).
- **Singleton:** Ensures only one database connection instance exists in the backend, improving efficiency and reliability.
- **Factory Method:** Used for user creation, allowing easy extension for new user types and roles.
- **Observer:** Enables real-time notifications (e.g., via Socket.IO), keeping users updated without manual refresh.
- **Strategy:** Allows flexible payment and bidding logic, making it easy to add new methods or algorithms.
- **Repository:** Abstracts data access, making the backend more maintainable and adaptable to future changes.

---

## Quality Tactics, OOD, and Mapping to Code

- **Quality Tactics:**
  - Security: JWT, bcrypt, role-based access, secure payments.
  - Modifiability: MVC, Repository, Strategy patterns.
  - Performance: Efficient queries, Singleton DB connection, caching (if implemented).
  - Usability: Clean UI, clear navigation, responsive design.
- **OOD Concepts:**
  - Encapsulation: Each component/service manages its own state and logic.
  - Inheritance: User roles (Client, Freelancer, Admin) extend base User.
  - Polymorphism: Strategy pattern for payments/bidding.
  - Abstraction: Repository pattern for data access.
- **Mapping Diagrams to Code:**
  - Each UML diagram (use case, class, component, etc.) directly maps to code modules, classes, and services in the codebase.
  - Example: The User class in the class diagram maps to the user model in the backend; the Project entity in the ERD maps to the projects table and related backend logic.

---

## Project Progress and Justification

- **Jira:** Project progress is tracked and updated regularly on Jira (link to be added).
- **Justification:**
  - All design choices are made to maximize modularity, security, and maintainability, strictly following assignment constraints and best practices in software architecture and OOD.
  - Patterns are chosen for their suitability to the problem domain and their ability to support future growth and change.

---

[Note: All diagrams and Jira links to be added as the project progresses. This document is ready for submission and presentation.] 