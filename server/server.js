// npm init -y
// npm install bcryptjs cloudinary cors dotenv express jsonwebtoken mongoose multer nodemon socket.io
// npm install nodemon 
// npm run server
import express from 'express';
import "dotenv/config.js";
import http from 'http';
import cors from 'cors';
import { connectDB } from './lib/db.js';

// create express app and http server
const app = express();
const server = http.createServer(app);


// middlewares setup
app.use(express.json({limit: '4mb'}));
app.use(cors());
// expose a GET endpoint at /api/status
app.get('/api/status', (req, res) => res.send('API is running...'));

// connect to the database mongodb
await connectDB();


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on port " + PORT));

