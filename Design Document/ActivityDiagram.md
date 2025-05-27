# Activity Diagrams - Freelancing Web Application

## Overview
These activity diagrams illustrate the key processes in the Freelancing Web Application, showing the flow of activities and decisions for critical operations.

## Real-Time Messaging Process

```mermaid
flowchart TD
    Start([Start]) --> OpenMessagesPage[User Opens Messages Page]
    OpenMessagesPage --> InitSocket[Initialize Socket Connection]
    InitSocket --> LoadConversations[Load User Conversations]
    
    LoadConversations --> SelectConversation{User Selects Conversation?}
    SelectConversation -->|No| WaitForSelection[Wait for User Selection]
    WaitForSelection --> SelectConversation
    
    SelectConversation -->|Yes| JoinRoom[Join Conversation Room via Socket]
    JoinRoom --> LoadCachedMessages[Check for Cached Messages]
    
    LoadCachedMessages --> CacheExists{Cache Exists?}
    CacheExists -->|Yes| DisplayCached[Display Cached Messages]
    CacheExists -->|No| DisplayLoading[Display Loading State]
    
    DisplayCached --> FetchMessages[Fetch Messages from Server]
    DisplayLoading --> FetchMessages
    
    FetchMessages --> MessagesReceived{Messages Received?}
    MessagesReceived -->|Yes| SortMessages[Sort Messages by Timestamp]
    MessagesReceived -->|No| ShowError[Show Error Message]
    ShowError --> UseCache{Cache Available?}
    UseCache -->|Yes| DisplayCached
    UseCache -->|No| EndError([End with Error State])
    
    SortMessages --> UpdateCache[Update Local Cache]
    UpdateCache --> DisplayMessages[Display Messages]
    DisplayMessages --> ScrollToBottom[Auto-scroll to Latest Message]
    
    ScrollToBottom --> WaitForAction[Wait for User Action]
    
    WaitForAction --> UserAction{User Action?}
    UserAction -->|Type Message| ComposeMessage[Compose Message]
    UserAction -->|Add Attachment| SelectFile[Select File]
    UserAction -->|Select Different Conversation| SelectConversation
    UserAction -->|Leave Page| Cleanup[Cleanup Socket Connection]
    Cleanup --> End([End])
    
    ComposeMessage --> SendMessage[User Sends Message]
    SelectFile --> PreviewFile[Preview File]
    PreviewFile --> ComposeMessage
    
    SendMessage --> OptimisticUpdate[Optimistically Add Message to UI]
    OptimisticUpdate --> ScrollToBottom
    OptimisticUpdate --> SaveToServer[Save Message to Server]
    
    SaveToServer --> EmitSocket[Emit Message via Socket]
    EmitSocket --> ServerResponse{Server Response?}
    
    ServerResponse -->|Success| UpdateMessageStatus[Update Message Status to Sent]
    ServerResponse -->|Error| MarkError[Mark Message with Error]
    MarkError --> RetryOption[Show Retry Option]
    RetryOption --> UserRetry{User Retries?}
    UserRetry -->|Yes| SaveToServer
    UserRetry -->|No| WaitForAction
    
    UpdateMessageStatus --> WaitForAction
```

## Order Creation Process

```mermaid
flowchart TD
    Start([Start]) --> BrowseGigs[Client Browses Gigs]
    BrowseGigs --> SelectGig[Client Selects Gig]
    SelectGig --> ViewDetails[View Gig Details]
    ViewDetails --> SelectPackage[Select Package Type]
    
    SelectPackage --> PackageType{Package Type?}
    PackageType -->|Basic| SetBasicPrice[Set Basic Price]
    PackageType -->|Standard| SetStandardPrice[Set Standard Price]
    PackageType -->|Premium| SetPremiumPrice[Set Premium Price]
    
    SetBasicPrice --> ReviewOrder[Review Order Details]
    SetStandardPrice --> ReviewOrder
    SetPremiumPrice --> ReviewOrder
    
    ReviewOrder --> ProceedToCheckout{Proceed to Checkout?}
    ProceedToCheckout -->|No| ViewDetails
    
    ProceedToCheckout -->|Yes| CheckLogin{User Logged In?}
    CheckLogin -->|No| RedirectToLogin[Redirect to Login Page]
    RedirectToLogin --> UserLoggedIn[User Logs In]
    UserLoggedIn --> CheckLogin
    
    CheckLogin -->|Yes| EnterRequirements[Enter Project Requirements]
    EnterRequirements --> ReviewFinal[Review Final Order]
    ReviewFinal --> Confirm{Confirm Order?}
    Confirm -->|No| EnterRequirements
    
    Confirm -->|Yes| ProcessPayment[Process Payment]
    ProcessPayment --> PaymentSuccess{Payment Successful?}
    PaymentSuccess -->|No| ShowPaymentError[Show Payment Error]
    ShowPaymentError --> RetryPayment{Retry Payment?}
    RetryPayment -->|Yes| ProcessPayment
    RetryPayment -->|No| CancelOrder[Cancel Order Process]
    CancelOrder --> End([End])
    
    PaymentSuccess -->|Yes| CreateOrder[Create Order in Database]
    CreateOrder --> NotifyFreelancer[Notify Freelancer]
    NotifyFreelancer --> RedirectToOrders[Redirect to Orders Page]
    RedirectToOrders --> End
```

## Real-Time Messaging Implementation

