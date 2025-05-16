//Authenticaion.js
import { database_pool } from "../config/dbconnection.js";

//Registering a new user: Inserting data into table user
const signup=async(req,res)=>{
   try{
      const {Name,Email , Password,User_Type} = req.body;
      if(!Email||!Password||!Name||!User_Type){
         return res.status(400).json({message:"Name,Email,Password or UserType is Empty"})
      }
      //Existing account(Email)
      const [existing]=await database_pool.query('Select * From user where Email=?', Email)
      if(existing.length>0){
         return res.status(409).json({message:"Email already Registered"})
      }
      //Registering New User
      const [result]=await database_pool.query('INSERT INTO user(Email, Password, created_at) VALUES(?,?,?)',
         [Email,Password,new Date]);
      if(User_Type=="freelancer"){
         try{
         const[Freelancer_Rows]=await database_pool.query('Insert INTO freelancers(Id,Name) VALUES(?,?)',
            [result.insertId,Name]
         );
         }
         catch(err){
            return res.status(404).json({ message: err});   
         }
      }
      else if(User_Type == "client"){
         const[Client_Rows]=await database_pool.query('Insert INTO clients(Id,Name) VALUES(?,?)',
            [result.insertId,Name]
         );
      }
      else{
         return res.status(404).json({ message: "Invalid User Type"});
      }
         return res.status(201).json({Signup_Sucess:true, message: "User created successfully", userId: result.insertId});

   }
   catch(err){
      console.log(err) 
   }
}

// Login route
const login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        if (!Email || !Password) {
            return res.status(400).json({
                Authenticate: false,
                message: "Email and password are required"
            });
        }

        const [users] = await database_pool.query(`
            SELECT 
                u.*,
                COALESCE(f.Name, c.Name) as Name,
                COALESCE(f.Image, c.Image) AS Image,
                CASE 
                    WHEN f.Id IS NOT NULL THEN 'freelancer'
                    WHEN c.Id IS NOT NULL THEN 'client'
                END as User_Type
            FROM user u
            LEFT JOIN freelancers f ON u.id = f.Id
            LEFT JOIN clients c ON u.id = c.Id
            WHERE u.Email = ?
        `, [Email]);

        if (users.length === 0) {
            return res.status(401).json({
                Authenticate: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];
        
        // Compare passwords (plain text for now, should be hashed in production)
        if (user.Password !== Password) {
            return res.status(401).json({
                Authenticate: false,
                message: "Invalid email or password"
            });
        }

        // Set session data
        req.session.user = {
            id: user.id,
            email: user.Email,
            name: user.Name,
            User_Type: user.User_Type,
            Image: user.Image
        };

        // Save session
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({
                    Authenticate: false,
                    message: "Error saving session"
                });
            }

            return res.status(200).json({
                Authenticate: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.Email,
                    name: user.Name,
                    User_Type: user.User_Type,
                    Image: user.Image
                }
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            Authenticate: false,
            message: "An error occurred during login"
        });
    }
};

// Check authentication status
const checkAuthentication=(req, res) => {
    if (req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({ authenticated: false });
    }
}

// Logout route
const logout=(req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to logout'
            });
        }
        res.clearCookie('connect.sid');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
}

export {signup,login,logout,checkAuthentication}