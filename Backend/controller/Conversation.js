//Conversations
import { database_pool } from '../config/dbconnection.js';

const createConversation=async(req,res) =>{
    console.log("Received conversation creation request:", req.body);
    const{User_one_id, User_two_id, Last_message, Last_message_time, Unread_count_user_one, Unread_count_user_two}=req.body;
    
    // Validate required fields
    if (!User_one_id || !User_two_id) {
        console.error("Missing required fields:", { User_one_id, User_two_id });
        return res.status(400).json({ message: "User IDs are required" });
    }

    try{
        console.log("Attempting to create conversation between users:", User_one_id, User_two_id);
        
        const[result]=await database_pool.query(
            'INSERT INTO conversations (User_one_id, User_two_id, Last_message, Last_message_time, Unread_count_user_one, Unread_count_user_two) ' +
            'SELECT ?, ?, ?, ?, ?, ? ' +
            'WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE (User_one_id = ? AND User_two_id = ?) OR (User_one_id = ? AND User_two_id = ?))',
            [User_one_id, User_two_id, Last_message, Last_message_time, Unread_count_user_one, Unread_count_user_two,
             User_one_id, User_two_id, User_two_id, User_one_id]
        );

        console.log("Query result:", result);

        if (result.affectedRows === 1) {
            res.status(200).json({ message: "Successfully created new conversation" });
        } else {
            // Check if conversation already exists
            const [existing] = await database_pool.query(
                'SELECT * FROM conversations WHERE (User_one_id = ? AND User_two_id = ?) OR (User_one_id = ? AND User_two_id = ?)',
                [User_one_id, User_two_id, User_two_id, User_one_id]
            );
            
            if (existing && existing.length > 0) {
                res.status(200).json({ message: "Conversation already exists" });
            } else {
                res.status(500).json({ message: "Failed to create conversation" });
            }
        }
    }
    catch(err){
        console.error("Error in creating conversation:", err);
        res.status(500).json({ message: "Error creating conversation", error: err.message });
    }
}

const retriveConversation=async(req,res)=>{
    try{
        const{User_Id}=req.query;
        console.log("Received request for User_Id: ",User_Id);
        if(!User_Id){
            return res.status(400).json({message:"User_Id is required"});
        }

        const query = `
        SELECT 
            conversations.Id AS ConversationId,
            conversations.User_one_id,
            conversations.User_two_id,
            conversations.Last_message,
            conversations.Last_message_time,
            conversations.Unread_count_user_one,
            conversations.Unread_count_user_two,
            COALESCE(clients.Name, freelancers.Name) AS Name,
            COALESCE(clients.Image, freelancers.Image) AS Image
        FROM conversations
        LEFT JOIN clients ON clients.Id = CASE 
            WHEN conversations.User_one_id = ? THEN conversations.User_two_id
            ELSE conversations.User_one_id 
        END
        LEFT JOIN freelancers ON freelancers.Id = CASE 
            WHEN conversations.User_one_id = ? THEN conversations.User_two_id
            ELSE conversations.User_one_id 
        END
        WHERE conversations.User_one_id = ? OR conversations.User_two_id = ?
    `;
    

        const [result] = await database_pool.query(query, [User_Id, User_Id, User_Id, User_Id]);
        console.log("SQL query executed successfully, found rows:", result ? result.length : 0);
        
        if(!result || result.length === 0){
            return res.status(404).json({ message: "No Conversations found with this ID" });
        }
        
        console.log("Conversations found, returning data");
        return res.json(result);
    }
    catch(err){
        console.error("General error in /retrive-conversations-by-id:", err);
        res.status(500).json({ message: "Unable to retrieve conversation data", error: err.message });
    }
}
export {createConversation,retriveConversation};