```mermaid
flowchart TD
    Start([Start]) --> SetupSocket[Configure Socket.IO]
    SetupSocket --> DefineOptions[Set Transport Options]
    DefineOptions --> EnableReconnection[Enable Auto Reconnection]
    EnableReconnection --> ConfigurePing[Configure Ping Interval/Timeout]
    
    ConfigurePing --> RegisterEvents[Register Socket Event Handlers]
    
    RegisterEvents --> RegisterUserEvents[Register User Events]
    RegisterUserEvents --> SetupJoinEvent[Setup Join Event]
    SetupJoinEvent --> SetupStatusEvent[Setup Status Change Event]
    
    RegisterEvents --> RegisterMessageEvents[Register Message Events]
    RegisterMessageEvents --> SetupSendEvent[Setup Send Message Event]
    SetupSendEvent --> SetupConversationEvents[Setup Join/Leave Conversation Events]
    
    RegisterEvents --> RegisterNotificationEvents[Register Notification Events]
    RegisterNotificationEvents --> SetupNotificationSubscription[Setup Notification Subscription]
    
    RegisterEvents --> RegisterDisconnectEvents[Register Disconnect Events]
    RegisterDisconnectEvents --> HandleUserDisconnect[Handle User Disconnect]
    
    HandleUserDisconnect --> StoreConnection[Store Connection in Map]
    StoreConnection --> ImplementMessageHandler[Implement Message Handler]
    
    ImplementMessageHandler --> ValidateMessageData[Validate Message Data]
    ValidateMessageData --> PrepareMessageObject[Prepare Message Object]
    PrepareMessageObject --> BroadcastToRoom[Broadcast to Conversation Room]
    
    BroadcastToRoom --> SendToSender[Send to Sender Socket]
    SendToSender --> CheckReceiverOnline[Check if Receiver is Online]
    
    CheckReceiverOnline --> ReceiverStatus{Receiver Online?}
    ReceiverStatus -->|Yes| SendToReceiver[Send to Receiver Socket]
    ReceiverStatus -->|No| LogOfflineStatus[Log Offline Status]
    
    SendToReceiver --> CreateDBMessage[Create Message in Database]
    LogOfflineStatus --> CreateDBMessage
    
    CreateDBMessage --> UpdateConversation[Update Conversation Last Message]
    UpdateConversation --> CreateNotification[Create Notification]
    CreateNotification --> ReturnSuccess[Return Success Response]
    ReturnSuccess --> End([End])
```

## Gig Creation Process

```mermaid
flowchart TD
    Start([Start]) --> CheckAuth{User Authenticated?}
    CheckAuth -->|No| RedirectLogin[Redirect to Login]
    RedirectLogin --> End([End])
    
    CheckAuth -->|Yes| CheckUserType{User is Freelancer?}
    CheckUserType -->|No| ShowError[Show Error Message]
    ShowError --> End
    
    CheckUserType -->|Yes| ShowGigForm[Display Gig Creation Form]
    ShowGigForm --> EnterBasicInfo[Enter Gig Title, Description, Category]
    EnterBasicInfo --> UploadGigImage[Upload Gig Image]
    UploadGigImage --> DefinePackages[Define Service Packages]
    
    DefinePackages --> DefineBasic[Define Basic Package]
    DefineBasic --> DefineStandard[Define Standard Package]
    DefineStandard --> DefinePremium[Define Premium Package]
    
    DefinePremium --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowValidationErrors[Show Validation Errors]
    ShowValidationErrors --> EnterBasicInfo
    
    ValidateForm -->|Yes| SaveGig[Save Gig to Database]
    SaveGig --> ProcessImage[Process and Store Image]
    ProcessImage --> SavePackages[Save Packages to Database]
    
    SavePackages --> SaveSuccess{Save Successful?}
    SaveSuccess -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> EnterBasicInfo
    
    SaveSuccess -->|Yes| UpdateFreelancerProfile[Update Freelancer Profile]
    UpdateFreelancerProfile --> RedirectToDashboard[Redirect to Freelancer Dashboard]
    RedirectToDashboard --> End
```

## Description

These activity diagrams illustrate the key processes in the Freelancing Web Application:

### Real-Time Messaging Process
This diagram shows the flow of activities involved in the real-time messaging feature, which was previously fixed to address various issues:
- Socket connection initialization
- Conversation selection and room joining
- Message caching and retrieval
- Message composition and sending
- Error handling and retry mechanisms
- Attachment handling

Key improvements highlighted include:
- Proper socket connection configuration
- Enhanced message reception handling
- Improved message fetching and display
- Direct chat updates for immediate visibility
- Message sorting by timestamp
- Automatic scrolling to latest messages

### Order Creation Process
This diagram illustrates how clients create orders in the system:
- Gig browsing and selection
- Package selection (Basic, Standard, Premium)
- Authentication verification
- Requirement specification
- Payment processing
- Order creation and notification

### Real-Time Messaging Implementation
This technical diagram shows the backend implementation of the real-time messaging system:
- Socket.IO configuration with proper transport options
- Event handler registration
- Message validation and broadcasting
- Online status tracking
- Database persistence
- Conversation updates

### Gig Creation Process
This diagram shows how freelancers create service offerings:
- Authentication and authorization checks
- Basic information entry
- Image upload
- Package definition for different service tiers
- Validation and persistence
- Profile updates

These activity diagrams provide a comprehensive view of the control flow in key processes of the Freelancing Web Application, highlighting both user interactions and system processing.
