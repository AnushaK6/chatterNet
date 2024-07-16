# ChatterNet: Live chat rooms

Realtime chat application using websockets. The server is built using Node.js, leveraging the Express.js framework for efficient routing and handling HTTP requests, and the Socket.io library to implement WebSockets for real-time, bidirectional communication between the server and clients. The server listens for incoming connections and handles various events such as message sending, room joining, and user disconnections. Allows realtime room-based messaging, user connection and disconnection handling, displays necessary information, option to create custom room.

**Deployed at**: https://chatternet-vhmq.onrender.com 

Click [here](https://chatternet-vhmq.onrender.com) to view and run the application

### Features:
- Realtime messaging
- User connection and disconnection handling
- Room-based messaging
- Activity detection
- Message broadcasting to specific rooms
- No name clash between users (different users with same name differentiated)
- Active rooms and users visibility
- Broadcast message on room joining, leaving
- Create new room or choose from existing
- Scroll to bottom button
