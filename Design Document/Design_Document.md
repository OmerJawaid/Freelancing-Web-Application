# Freelancing Web Application – Design Document

## A. Requirements Specification
This section details the functional and non-functional requirements for the Freelancing Web Application, derived from the provided Jira User Stories and project goals. Functional requirements are primarily expressed as user stories, while non-functional requirements specify the quality attributes of the system. The requirements are based on the user stories provided and common best practices, as direct code analysis for requirement derivation is not performed in this context.

### 1. User Stories (Functional Requirements) & Non-Functional Requirements
The system's features, based on the Jira User Stories, are organized into Epics. Each Epic contains functional requirements (FRs) derived from these stories, along with their associated non-functional requirements (NFRs).

-   **Epic 1: User Account Management**
    -   **FR1.1: User Registration**
        -   **User Story:** As a new user, I want to register for an account so that I can access the platform's features.
        -   **Details:**
            -   Users should be able to create an account by providing necessary details (e.g., username, email, password, user type - Client/Freelancer).
            -   The system must validate input data (e.g., email format, password strength).
            -   Successful registration should lead to an active account.
        -   **Associated Non-Functional Requirements:**
            -   **NFR1.1.1: Secure Password Storage:** Passwords must be hashed using a strong, contemporary one-way hashing algorithm (e.g., bcrypt) with a unique salt per user.
                -   **Reference:** Security quality tactics (Section D.1), Design Constraint 1.
            -   **NFR1.1.2: Data Validation:** Input data for registration must be validated on client and server-side to prevent errors and ensure data integrity.
                -   **Reference:** Data Integrity.
            -   **NFR1.1.3: Registration Response Time:** User registration operations should complete within 2 seconds (95th percentile).
                -   **Reference:** Performance quality tactic.
    -   **FR1.2: User Login**
        -   **User Story:** As a registered user, I want to log in to my account securely to access personalized content and functionalities.
        -   **Details:**
            -   Users should be able to log in using their registered email and password.
            -   The system should handle incorrect login attempts (e.g., error messages, lockout after multiple failures).
            -   Secure session management for logged-in users.
        -   **Associated Non-Functional Requirements:**
            -   **NFR1.2.1: Secure Session Management:** User sessions must be managed securely (e.g., using JWT, secure HTTP-only cookies, token expiration).
                -   **Reference:** Security quality tactics (Section D.1).
            -   **NFR1.2.2: Authentication Response Time:** User login operations should complete within 2 seconds (95th percentile).
                -   **Reference:** Performance quality tactic.
            -   **NFR1.2.3: Brute-force Protection:** Implement measures against brute-force login attacks (e.g., rate limiting, CAPTCHA).
                -   **Reference:** Security.
    -   **FR1.3: Create and Manage Profile** (Covers "Create and Manage Profile" and "Edit Profile")
        -   **User Story:** As a user, I want to create and manage my profile so I can present myself to others and keep my information updated.
        -   **Details:**
            -   Users (Clients and Freelancers) can create/edit their profile information (e.g., name, profile picture, bio, contact details).
            -   Freelancers can add/edit skills, portfolio, experience, education.
            -   Clients can add/edit company details if applicable.
            -   Users can manage account settings (e.g., email preferences, password change).
        -   **Associated Non-Functional Requirements:**
            -   **NFR1.3.1: Data Integrity:** Profile data must be stored accurately and consistently.
                -   **Reference:** Data Integrity.
            -   **NFR1.3.2: Usability:** Profile creation and editing interface must be intuitive and easy to use.
                -   **Reference:** Usability quality tactic, UI Design (Section B.2.b).
            -   **NFR1.3.3: Data Privacy:** Users should have control over the visibility of certain profile information. Sensitive data must be protected.
                -   **Reference:** Privacy, Security.

-   **Epic 2: Gig Management (Freelancer Focused)**
    -   **FR2.1: Create and Manage Gigs**
        -   **User Story:** As a freelancer, I want to create and manage my gigs (service packages) so I can offer my services to clients.
        -   **Details:**
            -   Freelancers can create new gigs with title, description, pricing tiers (e.g., basic, standard, premium), estimated delivery time, scope of work, and relevant media (images/videos).
            -   Freelancers can edit, publish, unpublish, or delete their gigs.
            -   Freelancers can manage gig extras and add-ons.
        -   **Associated Non-Functional Requirements:**
            -   **NFR2.1.1: Rich Content Support:** The system should allow for formatted text, image uploads, and potentially video links for gig descriptions.
                -   **Reference:** Usability.
            -   **NFR2.1.2: Data Validation:** All inputs for gig creation (e.g., pricing, delivery times) must be validated for correctness and consistency.
                -   **Reference:** Data Integrity.
            -   **NFR2.1.3: Availability:** Gig creation and management tools should be highly available to freelancers.
                -   **Reference:** Reliability.

