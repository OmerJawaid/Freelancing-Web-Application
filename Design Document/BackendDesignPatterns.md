# Backend Design Patterns

## Introduction

This document outlines the design patterns implemented in the Freelancing Web Application backend. Design patterns are reusable solutions to common problems that arise during software development. They provide a structured approach to design that promotes code reusability, maintainability, and scalability.

## Table of Contents

1. [Architectural Patterns](#architectural-patterns)
   - [Model-View-Controller (MVC)](#model-view-controller-mvc)
   - [Module Pattern](#module-pattern)

2. [Creational Patterns](#creational-patterns)
   - [Singleton Pattern](#singleton-pattern)
   - [Factory Method Pattern](#factory-method-pattern)

3. [Structural Patterns](#structural-patterns)
   - [Adapter Pattern](#adapter-pattern)
   - [Facade Pattern](#facade-pattern)

4. [Behavioral Patterns](#behavioral-patterns)
   - [Observer Pattern](#observer-pattern)
   - [Strategy Pattern](#strategy-pattern)
   - [Middleware Pattern](#middleware-pattern)

5. [Implementation References](#implementation-references)

## Architectural Patterns

### Model-View-Controller (MVC)

#### Pattern Description
The MVC pattern separates an application into three main components: Model (data and business logic), View (user interface), and Controller (handles user input and updates models).

#### Current Implementation
The backend partially implements MVC:
- **Models**: Represented by database queries in controller files
- **Controllers**: Located in the `/controller` directory
- **Views**: Not applicable in the backend API (handled by the frontend)

#### Enhanced Implementation
```javascript
// Model: User.js
export class User {
  constructor(id, username, email) {
    this.id = id;
    this.username = username;
    this.email = email;
  }
  
  static async findById(id) {
    const [user] = await database_pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return user[0] ? new User(user[0].id, user[0].username, user[0].email) : null;
  }
  
  static async create(userData) {
    // Implementation
  }
}

// Controller: UserController.js
import { User } from '../models/User.js';

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

#### Why MVC?
MVC is chosen because:
1. It provides clear separation of concerns
2. It makes the codebase more maintainable and testable
3. It's an industry-standard pattern for web applications
4. It allows parallel development of models, views, and controllers

#### Advantages Over Alternatives
- **Monolithic Architecture**: MVC provides better organization and testability
- **Microservices**: While microservices offer better scalability, MVC is simpler and more appropriate for this application's scale

### Module Pattern

#### Pattern Description
The Module Pattern encapsulates functionality into modules that export only what is necessary, hiding implementation details.

#### Current Implementation
The application already uses ES modules with proper imports/exports:

```javascript
// From sockets.js
export default configureSocket;

// From index.js
import configureSocket from './sockets/sockets.js';
```

#### Enhanced Implementation
Ensure consistent use of named vs. default exports:

```javascript
// messageService.js
export const sendMessage = async (data) => { /* implementation */ };
export const retrieveMessages = async (conversationId) => { /* implementation */ };

// Import specific functions where needed
import { sendMessage } from '../services/messageService.js';
```

#### Why Module Pattern?
The Module Pattern is chosen because:
1. It prevents global namespace pollution
2. It provides clear dependency management
3. It enables encapsulation of implementation details
4. It supports the principle of information hiding

## Creational Patterns

### Singleton Pattern

#### Pattern Description
The Singleton pattern ensures a class has only one instance and provides a global point of access to it.

#### Current Implementation
The database connection pool is implicitly a singleton:

```javascript
// dbconnection.js
const database_pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

export { database_pool };
```

#### Enhanced Implementation
Make the singleton pattern more explicit:

```javascript
// DatabaseSingleton.js
class DatabaseSingleton {
  constructor() {
    if (DatabaseSingleton.instance) {
      return DatabaseSingleton.instance;
    }
    
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'railway',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 31935,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }).promise();
    
    DatabaseSingleton.instance = this;
  }
  
  async query(sql, params) {
    return this.pool.query(sql, params);
  }
  
  async getConnection() {
    return this.pool.getConnection();
  }
}

export const db = new DatabaseSingleton();
```

#### Why Singleton?
The Singleton pattern is chosen for the database connection because:
1. Database connections are resource-intensive
2. A single connection pool can be shared across the application
3. It ensures consistent state of the connection
4. It prevents unnecessary duplication of connections

#### Advantages Over Alternatives
- **Multiple Connection Instances**: Less efficient use of resources
- **Global Variable**: Lacks encapsulation and proper initialization control
- **Dependency Injection**: While DI is generally preferable, the Singleton is simpler for this specific use case

### Factory Method Pattern

#### Pattern Description
The Factory Method pattern defines an interface for creating objects but lets subclasses decide which classes to instantiate.

#### Current Implementation
There's no clear factory pattern implementation currently.

#### Enhanced Implementation
Implement a notification factory to handle different types of notifications:

```javascript
// NotificationFactory.js
export class NotificationFactory {
  static createNotification(type, payload) {
    switch(type) {
      case 'message':
        return new MessageNotification(payload);
      case 'order':
        return new OrderNotification(payload);
      case 'review':
        return new ReviewNotification(payload);
      default:
        return new GenericNotification(payload);
    }
  }
}

class BaseNotification {
  constructor(payload) {
    this.payload = payload;
    this.createdAt = new Date();
  }
  
  save() {
    // Common save logic
  }
}

class MessageNotification extends BaseNotification {
  formatContent() {
    return `New message: ${this.payload.preview}`;
  }
  
  getRecipients() {
    return [this.payload.receiverId];
  }
}

// Usage in controller
import { NotificationFactory } from '../services/NotificationFactory.js';

const notification = NotificationFactory.createNotification('message', {
  receiverId: user.id,
  preview: 'Hello, how are you?'
});
notification.save();
```

#### Why Factory Method?
The Factory Method pattern is chosen because:
1. It encapsulates the creation logic of different notification types
2. It allows for extending with new notification types without changing existing code
3. It provides a consistent interface for creating diverse objects
4. It supports the Open/Closed Principle (open for extension, closed for modification)

#### Advantages Over Alternatives
- **Direct Instantiation**: Less flexible and violates Single Responsibility Principle
- **Abstract Factory**: More complex than needed for this use case
- **Builder Pattern**: Better for objects with many optional parameters, but overkill here

## Structural Patterns

### Facade Pattern

#### Pattern Description
The Facade Pattern provides a simplified interface to a complex subsystem, making it easier to use. It hides the complexities of multiple class interactions behind a single API.

#### Current Implementation
The application now uses a MessagingFacade to encapsulate all message-related operations:

```javascript
// MessagingFacade.js (implemented in utils/MessagingFacade.js)
import { database_pool } from '../config/dbconnection.js';
import { createNotification } from '../controller/Notification.js';

export class MessagingFacade {
  /**
   * Send a new message
   * @param {Object} messageData - Message data including conversation ID, sender ID, content
   * @param {Object} file - Optional file attachment
   * @returns {Object} Result object with message ID and status
   */
  static async sendMessage(messageData, file = null) {
    try {
      // Validate required fields
      if (!messageData.conversationId || !messageData.senderId) {
        throw new Error("Missing required fields");
      }
      
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
        attachmentUrl: processedData.attachmentUrl,
        type: processedData.type,
        lastMessagePreview: processedData.lastMessagePreview
      };
    } catch (error) {
      console.error("Error in MessagingFacade.sendMessage:", error);
      throw error;
    }
  }
  
  /**
   * Retrieve messages for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Array} Array of messages
   */
  static async getMessages(conversationId) {
    try {
      // Validate conversation ID
      if (!conversationId) {
        throw new Error("Missing conversation ID");
      }
      
      // Fetch messages from database
      const [messages] = await database_pool.query(
        `SELECT * FROM messages 
         WHERE Conversation_Id = ? 
         ORDER BY Created_at ASC;`,
        [conversationId]
      );
      
      return messages;
    } catch (error) {
      console.error("Error in MessagingFacade.getMessages:", error);
      throw error;
    }
  }
  
  /**
   * Mark messages as read
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID marking messages as read
   * @returns {Object} Result with count of updated messages
   */
  static async markMessagesAsRead(conversationId, userId) {
    try {
      const [result] = await database_pool.query(
        `UPDATE messages 
         SET Status = 'read' 
         WHERE Conversation_Id = ? 
         AND Sender_Id != ? 
         AND Status != 'read';`,
        [conversationId, userId]
      );
      
      return {
        success: true,
        updatedCount: result.affectedRows
      };
    } catch (error) {
      console.error("Error in MessagingFacade.markMessagesAsRead:", error);
      throw error;
    }
  }
  
  /**
   * Delete a message
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID of requester (for authorization)
   * @returns {Object} Result with success status
   */
  static async deleteMessage(messageId, userId) {
    try {
      // Check if user is authorized to delete message
      const [message] = await database_pool.query(
        `SELECT * FROM messages WHERE Id = ?`,
        [messageId]
      );
      
      if (!message || message.length === 0) {
        throw new Error("Message not found");
      }
      
      if (message[0].Sender_Id != userId) {
        throw new Error("Unauthorized to delete this message");
      }
      
      // Soft delete by updating status
      const [result] = await database_pool.query(
        `UPDATE messages SET Status = 'deleted' WHERE Id = ?`,
        [messageId]
      );
      
      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? "Message deleted" : "Failed to delete message"
      };
    } catch (error) {
      console.error("Error in MessagingFacade.deleteMessage:", error);
      throw error;
    }
  }
}
```

#### Usage in Controller

The Messages controller now uses the facade for all message operations:

```javascript
// Messages.js controller
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

#### Why Facade?
The Facade Pattern was chosen because:
1. It simplifies interactions with the complex messaging subsystem
2. It centralizes related functionality in one place, reducing code duplication
3. It hides implementation details from controllers, making them cleaner and more focused
4. It supports the real-time messaging improvements with better organization
5. It facilitates adding new message-related features like message deletion and read status tracking

#### Advantages Over Alternatives
- **Direct Controller Implementation**: More complex, leads to duplicated code across controllers
- **Separate Service Classes**: More fragmented, harder to maintain the cohesive message system
- **Microservices**: Too heavy for functionality that needs to be tightly integrated
- **Gateway Pattern**: More focused on external system integration

## Behavioral Patterns

### Observer Pattern
### Strategy Pattern

#### Pattern Description
The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from clients that use it.

#### Current Implementation
The application now uses the Strategy Pattern for notifications, allowing different notification delivery methods based on user preferences:

```javascript
// NotificationStrategy.js (implemented in utils/NotificationStrategy.js)
import { database_pool } from '../config/dbconnection.js';
import nodemailer from 'nodemailer';

/**
 * Base NotificationStrategy class that all concrete strategies will implement
 */
export class NotificationStrategy {
  /**
   * Send a notification using the strategy
   * @param {number} userId - The ID of the user to notify
   * @param {string} type - The type of notification (message, order, etc.)
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {number|null} relatedId - Optional related entity ID (e.g., conversation ID)
   * @returns {Promise<boolean>} - Success status
   */
  async sendNotification(userId, type, title, message, relatedId = null) {
    throw new Error('sendNotification method must be implemented by concrete strategies');
  }
  
  /**
   * Save notification to database for record-keeping
   */
  async saveToDatabase(userId, type, title, message, relatedId = null) {
    // Implementation to save notification to database
  }
}

/**
 * In-app notification strategy - delivers notifications through the application UI
 */
export class InAppNotificationStrategy extends NotificationStrategy {
  async sendNotification(userId, type, title, message, relatedId = null) {
    // First save to database
    const notificationId = await this.saveToDatabase(userId, type, title, message, relatedId);
    
    // If socket is available, emit notification to the user
    const io = global.io;
    if (io) {
      const users = global.users || {};
      const socketId = users[userId];
      if (socketId) {
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
    return true;
  }
}

/**
 * Email notification strategy - delivers notifications via email
 */
export class EmailNotificationStrategy extends NotificationStrategy {
  constructor() {
    super();
    
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  async sendNotification(userId, type, title, message, relatedId = null) {
    // Implementation for sending notification via email
    // Get user's email, format email template, send email
  }
}

/**
 * Combined notification strategy - uses multiple strategies at once
 */
export class CombinedNotificationStrategy extends NotificationStrategy {
  constructor(strategies) {
    super();
    this.strategies = strategies || [];
  }
  
  async sendNotification(userId, type, title, message, relatedId = null) {
    const results = await Promise.all(
      this.strategies.map(strategy => 
        strategy.sendNotification(userId, type, title, message, relatedId)
      )
    );
    
    // Return true if at least one strategy succeeded
    return results.some(result => result === true);
  }
}
}

// Notification context that uses strategies
export class NotificationContext {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  async sendNotification(userId, data) {
    return this.strategy.notify(userId, data);
  }
}

// Usage in notification service
export async function notifyUser(userId, type, title, content, referenceId) {
  const notificationData = { type, title, content, referenceId };
  
  // Get user preferences (default to socket + database)
  const [preferences] = await database_pool.query(
    'SELECT notification_preferences FROM users WHERE id = ?',
    [userId]
  );
  
  let userPrefs = {};
  try {
    userPrefs = JSON.parse(preferences[0]?.notification_preferences || '{}');
  } catch (e) {
    console.error('Error parsing notification preferences:', e);
  }
  
  // Apply strategies based on preferences and user online status
  const context = new NotificationContext(new DatabaseNotificationStrategy());
  await context.sendNotification(userId, notificationData);
  
  // If user is online and has socket notifications enabled
  if (global.users[userId] && (userPrefs.socket !== false)) {
    context.setStrategy(new SocketNotificationStrategy());
    await context.sendNotification(userId, notificationData);
  }
  
  // If user has email notifications enabled
  if (userPrefs.email === true) {
    context.setStrategy(new EmailNotificationStrategy());
    await context.sendNotification(userId, notificationData);
  }
}
```

#### Why Strategy?
The Strategy Pattern is chosen because:
1. It enables dynamic selection of notification methods based on context
2. It encapsulates each notification method in its own class
3. It makes it easy to add new notification channels without modifying existing code
4. It adheres to the Open/Closed Principle

#### Advantages Over Alternatives
- **Conditional Logic**: Less maintainable and leads to complex if-else chains
- **Template Method**: Less flexible for runtime changes
- **Command Pattern**: Better for operation queueing than algorithm selection

### Middleware Pattern

#### Pattern Description
The Middleware Pattern allows you to process requests or data by passing them through a chain of handlers. Each handler can process the request and decide whether to pass it to the next handler.

#### Current Implementation
The application already uses Express middleware:

```javascript
// From index.js
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
```

#### Enhanced Implementation
Extend the middleware pattern for message processing:

```javascript
// MessageMiddleware.js
export class MessageMiddleware {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  async process(message, next) {
    let index = 0;
    
    const run = async (i) => {
      // If we've run out of middleware, call next
      if (i >= this.middlewares.length) {
        return next ? next(message) : message;
      }
      
      // Execute middleware with a next function that calls the next middleware
      return this.middlewares[i](message, () => run(i + 1));
    };
    
    return run(0);
  }
}

// Message processing middlewares
export const sanitizeContent = (message, next) => {
  // Sanitize message content to prevent XSS
  if (message.content) {
    message.content = sanitizeHTML(message.content);
  }
  return next();
};

export const validateMessage = (message, next) => {
  // Validate required fields
  if (!message.senderId || !message.conversationId) {
    throw new Error('Missing required fields');
  }
  return next();
};

export const attachmentProcessor = (message, next) => {
  // Process attachment if present
  if (message.attachment) {
    // Handle attachment processing
    // ...
  }
  return next();
};

// Usage in controller
import { MessageMiddleware, sanitizeContent, validateMessage, attachmentProcessor } from '../middlewares/MessageMiddleware.js';

const messageProcessor = new MessageMiddleware()
  .use(validateMessage)
  .use(sanitizeContent)
  .use(attachmentProcessor);

export const uploadMessages = async (req, res) => {
  try {
    // Create message object from request
    const messageData = {
      senderId: req.body.Sender_Id,
      conversationId: req.body.Conversation_Id,
      content: req.body.Content,
      attachment: req.file,
      type: req.body.Type,
      status: req.body.Status || 'sent'
    };
    
    // Process message through middleware chain
    const processedMessage = await messageProcessor.process(messageData);
    
    // Save processed message to database
    // ...
    
    res.status(200).json({ success: true, message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

#### Why Middleware?
The Middleware Pattern is chosen because:
1. It provides a flexible way to process messages through a pipeline of operations
2. It allows for easy addition, removal, or reordering of processing steps
3. It promotes separation of concerns by isolating each processing step
4. It's familiar to Node.js/Express developers

#### Advantages Over Alternatives
- **Direct Processing**: Less flexible and harder to maintain
- **Chain of Responsibility**: Similar but middleware is more tailored to HTTP/request processing
- **Pipes and Filters**: More data transformation focused

## Implementation References

### Class Diagram

```
+-------------------------+                         +-------------------------+
|   DatabaseSingleton     |                         |    EventEmitter         |
+-------------------------+                         +-------------------------+
| - instance: static      |                         | - events: Object        |
| - pool: Connection      |                         | + on(event, listener)   |
+-------------------------+                         | + off(event, listener)  |
| + query()               |                         | + emit(event, ...args)  |
| + getConnection()       |                         | + once(event, listener) |
+-------------------------+                         +-------------------------+
          ^                                                  ^
          |                                                  |
          |                                                  |
          v                                                  v
+-------------------------+     +--------------------+     +-------------------------+
|    MessagingFacade      |     | NotificationFactory|     | NotificationStrategy   |
+-------------------------+     +--------------------+     +-------------------------+
| + sendMessage()         |     | + getStrategyForUser() | | + sendNotification()    |
| + getMessages()         |     | + createDefaultPrefs() | | + saveToDatabase()      |
| + markMessagesAsRead()  |     +--------------------+     +-------------------------+
| + deleteMessage()       |              |                            ^
| - _processMessageData() |              v                            |
| - _saveToDatabase()     |     +--------------------+                |
| - _updateConversation() |     | UserPreferences    |                |
| - _notifyRecipient()    |     +--------------------+     +-------------------------+
+-------------------------+     | - user_id          |     | InAppNotification      |
          ^                     | - in_app_enabled   |-----| EmailNotification      |
          |                     | - email_enabled    |     | CombinedNotification   |
          |                     +--------------------+     +-------------------------+
          |
          v
+-------------------------+              
|    MessageController    |              
+-------------------------+     
| + uploadMessages()      |     
| + retrieveMessages()    |     
| + markAsRead()          |     
| + deleteMessage()       |     
+-------------------------+     
          ^                     
          |                     
          |                     
          v
+-------------------------+
|     MessageRouter       |
+-------------------------+
| + POST /upload          |
| + GET /retrieve         |
+-------------------------+
```

### Implementation Strategy

To implement these patterns, follow this approach:

1. **Start with Creational Patterns**: Implement the Singleton and Factory patterns first to establish core infrastructure

2. **Apply Structural Patterns**: Implement the Adapter and Facade patterns to organize the codebase

3. **Implement Behavioral Patterns**: Add Observer, Strategy, and Middleware patterns to handle application logic

4. **Refactor Incrementally**: Convert one component at a time rather than making wholesale changes

5. **Maintain Backward Compatibility**: Ensure changes don't break existing functionality

### Pattern Selection Criteria

When selecting patterns, consider:

1. **Problem Fit**: Does the pattern solve a specific problem in the codebase?

2. **Complexity Budget**: Does the pattern's complexity justify its benefits?

3. **Team Familiarity**: Is the team familiar with the pattern?

4. **Future Extensions**: Does the pattern support anticipated future changes?

5. **Performance Impact**: Does the pattern negatively impact performance?

These design patterns will significantly improve the architecture of the Freelancing Web Application backend, making it more maintainable, extensible, and robust.
