
const express = require('express')
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 2 * 60 * 1000  // 2 minutes in milliseconds
    }
}));

// Database connection
const database_pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Ahmad123',
    database: 'skillify',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Test database connection
database_pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
    });

//Registering a new user: Inserting data into table user
app.post('/signup',async(req,res)=>{
   try{
      const {Name,Email , Password,User_Type} = req.body;
      //Empty Inputs
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
}) 

// Login route
app.post('/login', async (req, res) => {
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
                CASE 
                    WHEN f.Id IS NOT NULL THEN 'freelancer'
                    WHEN c.Id IS NOT NULL THEN 'client'
                END as User_Type
            FROM user u
            LEFT JOIN freelancers f ON u.id = f.Id
            LEFT JOIN clients c ON u.id = c.Id
            WHERE u.Email = ?
        `, [Email]);

        if (users.length === 0 || users[0].Password !== Password) {
            return res.status(401).json({
                Authenticate: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        req.session.user = {
            id: user.id,
            email: user.Email,
            name: user.Name,
            User_Type: user.User_Type
        };

        return res.status(200).json({
            Authenticate: true,
            message: "Login successful",
            user: {
                id: user.id,
                email: user.Email,
                name: user.Name,
                User_Type: user.User_Type
            }
        });

    } catch (error) {
        return res.status(500).json({
            Authenticate: false,
            message: "An error occurred during login"
        });
    }
});

// Check authentication status
app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout route
app.post('/logout', (req, res) => {
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
});

//let gigs=await axios.get("http://localhost:8081/freelancer-gigs"); 
app.get('/freelancer-gigs',async(req,res)=>{
   try{
      const [result]=await database_pool.query('SELECT freelancers.Id, freelancers.Name, freelancers.Rating,freelancers.Image as freelancerimage, user.Email, gigs.Title, gigs.Description, gigs.Category, gigs.Price, gigs.Image FROM freelancers  JOIN skillify.user ON skillify.freelancers.id = skillify.user.id JOIN skillify.gigs ON skillify.gigs.Freelancer_Id = skillify.freelancers.id;')
      return res.status(201).json(result)
   }
   catch(err){
      console.log(err)
   }
})

app.get('/retrive-gigs', async(req,res)=>{
   try{ 
      const{freelancer_Id}=req.query;
      if (!freelancer_Id) {
         return res.status(400).json({ message: "freelancer_Id is required" });
       }
      const [result]= await database_pool.query('SELECT gigs.*, freelancers.Name, freelancers.bio, freelancers.Rating, freelancers.Image as UserImage FROM gigs JOIN freelancers ON freelancers.Id = gigs.Freelancer_Id WHERE Freelancer_id = ?',[freelancer_Id])
      if(!result|| result.length === 0){
         return res.status(404).json({ message: "No gigs found for this freelancer" });
      }
      return res.json(result)
   }
   catch(err){
      console.error(err);
      res.status(500).json({ message: "Unable to retrieve gigs data" });
   }
})

//Client Dashboard: Getting Data of freelancer
app.get('/')

//Testing next
const middleware = (req, res, next) => {
   console.log('Middleware executed')
   next() // Moves to the next middleware or route handler
 }
 
 app.use(middleware)
 
 app.get('/', (req, res) => {
   res.send('Hello, World!')
 })

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
});

const PORT = 8081;
app.listen(PORT, () => {});

module.exports = app;
