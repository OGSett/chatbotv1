import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import ChatRoutes from './routes/ChatRoutes.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chat', ChatRoutes);

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['https://chatbotedit.vercel.app', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
    },
});

// connect to db
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// socket connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // join room
    socket.on('joinRoom', (room) => {
        if (!room) {
            console.error(`Invalid room name from ${socket.id}`);
            return;
        }
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    // handle messages
    socket.on('sendMessage', async (data) => {
        try {
            const { room, sender, message } = data;

            // validate data
            if (!room || !sender || !message) {
                console.error('Invalid message data:', data);
                return;
            }

            // broadcast message to hte room
            io.to(room).emit('receiveMessage', { sender, message, time: new Date() });
            console.log(`Broadcasting message: "${message}" from ${sender} to room: ${room}`);

            // save message to database
            const newMessage = new Message({ room, sender, message });
            await newMessage.save();
            console.log('Message saved to database:', newMessage);
        } catch (err) {
            console.error('Error handling sendMessage event:', err);
        }
    });

    // handle disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
