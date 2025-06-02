# Sequence Diagrams for Freelancing Web Application

This document contains simplified sequence diagrams for the main logic flows in the Freelancing Web Application.

## 1. Real-time Messaging System

```plantuml
@startuml
skinparam sequence {
  ArrowColor #0076CE
  LifeLineBorderColor #0076CE
  LifeLineBackgroundColor white
  ParticipantBorderColor #0076CE
  ParticipantBackgroundColor #E6F5FF
  ParticipantFontColor black
  ActorBorderColor #0076CE
  ActorBackgroundColor white
  ActorFontColor black
}

actor User
participant "Frontend" as Frontend
participant "Socket" as Socket
participant "Backend" as Backend
participant "Database" as DB

User -> Frontend: 1. Select a conversation
Frontend -> Backend: 2. Request conversation messages
Backend -> DB: 3. Get messages from database
DB --> Backend: 4. Return messages
Backend --> Frontend: 5. Display messages

User -> Frontend: 6. Type and send message
Frontend -> Frontend: 7. Show message immediately
Frontend -> Backend: 8. Save message to server
Backend -> DB: 9. Store in database
DB --> Backend: 10. Confirm saved
Backend -> Socket: 11. Send to recipient
Socket --> Frontend: 12. Recipient receives message
Frontend -> Frontend: 13. Update chat display
@enduml
```

## 2. Authentication Flow

```plantuml
@startuml
skinparam sequence {
  ArrowColor #0076CE
  LifeLineBorderColor #0076CE
  LifeLineBackgroundColor white
  ParticipantBorderColor #0076CE
  ParticipantBackgroundColor #E6F5FF
  ParticipantFontColor black
  ActorBorderColor #0076CE
  ActorBackgroundColor white
  ActorFontColor black
}

actor User
participant "Login Page" as Login
participant "Auth System" as Auth
participant "Backend" as Backend
participant "Database" as DB

User -> Login: 1. Enter email and password
Login -> Backend: 2. Send login request
Backend -> DB: 3. Check credentials
DB --> Backend: 4. Verify user exists
Backend -> Backend: 5. Create user session
Backend --> Login: 6. Return user data & token
Login -> Auth: 7. Store user information
Auth -> Auth: 8. Connect to real-time services
Auth --> User: 9. Redirect to dashboard

User -> Auth: 10. Click logout
Auth -> Backend: 11. End session request
Backend -> Backend: 12. Delete session
Backend --> Auth: 13. Confirm logout
Auth -> Auth: 14. Clear user data
Auth --> User: 15. Return to login page
@enduml
```

## 3. Notification System

```plantuml
@startuml
skinparam sequence {
  ArrowColor #0076CE
  LifeLineBorderColor #0076CE
  LifeLineBackgroundColor white
  ParticipantBorderColor #0076CE
  ParticipantBackgroundColor #E6F5FF
  ParticipantFontColor black
  ActorBorderColor #0076CE
  ActorBackgroundColor white
  ActorFontColor black
}

actor "Sender" as Sender
actor "Recipient" as Recipient
participant "App" as App
participant "Backend" as Backend
participant "Database" as DB

Sender -> App: 1. Perform action (send message, etc.)
App -> Backend: 2. Process the action
Backend -> DB: 3. Save notification
DB --> Backend: 4. Confirm saved
Backend -> Recipient: 5. Send real-time notification
Recipient -> App: 6. See notification alert

Recipient -> App: 7. Open notifications page
App -> Backend: 8. Request notifications list
Backend -> DB: 9. Get all notifications
DB --> Backend: 10. Return notifications
Backend --> App: 11. Display notifications

Recipient -> App: 12. Click to mark as read
App -> Backend: 13. Update notification status
Backend -> DB: 14. Mark as read in database
DB --> Backend: 15. Confirm update
Backend --> App: 16. Update notification display
@enduml
```

## 4. Order Management Flow

```plantuml
@startuml
skinparam sequence {
  ArrowColor #0076CE
  LifeLineBorderColor #0076CE
  LifeLineBackgroundColor white
  ParticipantBorderColor #0076CE
  ParticipantBackgroundColor #E6F5FF
  ParticipantFontColor black
  ActorBorderColor #0076CE
  ActorBackgroundColor white
  ActorFontColor black
}

actor "Client" as Client
actor "Freelancer" as Freelancer
participant "App" as App
participant "Backend" as Backend
participant "Database" as DB

Client -> App: 1. Create order from gig
App -> Backend: 2. Submit order details
Backend -> DB: 3. Save order information
DB --> Backend: 4. Return order ID
Backend -> Freelancer: 5. Send order notification
Backend --> App: 6. Show order confirmation
App --> Client: 7. Order created successfully

Freelancer -> App: 8. Update order status
App -> Backend: 9. Change status request
Backend -> DB: 10. Update status in database
DB --> Backend: 11. Confirm update
Backend -> Client: 12. Send status notification
Backend --> App: 13. Status updated successfully
App --> Freelancer: 14. Show success message

Freelancer -> App: 15. Upload completed work
App -> Backend: 16. Send file and update
Backend -> DB: 17. Store file information
DB --> Backend: 18. Confirm file saved
Backend -> Client: 19. Send delivery notification
Backend --> App: 20. File uploaded successfully
App --> Freelancer: 21. Show delivery confirmation

Client -> App: 22. Review delivered work
App -> Backend: 23. Get order details
Backend -> DB: 24. Retrieve order files
DB --> Backend: 25. Return order data
Backend --> App: 26. Display work for review

Client -> App: 27. Request revision
App -> Backend: 28. Submit revision request
Backend -> DB: 29. Update order status
DB --> Backend: 30. Confirm update
Backend -> Freelancer: 31. Send revision notification
Backend --> App: 32. Revision requested
App --> Client: 33. Revision request confirmed

Freelancer -> App: 34. Upload revised work
App -> Backend: 35. Send updated file
Backend -> DB: 36. Store revised version
DB --> Backend: 37. Confirm update
Backend -> Client: 38. Send new delivery notification

Client -> App: 39. Accept final work
App -> Backend: 40. Submit acceptance
Backend -> DB: 41. Mark order as completed
DB --> Backend: 42. Confirm completion
Backend -> Freelancer: 43. Send completion notification
Backend --> App: 44. Order completed
App --> Client: 45. Show completion confirmation
@enduml
```
