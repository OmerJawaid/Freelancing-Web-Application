//Messages
import dotenv from 'dotenv';
dotenv.config();
import { database_pool } from '../config/dbconnection.js';


const uploadMessages=async(req,res)=>{
    try{
        const{Conversation_Id,Sender_Id, Content, Type = 'text', Status}=req.body;
        console.log("Received message data:", req.body);

        if (!Conversation_Id || !Sender_Id || !Content) {
            return res.status(400).json({message: "Missing required fields"});
        }

        const query = `
           INSERT INTO messages 
            (Conversation_Id, Sender_Id, Content, Type, Status)
            VALUES (?, ?, ?, ?, ?);
        `;
        const result = await database_pool.query(query, [Conversation_Id, Sender_Id, Content, Type, Status]);

        if (!result || result.affectedRows === 0) {
            return res.status(500).json({message:"Failed to send message"});
        }

        // Update the conversation's last message and time
        const updateConversationQuery = `
            UPDATE conversations 
            SET Last_message = ?, 
                Last_message_time = NOW() 
            WHERE Id = ?
        `;
        
        await database_pool.query(updateConversationQuery, [Content, Conversation_Id]);

        res.status(200).json({message:"Message sent successfully", messageId: result.insertId});
    } catch(err){
        console.error("Error saving message:", err);
        res.status(500).json({message:"Internal server error", error: err.message});
    }
};

const retrieveMessages=async (req,res)=>{
    try{
        const{conversation_id}=req.query;
        if(!conversation_id){
            console.log("Invalid conversation_id");
            return res.status(400).json({message:"Invalid conversation_id"});
        }

        const [result]=await database_pool.query(
            `SELECT * FROM skillify.messages 
                WHERE Conversation_Id = ? 
                ORDER BY Created_at ASC;
        `,[conversation_id]
        )
        if (!result) {
            return res.status(500).json({ message: `Failed to retrieve messages` });
        }
        
        console.log(`Retrieved ${result.length} messages for conversation ${conversation_id}`);
        return res.json(result);
    }
    catch(err){
            console.error("Error retrieving messages:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
    }

};

export { uploadMessages, retrieveMessages };
