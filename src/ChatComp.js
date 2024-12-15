import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://cbb-p7z8.onrender.com");

const ChatVotComp = () => {
    const [messages, setMessages] = useState([]); 
    const [input, setInput] = useState("");
    const [senderId, setSenderId] = useState("");

    useEffect(() => {
        setSenderId(socket.id);
        socket.emit("joinRoom", "general");
        const handleReceiveMessage = (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        socket.on("receiveMessage", handleReceiveMessage);
        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, []);

    const sendMessage = () => {
        if (!input.trim()) {
            alert("Cannot send an empty message!");
            return;
        }
        socket.emit("sendMessage", {
            room: "general",
            message: input,
            sender: senderId, 
        });
        setInput(""); 
    };

    return (
        <div className="holder">
            <div
                className="msgHolder"
                style={{
                    height: "400px",
                    overflowY: "auto",
                    border: "1px solid #ccc",
                    padding: "10px",
                }}
            >
                {messages.map((msg, index) => (
                    // <strong>{msg.sender === senderId ? "You" : msg.sender}:</strong> {msg.message}{" "}
                    // <small>{msg.time ? new Date(msg.time).toLocaleString() : "Unknown Time"}</small>
                    <div key={index}>
                        {msg.sender === senderId ? <p className="sent">You : {msg.message}</p> : <p className="receive">{msg.sender}: {msg.message}</p>}
                    </div>
                ))}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                style={{ width: "80%", padding: "10px", marginRight: "10px" }}
            />
            <button onClick={sendMessage} disabled={!input.trim()} style={{ padding: "10px" }}>
                Send
            </button>
        </div>
    );
};

export default ChatVotComp;