-   **Epic 3: Gig Discovery & Ordering (Client Focused)**
    -   **FR3.1: View Freelancer Gigs**
        -   **User Story:** As a client, I want to view freelancer gigs so I can find services that meet my needs.
        -   **Details:**
            -   Clients can browse gigs by categories, search using keywords, and apply filters (e.g., price range, freelancer rating, delivery time, online status).
            -   Gig listings should display key summary information (e.g., title, main image, starting price, freelancer rating, number of reviews).
            -   Detailed gig pages should show full description, all pricing tiers, freelancer profile link, Q&A section, and client reviews/ratings.
        -   **Associated Non-Functional Requirements:**
            -   **NFR3.1.1: Search Performance:** Gig search and filtering operations should return results within 2 seconds.
                -   **Reference:** Performance.
            -   **NFR3.1.2: Scalability:** The system must efficiently handle a large and growing number of gigs and concurrent users browsing/searching.
                -   **Reference:** Performance, Scalability.
    -   **FR3.2: Order a Gig**
        -   **User Story:** As a client, I want to order a gig from a freelancer to get my project started.
        -   **Details:**
            -   Clients can select a specific gig package (and any extras) and proceed to an order page.
            -   Clients must be able to provide detailed requirements for the order.
            -   Secure payment processing for order placement.
            -   Order confirmation is provided to the client, and the freelancer is notified of the new order.
        -   **Associated Non-Functional Requirements:**
            -   **NFR3.2.1: Secure Payment Processing:** Integration with secure third-party payment gateways. Sensitive payment details should not be stored on the platform.
                -   **Reference:** Security, Strategy pattern for payments (Section D).
            -   **NFR3.2.2: Transaction Reliability:** Order placement and payment transactions must be atomic and reliable, with clear feedback on success or failure.
                -   **Reference:** Reliability, Data Integrity.
    -   **FR3.3: View Gig Rating**
        -   **User Story:** As a user, I want to view gig ratings so I can assess the quality and reputation of a service/freelancer.
        -   **Details:**
            -   Gig pages and freelancer profiles should display average ratings and individual reviews from past clients for specific gigs/overall service.
        -   **Associated Non-Functional Requirements:**
            -   **NFR3.3.1: Authenticity of Ratings:** Ratings and reviews should be linked to completed and verified orders to ensure authenticity.
                -   **Reference:** Integrity.
            -   **NFR3.3.2: Transparency in Ratings:** The system for calculating and displaying ratings should be clear and fair.
                -   **Reference:** Usability, Fairness.

