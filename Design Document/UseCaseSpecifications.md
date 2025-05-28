# Use Case Specifications - Freelancing Web Application

## Table of Contents
1. [Introduction](#1-introduction)
2. [Use Case Diagram](#2-use-case-diagram)
3. [Detailed Use Case Specifications](#3-detailed-use-case-specifications)
   1. [UC-1: Register an Account](#31-uc-1-register-an-account)
   2. [UC-2: Post a Gig](#32-uc-2-post-a-gig)
   3. [UC-3: Search Gigs](#33-uc-3-search-gigs)
   4. [UC-4: Hire a Freelancer](#34-uc-4-hire-a-freelancer)
   5. [UC-5: Chat with Freelancer](#35-uc-5-chat-with-freelancer)
   6. [UC-6: Receive Notifications](#36-uc-6-receive-notifications)
   7. [UC-7: View Active Orders](#37-uc-7-view-active-orders)
   8. [UC-8: View Completed Orders](#38-uc-8-view-completed-orders)
   9. [UC-9: Submit Work](#39-uc-9-submit-work)
   10. [UC-10: Manage Freelancer Profile](#310-uc-10-manage-freelancer-profile)
   11. [UC-11: Review Freelancer](#311-uc-11-review-freelancer)
   12. [UC-12: Process Payment](#312-uc-12-process-payment)
   13. [UC-13: Request Revision](#313-uc-13-request-revision)
   14. [UC-14: Create and Manage Packages](#314-uc-14-create-and-manage-packages)
   15. [UC-15: Manage Attachments](#315-uc-15-manage-attachments)
   16. [UC-16: View Message History](#316-uc-16-view-message-history)
   17. [UC-17: View Freelancer Portfolio](#317-uc-17-view-freelancer-portfolio)
   18. [UC-18: Accept/Reject Order](#318-uc-18-acceptreject-order)

## 1. Introduction

This document details the use cases for the Freelancing Web Application, a platform connecting freelancers with clients seeking services. Each use case defines a specific interaction between actors and the system, including preconditions, postconditions, normal flows, and alternative flows.

The application includes real-time messaging, freelancer profile management, gig creation and discovery, order management, and payment processing capabilities.

## 2. Use Case Diagram

Please refer to the UML_UseCaseDiagram.md file for a comprehensive visual representation of the use cases and their relationships.

## 3. Detailed Use Case Specifications

### 3.1 UC-1: Register an Account

| Field | Description |
|-------|-------------|
| Use Case ID | UC-1 |
| Use Case Name | Register an Account |
| Actors | Freelancer, Client |
| Description | Allows users to create an account using email and select a role. |
| Trigger | User accesses registration form and submits details. |
| Preconditions | 1. User is not already registered. |
| Postconditions | 1. User receives confirmation and account is created. |
| Normal Flow | 1. User fills out registration form with email, password, and selects role (Freelancer or Client). <br>2. System validates input. <br>3. System creates user account. <br>4. System sends confirmation email. <br>5. User is redirected to login page. |
| Alternative Flows | 1. Email already exists – show error message. <br>2. Invalid email format – show validation error. <br>3. Password doesn't meet requirements – show validation error. |

### 3.2 UC-2: Post a Gig

| Field | Description |
|-------|-------------|
| Use Case ID | UC-2 |
| Use Case Name | Post a Gig |
| Actors | Freelancer |
| Description | Allows a freelancer to create and publish a service gig. |
| Trigger | Freelancer selects "Post a Gig" option. |
| Preconditions | 1. User is logged in as a freelancer. |
| Postconditions | 1. Gig is added to the gig listing. |
| Normal Flow | 1. User clicks "Post a Gig". <br>2. Fills out gig form with title, description, category, and image. <br>3. System validates and saves the gig. <br>4. Gig appears in marketplace. |
| Alternative Flows | 1. Missing required fields – form is not submitted. <br>2. Invalid image format – show error message. |

### 3.3 UC-3: Search Gigs

| Field | Description |
|-------|-------------|
| Use Case ID | UC-3 |
| Use Case Name | Search Gigs |
| Actors | Client |
| Description | Allows a client to browse and filter available gigs. |
| Trigger | Client accesses browse or search page. |
| Preconditions | 1. At least one gig must exist. |
| Postconditions | 1. Matching gigs are displayed. |
| Normal Flow | 1. Client opens search. <br>2. Enters keywords/filters. <br>3. System returns gig list. <br>4. Client browses results. |
| Alternative Flows | 1. No results found – show fallback message. <br>2. Filter by category – show category-specific gigs. |

### 3.4 UC-4: Hire a Freelancer

| Field | Description |
|-------|-------------|
| Use Case ID | UC-4 |
| Use Case Name | Hire a Freelancer |
| Actors | Client |
| Description | Allows a client to send a hire request to a freelancer. |
| Trigger | Client clicks "Hire Now" on a gig. |
| Preconditions | 1. Client is logged in. <br>2. Gig is published. |
| Postconditions | 1. Hire request is sent to freelancer. |
| Normal Flow | 1. Client selects gig. <br>2. Clicks "Order Now". <br>3. Selects package tier. <br>4. Submits brief requirements. <br>5. System confirms request. |
| Alternative Flows | 1. Invalid request – show error message. <br>2. Client cancels before submission – return to gig page. |

### 3.5 UC-5: Chat with Freelancer

| Field | Description |
|-------|-------------|
| Use Case ID | UC-5 |
| Use Case Name | Chat with Freelancer |
| Actors | Freelancer, Client |
| Description | Allows both users to communicate via a built-in real-time message interface. |
| Trigger | User accesses messaging through Gig Display or Conversations list. |
| Preconditions | 1. Both users are registered and logged in. |
| Postconditions | 1. Messages stored in conversation history. |
| Normal Flow | 1. User opens message interface. <br>2. Selects or starts conversation. <br>3. Types and sends message. <br>4. Receiver gets real-time notification. <br>5. Messages appear in chronological order. <br>6. System automatically scrolls to latest messages. |
| Alternative Flows | 1. User offline – system queues the message and delivers when online. <br>2. Attachment sending – user can upload and send files. <br>3. Socket connection error – system attempts reconnection. |

### 3.6 UC-6: Receive Notifications

| Field | Description |
|-------|-------------|
| Use Case ID | UC-6 |
| Use Case Name | Receive Notifications |
| Actors | Freelancer, Client |
| Description | Allows users to receive real-time and email notifications. |
| Trigger | Any system event (e.g., new message, hire request). |
| Preconditions | 1. User is registered and logged in. |
| Postconditions | 1. Notification is shown in-app and/or via email. |
| Normal Flow | 1. System detects a new event. <br>2. Push notification generated. <br>3. User sees notification in real-time. <br>4. User can click notification to navigate to relevant page. |
| Alternative Flows | 1. Notification delivery fails – log error and retry. <br>2. User marks notification as read – update status. |

### 3.7 UC-7: View Active Orders

| Field | Description |
|-------|-------------|
| Use Case ID | UC-7 |
| Use Case Name | View Active Orders |
| Actors | Freelancer, Client |
| Description | Allows users to view all ongoing orders. |
| Trigger | User navigates to the "Orders" section. |
| Preconditions | 1. The user is logged in. <br>2. There is at least one active order. |
| Postconditions | 1. Orders with current status are displayed. |
| Normal Flow | 1. User clicks on "Orders". <br>2. System fetches ongoing orders. <br>3. Order list is presented with details. <br>4. User can filter and sort orders. |
| Alternative Flows | 1. No active orders – show empty state or informational message. |

### 3.8 UC-8: View Completed Orders

| Field | Description |
|-------|-------------|
| Use Case ID | UC-8 |
| Use Case Name | View Completed Orders |
| Actors | Freelancer, Client |
| Description | Allows users to view a list of completed orders. |
| Trigger | User clicks on the "Completed Orders" tab. |
| Preconditions | 1. User is logged in. <br>2. At least one completed order exists. |
| Postconditions | 1. Completed order history is displayed. |
| Normal Flow | 1. User selects "Completed" section. <br>2. System shows past completed orders. <br>3. User can view details and download deliverables. |
| Alternative Flows | 1. No completed orders – display "No data" message. |

### 3.9 UC-9: Submit Work

| Field | Description |
|-------|-------------|
| Use Case ID | UC-9 |
| Use Case Name | Submit Work |
| Actors | Freelancer |
| Description | Allows freelancers to deliver work for a client order. |
| Trigger | Freelancer selects an order and chooses "Submit Work". |
| Preconditions | 1. Freelancer is logged in. <br>2. There is an accepted order. |
| Postconditions | 1. Client is notified about the delivery. |
| Normal Flow | 1. Freelancer clicks submit. <br>2. Attaches final files and description. <br>3. System stores delivery and notifies the client. <br>4. Order status changes to "Delivered". |
| Alternative Flows | 1. Upload failure – prompt user to retry. <br>2. No files attached – show validation error. |

### 3.10 UC-10: Manage Freelancer Profile

| Field | Description |
|-------|-------------|
| Use Case ID | UC-10 |
| Use Case Name | Manage Freelancer Profile |
| Actors | Freelancer |
| Description | Allows freelancers to view and update their profile, including work experience entries. |
| Trigger | Freelancer clicks "My Profile" in the navbar dropdown menu. |
| Preconditions | 1. User is logged in as a freelancer. |
| Postconditions | 1. Profile changes are saved. |
| Normal Flow | 1. Freelancer clicks "My Profile" button. <br>2. System navigates to `/freelancer-profile/${user.id}`. <br>3. Freelancer views current profile information. <br>4. Freelancer edits profile details or work experience entries. <br>5. System saves changes. |
| Alternative Flows | 1. Invalid input – show validation errors. <br>2. User cancels editing – return to view mode. |

### 3.11 UC-11: Review Freelancer

| Field | Description |
|-------|-------------|
| Use Case ID | UC-11 |
| Use Case Name | Review Freelancer |
| Actors | Client |
| Description | Allows clients to leave reviews and ratings for freelancers after order completion. |
| Trigger | Client selects "Leave Review" on a completed order. |
| Preconditions | 1. Client is logged in. <br>2. Order status is "Completed". |
| Postconditions | 1. Review is published on freelancer's profile. <br>2. Freelancer's average rating is updated. |
| Normal Flow | 1. Client selects completed order. <br>2. Clicks "Leave Review". <br>3. Fills out rating and review text. <br>4. Submits review. <br>5. System updates freelancer's rating. |
| Alternative Flows | 1. Client already left review – show existing review. <br>2. Client cancels – return to order view. |

### 3.12 UC-12: Process Payment

| Field | Description |
|-------|-------------|
| Use Case ID | UC-12 |
| Use Case Name | Process Payment |
| Actors | Client, System |
| Description | Handles the payment processing for orders. |
| Trigger | Client confirms order and proceeds to payment. |
| Preconditions | 1. Client is logged in. <br>2. Order details are confirmed. |
| Postconditions | 1. Payment is processed. <br>2. Order status is updated to "Paid". |
| Normal Flow | 1. Client selects payment method. <br>2. Enters payment details. <br>3. System processes payment. <br>4. Order is created with "Pending" status. <br>5. Client and freelancer are notified. |
| Alternative Flows | 1. Payment fails – show error and retry options. <br>2. Client cancels payment – order is not created. |

### 3.13 UC-13: Request Revision

| Field | Description |
|-------|-------------|
| Use Case ID | UC-13 |
| Use Case Name | Request Revision |
| Actors | Client |
| Description | Allows clients to request changes to delivered work. |
| Trigger | Client selects "Request Revision" on a delivered order. |
| Preconditions | 1. Client is logged in. <br>2. Order status is "Delivered". |
| Postconditions | 1. Revision request is sent to freelancer. <br>2. Order status is updated to "Revision Requested". |
| Normal Flow | 1. Client views delivered work. <br>2. Clicks "Request Revision". <br>3. Specifies desired changes. <br>4. System notifies freelancer. <br>5. Order status changes. |
| Alternative Flows | 1. No revision allowance left – show error message. <br>2. Client cancels request – remain on delivered work view. |

### 3.14 UC-14: Create and Manage Packages

| Field | Description |
|-------|-------------|
| Use Case ID | UC-14 |
| Use Case Name | Create and Manage Packages |
| Actors | Freelancer |
| Description | Allows freelancers to create and manage service packages (Basic, Standard, Premium). |
| Trigger | Freelancer accesses package management when creating or editing a gig. |
| Preconditions | 1. Freelancer is logged in. <br>2. Gig is being created or edited. |
| Postconditions | 1. Packages are saved with the gig. |
| Normal Flow | 1. Freelancer fills out gig details. <br>2. Proceeds to package section. <br>3. Defines different service tiers with prices and features. <br>4. System validates and saves packages. |
| Alternative Flows | 1. Invalid package data – show validation errors. <br>2. Freelancer tries to save without defining all required packages – show error. |

### 3.15 UC-15: Manage Attachments

| Field | Description |
|-------|-------------|
| Use Case ID | UC-15 |
| Use Case Name | Manage Attachments |
| Actors | Freelancer, Client |
| Description | Allows users to attach files to messages or deliverables. |
| Trigger | User clicks attachment icon in messaging or delivery interface. |
| Preconditions | 1. User is logged in. <br>2. User is in a messaging or delivery context. |
| Postconditions | 1. File is uploaded and attached. |
| Normal Flow | 1. User clicks attachment icon. <br>2. Selects file from their device. <br>3. System uploads and processes file. <br>4. Preview is shown to user. <br>5. User sends message or submits delivery with attachment. |
| Alternative Flows | 1. File too large – show size limit error. <br>2. Unsupported file type – show format error. <br>3. Upload fails – show error and retry option. |

### 3.16 UC-16: View Message History

| Field | Description |
|-------|-------------|
| Use Case ID | UC-16 |
| Use Case Name | View Message History |
| Actors | Freelancer, Client |
| Description | Allows users to view their conversation history with proper sorting and display. |
| Trigger | User opens a conversation. |
| Preconditions | 1. User is logged in. <br>2. At least one message exists in the conversation. |
| Postconditions | 1. Conversation history is displayed in chronological order. |
| Normal Flow | 1. User selects a conversation. <br>2. System fetches message history. <br>3. Messages are displayed in chronological order. <br>4. System automatically scrolls to the most recent message. <br>5. Message status indicators (sent, delivered, read) are displayed. |
| Alternative Flows | 1. No messages exist – show empty conversation state. <br>2. Connection error – show error and retry option. |

### 3.17 UC-17: View Freelancer Portfolio

| Field | Description |
|-------|-------------|
| Use Case ID | UC-17 |
| Use Case Name | View Freelancer Portfolio |
| Actors | Client, Freelancer |
| Description | Allows viewing a freelancer's portfolio, work history, and reviews. |
| Trigger | User navigates to freelancer's profile page. |
| Preconditions | 1. Freelancer exists in the system. |
| Postconditions | 1. Freelancer's profile information is displayed. |
| Normal Flow | 1. User navigates to freelancer profile. <br>2. System displays freelancer's bio, skills, and work experience. <br>3. System shows active gigs. <br>4. System displays ratings and reviews. <br>5. User can browse portfolio items. |
| Alternative Flows | 1. Freelancer has no portfolio items – show appropriate message. <br>2. Freelancer has no reviews – show "No reviews yet" message. |

### 3.18 UC-18: Accept/Reject Order

| Field | Description |
|-------|-------------|
| Use Case ID | UC-18 |
| Use Case Name | Accept/Reject Order |
| Actors | Freelancer |
| Description | Allows freelancers to accept or reject incoming order requests. |
| Trigger | New order notification or freelancer views pending orders. |
| Preconditions | 1. Freelancer is logged in. <br>2. At least one pending order exists. |
| Postconditions | 1. Order status is updated to "Accepted" or "Rejected". |
| Normal Flow | 1. Freelancer receives order notification. <br>2. Views order details. <br>3. Decides to accept or reject. <br>4. If accepted, order status changes to "In Progress". <br>5. If rejected, order is canceled. <br>6. Client is notified of decision. |
| Alternative Flows | 1. Freelancer requests clarification – sends message to client before deciding. <br>2. Order expires – system automatically rejects after timeout period. |
