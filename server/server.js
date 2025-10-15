// npm init -y
// npm install bcryptjs cloudinary cors dotenv express jsonwebtoken mongoose multer nodemon socket.io
// npm install nodemon 
// npm run server
import express from 'express';
import "dotenv/config.js";
import http from 'http';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';


// create express app and http server
const app = express();
const server = http.createServer(app);
// setup socket.io server
export const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

//srote online users
export const userSocketMap = {};

// socket connection handler
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    console.log("User connected", userId);

    if(userId) userSocketMap[userId] = socket.id;
    // emit online users to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
    socket.on('disconnect', () => {
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

// middlewares setup
app.use(express.json({limit: '4mb'}));
app.use(cors());

// route setup
app.get('/api/status', (req, res) => res.send('API is running...'));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// connect to the database mongodb
await connectDB();

if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("Server running on port " + PORT));
}

// export server for vercel
export default server;