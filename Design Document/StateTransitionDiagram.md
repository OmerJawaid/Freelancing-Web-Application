# State Transition Diagram - Freelancing Web Application

## Overview
This state transition diagram illustrates the lifecycle of an order in the Freelancing Web Application, which is one of the most critical aspects of the system as it represents the core business transaction between clients and freelancers.

## Order Lifecycle State Diagram

```mermaid
stateDiagram-v2
    [*] --> Created: Client places order
    
    Created --> Pending: Payment successful
    Created --> Cancelled: Client cancels before payment
    Created --> Expired: Payment time limit exceeded
    
    Pending --> InProgress: Freelancer accepts order
    Pending --> Declined: Freelancer declines order
    Pending --> Cancelled: Admin cancels order
    Pending --> Cancelled: Client requests cancellation (approved)
    
    InProgress --> Delivered: Freelancer submits work
    InProgress --> Cancelled: Both parties agree to cancel
    InProgress --> Disputed: Client or freelancer raises dispute
    
    Delivered --> Revision: Client requests changes
    Delivered --> Completed: Client accepts delivery
    Delivered --> AutoCompleted: Auto-accept after time period
    Delivered --> Disputed: Client raises quality issue
    
    Revision --> Delivered: Freelancer resubmits work
    Revision --> Cancelled: Revision limit exceeded
    Revision --> Disputed: Unable to resolve revision requests
    
    Disputed --> InProgress: Dispute resolved, work continues
    Disputed --> Delivered: Dispute resolved, delivery accepted
    Disputed --> Cancelled: Dispute resolved with cancellation
    Disputed --> Completed: Dispute resolved with completion
    
    Completed --> [*]: Order archived
    Cancelled --> [*]: Order archived
    Expired --> [*]: Order archived
    AutoCompleted --> Completed: Final status update
```

## Message Status State Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft: User composes message
    
    Draft --> LocalPending: User clicks send
    LocalPending --> OptimisticDisplay: Add to UI immediately
    OptimisticDisplay --> Sending: Emit via Socket.IO
    
    Sending --> Sent: Server confirms receipt
    Sending --> ServerPending: Socket connected but no ACK
    Sending --> Failed: Network error
    
    ServerPending --> Sent: Delayed server ACK
    ServerPending --> Failed: Timeout exceeded
    
    Sent --> Delivered: Recipient's socket receives
    Sent --> StoredOffline: Recipient offline
    
    StoredOffline --> Delivered: Recipient comes online
    
    Delivered --> Read: Recipient views message
    
    Failed --> Retrying: Automatic retry attempt
    Failed --> RetryManual: Manual retry by user
    
    Retrying --> Sent: Retry successful
    Retrying --> Failed: Retry unsuccessful
    
    RetryManual --> Sending: User initiates retry
    
    Read --> ConversationActive: Message in active conversation
    ConversationActive --> [*]: Conversation archived
```

## Description

### Order Lifecycle States

1. **Created**: Initial state when a client places an order
2. **Pending**: Order is created and awaiting freelancer acceptance
3. **InProgress**: Freelancer has accepted and is working on the order
4. **Delivered**: Freelancer has submitted the completed work
5. **Revision**: Client has requested changes to the delivered work
6. **Completed**: Order has been successfully fulfilled and accepted
7. **AutoCompleted**: Order automatically marked as complete after a time period
8. **Cancelled**: Order has been terminated before completion
9. **Disputed**: Order has issues that require intervention
10. **Expired**: Order has timed out without action

### Message Status States

1. **Draft**: Message is being composed by the user
2. **LocalPending**: User has clicked send, message is being processed locally
3. **OptimisticDisplay**: Message is displayed in UI immediately before server confirmation
4. **Sending**: Message is being sent via Socket.IO to the server
5. **ServerPending**: Message sent to server but waiting for acknowledgment
6. **Sent**: Server has confirmed receipt of the message
7. **StoredOffline**: Message received by server but recipient is offline
8. **Delivered**: Message has been received by the recipient's device
9. **Read**: Message has been viewed by the recipient
10. **Failed**: Message failed to send due to network issues
11. **Retrying**: System is automatically attempting to resend the message
12. **RetryManual**: User has opted to manually retry sending the message
13. **ConversationActive**: Message is part of an active conversation

### Key Transitions

#### Order Transitions:
- Client actions can move an order to Created, Cancelled, Revision, Completed, or Disputed states
- Freelancer actions can move an order to InProgress, Delivered, or Declined states
- System can automatically transition to AutoCompleted or Expired states
- Disputes can be resolved in multiple ways, leading to different resulting states

#### Message Transitions:
- User actions trigger Created and Sending states
- Network conditions determine success (Sent) or failure (Failed)
- Recipient actions trigger Read state
- System automatically handles Delivered state and Retry attempts

This state transition diagram provides a comprehensive view of how orders and messages progress through different states based on user actions and system events, capturing the complex business logic of the Freelancing Web Application.
