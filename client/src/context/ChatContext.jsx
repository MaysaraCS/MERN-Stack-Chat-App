import { useState, createContext, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({children}) => {
    
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const{socket, axios} = useContext(AuthContext);

    // function to get all users for sidebar
    const getUsers = async()=>{
        try{
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        }catch(error){
            toast.error(error.message);
        }
    }

    // function to get  messages for selected user

    const getMessages = async(userId)=>{
        try{
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages);
            }
        }catch(error){
            toast.error(error.message);
        }
    }

    // function to send message to selected user
    const sendMessage = async(messageData)=>{
        try{
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if(data.success){
                setMessages(prevMessages => [...prevMessages, data.newMessage]);
            }else{
                toast.error(data.message);
            }
        }catch(error){
            toast.error(error.message);
        }
    }
    useEffect(()=>{
        if(!socket) return;

        const handleNewMessage = (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages(prevMessages => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages(prevUnSeenMessages => ({
                    ...prevUnSeenMessages,[newMessage.senderId]:
                    prevUnSeenMessages[newMessage.senderId] ? prevUnSeenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        }

        socket.on("newMessage", handleNewMessage);

        return ()=> {
            socket.off("newMessage", handleNewMessage);
        };
    },[socket, selectedUser]);


    const value={
        messages,users, selectedUser, setSelectedUser,getUsers, 
        unseenMessages, sendMessage, setUnseenMessages, getMessages

    }
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}