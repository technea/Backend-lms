import Message from '../models/Message.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';



const chatSocket = (io) => {
    // Authentication Middleware for individual socket connections
    // Based on Socket.io v4 patterns: using socket.handshake.auth
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
            const user = await User.findById(decoded.id).select('name role avatar');
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }
            socket.user = user;
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // Check if connection was recovered from state (v4 feature)
        if (socket.recovered) {
          console.log(`Connection recovered for ${socket.user.name}`);
        }

        // 1. Join a Chat Room
        socket.on('joinRoom', async (room) => {
            socket.join(room);
            console.log(`${socket.user.name} joined room: ${room}`);

            // Fetch previous history from MongoDB for the room
            try {
                const history = await Message.find({ room })
                    .sort({ timestamp: -1 })
                    .limit(50)
                    .populate('sender', 'name avatar');
                
                socket.emit('roomHistory', history.reverse());
            } catch (err) {
                console.error('Room History Error:', err);
            }
        });

        // 1b. Leave a Chat Room
        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log(`${socket.user.name} left room: ${room}`);
        });

        // 2. Chat Message with Acknowledgment (v4 tutorial pattern)
        socket.on('sendMessage', async (data, callback) => {
            const { room, message } = data;
            
            try {
                const newMessage = new Message({
                    sender: socket.user._id,
                    senderName: socket.user.name,
                    room,
                    message,
                    timestamp: new Date()
                });

                await newMessage.save();
                
                // Emit to all in room
                io.to(room).emit('message', {
                    _id: newMessage._id,
                    sender: {
                        _id: socket.user._id,
                        name: socket.user.name,
                        avatar: socket.user.avatar
                    },
                    senderName: socket.user.name,
                    message,
                    room,
                    timestamp: newMessage.timestamp
                });

                // Send acknowledgment to the sender
                if (callback) callback({ status: 'ok', messageId: newMessage._id });

            } catch (err) {
                console.error('Message Save Error:', err);
                if (callback) callback({ status: 'error', error: err.message });
            }
        });

        // 3. Delete Message
        socket.on('deleteMessage', async (messageId) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;

                // Check ownership (only sender or admin can delete)
                if (message.sender.toString() !== socket.user._id.toString() && socket.user.role !== 'admin') {
                    return socket.emit('error', { message: 'Unauthorized to delete this message' });
                }

                await Message.findByIdAndDelete(messageId);
                
                // Broadcast deletion to all in room
                io.to(message.room).emit('messageDeleted', messageId);
            } catch (err) {
                console.error('Delete Message Error:', err);
            }
        });

        // 4. User Typing Event
        socket.on('typing', (data) => {
            const { room, isTyping } = data;
            socket.to(room).emit('userTyping', { 
                userId: socket.user._id, 
                userName: socket.user.name, 
                isTyping 
            });
        });

        socket.on('disconnect', (reason) => {
            console.log(`User disconnected: ${socket.user.name}. Reason: ${reason}`);
        });
    });
};

export default chatSocket;
