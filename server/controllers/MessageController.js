// Get all users expect the logged in user
import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUserForSideBar = async (req, res) => {
    try{
        const userId = req.user._id;
        const filterUsers = await User.find({_id: {$ne: userId}}).select('-password');

        //Count number of messages not seen 
        const unseenMessages = {}
        const promises = filterUsers.map(async (user) => {
            const message = await Message.find({senderId: user._id, receiverId: userId, seen: false})
            if(message.length > 0){
                unseenMessages[user._id] = message.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, users: filterUsers, unseenMessages});
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// get all messages for selected user
export const getMessages = async (req, res) => {
    try{
        const { id:selectedUserId } = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        })
        .sort({ createdAt: 1 }); // Sort messages by creation time in ascending order 
        await Message.updateMany({ senderId: selectedUserId, receiverId: myId} ,
            {seen: true });
            res.json({success: true, messages});
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try{
        const { id } = req.params;
        const message = await Message.findByIdAndUpdate(id, {seen: true});  
        res.json({success: true});

        // if(!message) return res.json({success: false, message: "Message not found"});
        // if(message.receiverId.toString() !== req.user._id.toString()){
        //     return res.json({success: false, message: "You are not authorized to mark this message as seen"});
        // }
        // message.seen = true;
        // await message.save();
        // res.json({success: true, message: "Message marked as seen"});
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// send message to selected user
export const sendMessage = async (req, res) => {
    try{
        const { text, image } = req.body;
        const  receiverId  = req.params.id;
        const senderId = req.user._id;
        let imageUrl;
        if(image){
            const upload = await cloudinary.uploader.upload(image);
            imageUrl = upload.secure_url;
        }
        // if(!text && !image) return res.json({success: false, message: "Message is empty"});
        // const newMessage = new Message({
        //     senderId: req.user._id,
        //     receiverId,
        //     text,
        //     image
        // });
        const newMessage =  await Message.create(
            {
                senderId, receiverId, text, image: imageUrl
            }
        );
        // emit the new message to the receiver socket if online
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }
        res.json({success: true, newMessage});
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}
