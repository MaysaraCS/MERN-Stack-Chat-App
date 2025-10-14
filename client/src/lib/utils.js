export function formatMessageTime(date){
    return new Date(date).toLocaleTimeString("en-US",{
        hour: '2-digit',
        minute: '2-digit',   
        hour12: false,
    })
}
// npm install react-hot-toast axios socket.io-client