-   **Epic 4: Order Fulfillment & Communication**
    -   **FR4.1: Receive and Manage Orders (Freelancer)**
        -   **User Story:** As a freelancer, I want to receive and manage my orders so I can track my work, communicate with clients, and meet deadlines.
        -   **Details:**
            -   Freelancers receive notifications for new orders.
            -   A dedicated dashboard area for viewing and managing active, delivered, completed, and cancelled orders.
            -   Ability to accept/decline new orders (if applicable).
            -   Track order progress and deadlines.
        -   **Associated Non-Functional Requirements:**
            -   **NFR4.1.1: Real-time Order Updates:** Freelancers should see new orders and status changes promptly in their dashboard.
                -   **Reference:** Performance, Observer pattern (Section D).
            -   **NFR4.1.2: Data Consistency:** Order information (status, requirements, deadlines, communication) must be consistent for both client and freelancer.
                -   **Reference:** Data Integrity.
    -   **FR4.2: Communicate with Clients/Freelancers** (Covers "Communicate with Clients" and "Communicate with Freelancers")
        -   **User Story:** As a user, I want to communicate with clients/freelancers within the platform so I can discuss project details, ask questions, provide updates, and resolve issues efficiently.
        -   **Details:**
            -   An in-app messaging system allowing direct communication between clients and freelancers related to specific orders or pre-order inquiries.
            -   Support for text messages and file attachments (e.g., for sharing drafts, briefs, or assets).
            -   Notifications for new messages.
            -   Message history should be maintained for each order.
        -   **Associated Non-Functional Requirements:**
            -   **NFR4.2.1: Message Delivery Guarantee:** The system should ensure reliable delivery of messages.
                -   **Reference:** Reliability.
            -   **NFR4.2.2: Security of Communication:** Messages should be transmitted securely (e.g., HTTPS). Consideration for end-to-end encryption if highly sensitive data is common.
                -   **Reference:** Security.
    -   **FR4.3: Deliver Completed Work (Freelancer)**
        -   **User Story:** As a freelancer, I want to deliver my completed work to the client through the platform to fulfill the order requirements.
        -   **Details:**
            -   Freelancers can upload and submit final deliverables for an order.
            -   The client is notified upon delivery.
            -   Option for the freelancer to add a delivery message or notes.
            -   System should handle revisions if the client requests changes after delivery.
        -   **Associated Non-Functional Requirements:**
            -   **NFR4.3.1: File Upload Capability:** Robust support for various common file types and reasonable file size limits for deliverables.
                -   **Reference:** Usability, Performance.
            -   **NFR4.3.2: Audit Trail:** A clear record of deliveries and revisions should be maintained.
                -   **Reference:** Accountability, Data Integrity.

-   **Epic 5: Dashboard & Progress Tracking**
    -   **FR5.1: View Progress on Dashboard**
        -   **User Story:** As a user (client or freelancer), I want to view my progress, active orders, and key information on a personalized dashboard.
        -   **Details:**
            -   Clients: Dashboard shows ongoing orders, pending actions (e.g., review delivery, provide feedback), recent messages, and possibly spending summaries.
            -   Freelancers: Dashboard shows active orders, new orders, upcoming deadlines, earnings summaries, new messages, and gig performance statistics.
            -   The dashboard should provide a quick overview and easy navigation to relevant sections.
        -   **Associated Non-Functional Requirements:**
            -   **NFR5.1.1: Data Accuracy & Real-time Updates:** Dashboard information must be accurate and reflect the latest status of orders, messages, and other relevant data.
                -   **Reference:** Data Integrity, Performance.
            -   **NFR5.1.2: Performance:** The dashboard should load quickly, typically within 2-3 seconds, even when aggregating multiple data points.
                -   **Reference:** Performance.
            -   **NFR5.1.3: Customization (Optional):** Users might be able to customize some elements of their dashboard view.
                -   **Reference:** Usability.

-   **Epic 6: Review & Rating System**
    -   **FR6.1: Review and Rate Freelancers (Client)**
        -   **User Story:** As a client, I want to review and rate freelancers after an order is completed, to share my experience and help other clients.
        -   **Details:**
            -   After an order is marked as completed (and possibly payment finalized), clients are prompted or able to provide a rating (e.g., on a 1-5 star scale for various criteria like communication, quality, timeliness) and a written review for the freelancer/gig.
            -   Reviews should be linked to the specific order.
        -   **Associated Non-Functional Requirements:**
            -   **NFR6.1.1: Review Integrity & Authenticity:** The system must ensure that only clients who have completed a transaction can leave a review for that specific service/freelancer.
                -   **Reference:** Integrity.
            -   **NFR6.1.2: Ease of Use:** The process for submitting a review and rating should be simple, intuitive, and not overly time-consuming.
                -   **Reference:** Usability.
            -   **NFR6.1.3: Moderation (Optional):** A system for review moderation might be needed to handle inappropriate content, while ensuring fairness.
                -   **Reference:** Maintainability, Fairness.

-   **Epic 7: Notifications**
    -   **FR7.1: Receive Notifications**
        -   **User Story:** As a user, I want to receive notifications for important events so I can stay informed and take timely actions.
        -   **Details:**
            -   In-app and/or email notifications for events such as: new messages, new orders (freelancer), order accepted/declined, work delivered (client), revision requests, order completed, payment processed, new reviews (freelancer), gig status changes, important platform announcements.
            -   Users should be able to manage their notification preferences (e.g., which events trigger notifications, delivery method - in-app/email).
        -   **Associated Non-Functional Requirements:**
            -   **NFR7.1.1: Timeliness:** Notifications should be delivered promptly (near real-time for critical events).
                -   **Reference:** Performance, Observer pattern (Section D).
            -   **NFR7.1.2: Reliability:** Notification delivery should be robust and reliable. Missed notifications for critical events should be minimized.
                -   **Reference:** Reliability.
            -   **NFR7.1.3: Configurability:** Users must have granular control over their notification settings.
                -   **Reference:** Usability.

