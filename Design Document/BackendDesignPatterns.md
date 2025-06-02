# Backend Design Patterns

## Introduction

This document outlines the design patterns implemented in the Freelancing Web Application backend. Design patterns are reusable solutions to common problems that arise during software development. They provide a structured approach to design that promotes code reusability, maintainability, and scalability.

## Table of Contents

1. [Architectural Patterns](#architectural-patterns)
   - [Model-View-Controller (MVC)](#model-view-controller-mvc)
   - [Module Pattern](#module-pattern)

2. [Creational Patterns](#creational-patterns)
   - [Factory Pattern](#factory-pattern)
   - [Singleton Pattern](#singleton-pattern)

3. [Structural Patterns](#structural-patterns)
   - [Facade Pattern](#facade-pattern)

4. [Behavioral Patterns](#behavioral-patterns)
   - [Observer Pattern](#observer-pattern)

5. [Implementation References](#implementation-references)

## Architectural Patterns

### Model-View-Controller (MVC)

#### Pattern Description
The MVC pattern separates an application into three main components: Model (data and business logic), View (user interface), and Controller (handles user input and updates models).

#### Current Implementation
The backend implements a variation of MVC:
- **Models**: Represented by database operations and entity classes
- **Controllers**: Located in the `/controller` directory, handle API requests
- **Views**: Not applicable in the backend API (handled by the frontend)

```javascript
// Controller: Order.js
const createOrder = async (req, res) => {
  try {
    const { User_Id, Freelancer_Id, Gig_Id, Package_Id } = req.body;

    // Validate required fields
    if (!User_Id || !Freelancer_Id || !Gig_Id) {
      return res.status(400).json({ message: "Missing required order information" });
    }

    // Create the order
    const [result] = await database_pool.query(
      'INSERT INTO orders (User_Id, Freelancer_Id, Gig_Id, Package_Id, Status) VALUES (?, ?, ?, ?, "pending")',
      [User_Id, Freelancer_Id, Gig_Id, Package_Id]
    );

    await createNotification(
      Freelancer_Id,
      'order',
      'New Order Received',
      'You have received a new order. Check your orders page for details.',
      result.insertId
    );

    return res.status(201).json({ 
      message: "Order created successfully", 
      orderId: result.insertId 
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ message: "Error creating order", error: err.message });
  }
};
```

#### Why MVC?
MVC is chosen because:
1. It provides clear separation of concerns
2. It makes the codebase more maintainable and testable
3. It's an industry-standard pattern for web applications
4. It allows parallel development of models, views, and controllers

### Module Pattern

#### Pattern Description
The Module Pattern encapsulates functionality into modules that export only what is necessary, hiding implementation details.

#### Current Implementation
The application uses ES modules with proper imports/exports:

```javascript
// From sockets.js
function configureSocket(server) {
  // Implementation
}
export default configureSocket;

// From index.js
import configureSocket from './sockets/sockets.js';
```

#### Why Module Pattern?
The Module Pattern is chosen because:
1. It prevents global namespace pollution
2. It provides clear dependency management
3. It enables encapsulation of implementation details
4. It supports the principle of information hiding

## Creational Patterns

### Factory Pattern

#### Pattern Description
The Factory Pattern defines an interface for creating objects but lets subclasses decide which classes to instantiate.

#### Current Implementation
The application implements the Factory Pattern in the `UserFactory` class:

```javascript
// UserFactory.js
class User {
  constructor({ id, name, image }) {
    this.id = id;
    this.name = name;
    this.image = image;
  }
  
  async saveProfile() {
    throw new Error('saveProfile() must be implemented by subclasses');
  }
}

class Client extends User {
  async saveProfile(database_pool) {
    await database_pool.query(
      'INSERT INTO clients(Id, Name, Image) VALUES (?, ?, ?)',
      [this.id, this.name, this.image]
    );
  }
}

class Freelancer extends User {
  constructor({ id, name, bio, image }) {
    super({ id, name, image });
    this.bio = bio;
  }
  
  async saveProfile(database_pool) {
    await database_pool.query(
      'INSERT INTO freelancers(Id, Name, bio, Image) VALUES (?, ?, ?, ?)',
      [this.id, this.name, this.bio, this.image]
    );
  }
}

export class UserFactory {
  static createUser(type, params) {
    switch (type.toLowerCase()) {
      case 'client':
        return new Client(params);
      case 'freelancer':
        return new Freelancer(params);
      default:
        throw new Error('Invalid User Type');
    }
  }
}
```

#### Usage in Authentication Controller

```javascript
// Authentication.js (excerpt)
import { UserFactory } from '../utils/UserFactory.js';

// In signup method
const user = UserFactory.createUser(User_Type, {
  id: result.insertId,
  name: Name,
  bio: Bio || null,
  image: imagePath
});
await user.saveProfile(database_pool);
```

#### Why Factory Pattern?
The Factory Pattern is chosen because:
1. It encapsulates the creation logic of different user types
2. It allows for extending with new user types without changing existing code
3. It provides a consistent interface for creating diverse objects
4. It supports the Open/Closed Principle (open for extension, closed for modification)

### Singleton Pattern

#### Pattern Description
The Singleton Pattern ensures a class has only one instance and provides a global point of access to it.

#### Current Implementation
The `NotificationService` is implemented as a singleton:

```javascript
// NotificationService.js
class NotificationService {
  // Methods for notification management
  async sendNotification(userId, type, title, message, relatedId = null) {
    // Implementation
  }
  
  async saveToDatabase(userId, type, title, message, relatedId = null) {
    // Implementation
  }
  
  // Other methods
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
```

#### Usage in Notification Controller

```javascript
// Notification.js
import notificationService from '../utils/NotificationService.js';

const createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    // Send notification using the service
    await notificationService.sendNotification(userId, type, title, message, relatedId);
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};
```

#### Why Singleton Pattern?
The Singleton Pattern is chosen for the NotificationService because:
1. It ensures a single point of access for notification management
2. It maintains consistent state across the application
3. It prevents unnecessary duplication of resources
4. It simplifies access to the service from different parts of the application

## Structural Patterns

### Facade Pattern

#### Pattern Description
The Facade Pattern provides a simplified interface to a complex subsystem, making it easier to use. It hides the complexities of multiple class interactions behind a single API.

#### Current Implementation
The application uses a `MessagingFacade` to encapsulate all message-related operations:

```javascript
// MessagingFacade.js
export class MessagingFacade {
  static async sendMessage(messageData, file = null) {
    try {
      // Process message data and attachment
      const processedData = this._processMessageData(messageData, file);
      
      // Store message in database
      const messageId = await this._saveMessageToDatabase(processedData);
      
      // Update conversation with last message info
      await this._updateConversation(processedData.conversationId, processedData.lastMessagePreview);
      
      // Create notification for recipient
      await this._notifyRecipient(processedData);
      
      // Return success response
      return {
        success: true,
        message: "Message sent successfully",
        messageId: messageId,
        // Other properties
      };
    } catch (error) {
      console.error("Error in MessagingFacade.sendMessage:", error);
      throw error;
    }
  }
  
  static async getMessages(conversationId) {
    // Implementation
  }
  
  static async markMessagesAsRead(conversationId, userId) {
    // Implementation
  }
  
  static async deleteMessage(messageId, userId) {
    // Implementation
  }
  
  // Private helper methods
  static _processMessageData(messageData, file) {
    // Implementation
  }
  
  static _saveMessageToDatabase(data) {
    // Implementation
  }
  
  static _updateConversation(conversationId, lastMessage) {
    // Implementation
  }
  
  static _notifyRecipient(data) {
    // Implementation
  }
}
```

#### Usage in Messages Controller

```javascript
// Messages.js
import { MessagingFacade } from '../utils/MessagingFacade.js';

const uploadMessages = async (req, res) => {
  try {
    const { Conversation_Id, Sender_Id, Content, Type, Status } = req.body;
    
    // Use the MessagingFacade to handle all the message sending operations
    const result = await MessagingFacade.sendMessage({
      conversationId: Conversation_Id,
      senderId: Sender_Id,
      content: Content,
      type: Type,
      status: Status
    }, req.file);
    
    // Return success response
    res.status(200).json(result);
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: err.message 
    });
  }
};
```

#### Why Facade Pattern?
The Facade Pattern is chosen because:
1. It simplifies the complex messaging subsystem for client code
2. It centralizes related operations (saving messages, updating conversations, sending notifications)
3. It reduces dependencies between components
4. It improves code maintainability by hiding implementation details

## Behavioral Patterns

### Observer Pattern

#### Pattern Description
The Observer Pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

#### Current Implementation
The application implements the Observer Pattern through Socket.IO for real-time communication:

```javascript
// sockets.js
function configureSocket(server) {
  const io = new Server(server, {
    // Configuration
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Register event handlers
    registerUserEvents(socket, io);
    registerMessageEvents(socket, io);
    registerOrderEvents(socket, io);
    registerDisconnectEvents(socket, io);
  });

  return io;
}

// User joins the socket
socket.on('join', (data) => {
  const { userId } = data;
  
  // Associate userId with socket ID
  userConnections[userId] = socket.id;
  global.users[userId] = socket.id;
  
  // Join rooms
  socket.join(`user_${userId}`);
  socket.join('all_users');
  
  // Mark user as online
  onlineUsers.add(userId);
  
  // Notify all clients about the user going online
  io.to('all_users').emit('user_status_change', { userId, status: 'online' });
});

// User sends a message
socket.on('send_message', (data) => {
  // Process message data
  
  // Broadcast to the conversation room
  io.to(`conversation_${conversationId}`).emit('receive_message', messagePayload);
  
  // Send to receiver
  io.to(`user_${receiverId}`).emit('receive_message', messagePayload);
});
```

#### Usage with NotificationService

```javascript
// NotificationService.js
sendRealTimeNotification(userId, notificationId, type, title, message, relatedId = null) {
  // Get the global socket.io instance
  const io = global.io;
  if (!io) {
    console.warn("Socket.IO not available, skipping real-time notification");
    return;
  }
  
  // Get the user's socket ID from the global users object
  const users = global.users || {};
  const socketId = users[userId];
  
  if (socketId) {
    // Emit the notification to the specific user
    io.to(socketId).emit('new_notification', {
      id: notificationId,
      type,
      title,
      message,
      relatedId,
      createdAt: new Date()
    });
  }
}
```

#### Why Observer Pattern?
The Observer Pattern is chosen because:
1. It enables real-time updates without polling
2. It decouples event producers from event consumers
3. It allows for dynamic subscription and unsubscription
4. It supports broadcasting to multiple clients

## Implementation References

### Key Files and Their Patterns

| File | Pattern(s) | Description |
|------|------------|-------------|
| `utils/UserFactory.js` | Factory | Creates appropriate user objects based on user type |
| `utils/MessagingFacade.js` | Facade | Simplifies messaging operations |
| `utils/NotificationService.js` | Singleton | Provides a single point of access for notification management |
| `sockets/sockets.js` | Observer | Enables real-time communication |
| `controller/*.js` | MVC (Controller) | Handles API requests and responses |
| All JS files | Module | Encapsulates functionality and manages dependencies |

### Pattern Relationships

The patterns work together to create a cohesive architecture:

1. **MVC + Module**: Controllers use modules to organize code and separate concerns
2. **Factory + MVC**: Controllers use factories to create appropriate objects
3. **Facade + Observer**: The MessagingFacade uses the Observer pattern (via sockets) to notify clients of changes
4. **Singleton + Observer**: The NotificationService singleton uses the Observer pattern to send real-time notifications

### Benefits of the Current Implementation

1. **Maintainability**: Clear separation of concerns and encapsulation of complex logic
2. **Extensibility**: Easy to add new features without modifying existing code
3. **Reusability**: Common functionality is centralized and reused across the application
4. **Testability**: Components can be tested in isolation
5. **Performance**: Efficient resource usage through patterns like Singleton and Observer