-   **Epic 8: User Interface & Experience**
    -   **FR8.1: Dark Mode**
        -   **User Story:** As a user, I want to be able to switch to a dark mode theme for better visual comfort, especially in low-light conditions.
        -   **Details:**
            -   A user-selectable option (e.g., a toggle switch in settings) to switch the entire application interface between a default light theme and a dark theme.
            -   The selected theme preference should be persistent for the user.
        -   **Associated Non-Functional Requirements:**
            -   **NFR8.1.1: Accessibility:** The dark mode theme must maintain sufficient color contrast and readability to meet accessibility standards (e.g., WCAG).
                -   **Reference:** Usability, Accessibility.
            -   **NFR8.1.2: Consistency:** The dark theme should be consistently applied across all UI elements, views, and components of the application.
                -   **Reference:** Usability.
            -   **NFR8.1.3: Performance:** Switching between themes should be instantaneous and not cause any noticeable UI lag or performance degradation.
                -   **Reference:** Performance.

### 2. Elaboration of General System-Wide Requirements
This section complements the user stories by outlining broader system characteristics and overarching non-functional requirements.

-   **G-FR1: Role-Based Access Control (RBAC):** The system must robustly differentiate between user roles (e.g., Client, Freelancer, Admin) and strictly enforce access to functionalities and data based on these roles.
    -   **Reference:** Security, Design Constraint 1 & 2. (Essential for platform integrity and data security).
-   **G-FR2: Administrative Capabilities:** A comprehensive administrative interface/role is required for platform management, including user account management (view, suspend, roles), gig moderation, dispute resolution between users, content management, platform configuration, and viewing analytics. (Implicitly necessary for platform operation).
    -   **Reference:** Maintainability, Security, Operability.

-   **G-NFR1: Security:** The platform must be designed and implemented to be secure against common web vulnerabilities (e.g., OWASP Top 10 like XSS, CSRF, SQL Injection). All sensitive data (personal information, financial details, private messages) must be protected in transit (using HTTPS/TLS) and at rest (e.g., encryption for specific sensitive fields). Regular security audits and penetration testing should be planned.
    -   **Reference:** Design Constraint 1, Quality Tactics (Section D.1).
-   **G-NFR2: Performance & Scalability:** The application must be highly responsive under typical and peak load conditions. Key user interactions (e.g., search, order placement, messaging) should complete within acceptable timeframes (e.g., < 3 seconds for 95th percentile). The architecture must support scaling to accommodate a growing number of users, gigs, orders, and overall data volume without degradation in performance.
    -   **Reference:** Quality Tactics (Section D.1).
-   **G-NFR3: Usability & Accessibility:** The user interface must be intuitive, user-friendly, and provide a consistent and efficient experience across different devices (responsive design). The platform should adhere to web accessibility guidelines (e.g., WCAG 2.1 AA level) to be usable by people with disabilities.
    -   **Reference:** Quality Tactics (Section D.1), UI Design (Section B.2.b).
-   **G-NFR4: Reliability & Availability:** The platform should achieve high availability (e.g., a target of 99.9% uptime, excluding planned maintenance). It must be resilient to failures, with mechanisms for data backup and recovery. Data integrity must be ensured through proper transaction management and validation.
    -   **Reference:** Deployment Diagram (Section B.2.d), Data Model (Section B.2.f).
-   **G-NFR5: Maintainability & Modifiability:** The system architecture (e.g., MVC) and codebase should be well-structured, documented, and adhere to coding standards to facilitate easy maintenance, debugging, and future enhancements or modifications with minimal impact on existing functionalities.
    -   **Reference:** Design Constraints 3, 4, 5; Explanation of Patterns Used (Section D).
-   **G-NFR6: Data Privacy:** The platform must comply with relevant data privacy regulations (e.g., GDPR, CCPA, depending on target users). Users should be informed about data collection practices and have control over their personal data, including rights to access, rectify, and erase their information.
    -   **Reference:** Security, Legal Compliance.

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