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
    origin: 'http://localhost:5173', // Frontend running on port 5173
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
        maxAge: 24 * 60 * 60 * 1000 //24 Hours
    }
}));

// Database connection
const database_pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Hina@1976',
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
            User_Type: user.User_Type,
            Image:user.Image
        };

        return res.status(200).json({
         Authenticate: true,
         message: "Login successful",
         user: {
           id: user.id,
           email: user.Email,
           name: user.Name,
           User_Type: user.User_Type,
           Image:user.Image
         }
       })
       

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

app.get('/freelancer-gigs',async(req,res)=>{
   try{
      const [result]=await database_pool.query('SELECT freelancers.Id, freelancers.Name, freelancers.Rating,freelancers.Image as freelancerimage, user.Email, gigs.Title, gigs.Description, gigs.Category, gigs.Image FROM freelancers  JOIN skillify.user ON skillify.freelancers.id = skillify.user.id JOIN skillify.gigs ON skillify.gigs.Freelancer_Id = skillify.freelancers.id;')
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

app.get('/retrive-gigs-by-freelancer-id', async(req,res)=>{
    try{ 
       const{Freelancer_Id}=req.query;
       console.log("Received request for Freelancer_Id:", Freelancer_Id);
       
       if (!Freelancer_Id) {
          return res.status(400).json({ message: "Freelancer_Id is required" });
        }
        
       try {
           // Using a simpler query to avoid complex joins that might be causing errors
           const [result]= await database_pool.query(
              'SELECT gigs.*, freelancers.Name AS freelancer_Name, ' +
              'freelancers.bio AS freelancer_Bio, freelancers.Rating AS freelancer_Rating, ' +
              'freelancers.Image AS freelancer_Image ' +
              'FROM gigs ' +
              'JOIN freelancers ON freelancers.Id = gigs.Freelancer_Id ' +
              'WHERE gigs.Freelancer_Id = ?', [Freelancer_Id]
           );
           
           console.log("SQL query executed successfully, results:", result ? result.length : 0);
           
           if(!result|| result.length === 0){
              return res.status(404).json({ message: "No gigs found for this freelancer" });
           }
           
           return res.json(result);
       } catch (sqlError) {
           console.error("SQL Error:", sqlError);
           return res.status(500).json({ message: "Database query error", error: sqlError.message });
       }
    }
    catch(err){
       console.error("General error in /retrive-gigs-by-freelancer-id:", err);
       res.status(500).json({ message: "Unable to retrieve gigs data", error: err.message });
    }
 })

 app.get('/retrive-packages-gigs-freelancer-by-gig-id',async(req,res)=>{
    try{
        const{Gig_Id}=req.query;
        console.log("Received package request for Gig_Id:", Gig_Id);
        
        if(!Gig_Id){
            console.log("No Gig_Id provided in request");
            return res.status(400).json({ message: "Gig_Id is required" });
        }
        
        console.log("Executing SQL query: Select * From packages where Gig_Id=?", [Gig_Id]);
        const[result]= await database_pool.query('Select * From packages where Gig_Id=?',[Gig_Id]);
        
        console.log("SQL query result:", result);
        
        if(!result|| result.length === 0){
            console.log("No packages found for Gig_Id:", Gig_Id);
            return res.status(404).json({ message: "No packages found for this Gig" });
         }
         
         console.log("Returning packages:", result);
         return res.json(result);
    }
    catch(err){
        console.error("Error in /retrive-packages-gigs-freelancer-by-gig-id:", err);
        res.status(500).json({ message: "Unable to retrieve packages data" });
    }
})


app.get('/retrive-reviews-gigs-freelancess-by-gig-id',async(req,res)=>{
    try{
        const{Gig_Id}=req.query;
        if(!Gig_Id){
            return res.status(400).json({ message: "Gig_Id is required" });
        }
        const[result]= await database_pool.query('Select * From reviews where Gig_Id=?',[Gig_Id])
        if(!result|| result.length === 0){
            return res.status(404).json({ message: "No reviews found for this Gig" });
         }
         return res.json(result)
    }
    catch(err){res.status(500).json({ message: "Unable to retrieve packages data" });}
})

// New endpoint to fetch a gig by its ID
app.get('/retrive-gig-by-id', async(req,res)=>{
    try{ 
        const{Gig_Id}=req.query;
        console.log("Received request for Gig_Id:", Gig_Id);
        
        if (!Gig_Id) {
            return res.status(400).json({ message: "Gig_Id is required" });
        }
        
        try {
            console.log("Executing SQL query for gig ID:", Gig_Id);
            
            const [result]= await database_pool.query(
                'SELECT gigs.*, freelancers.Name AS freelancer_Name, freelancers.bio AS freelancer_Bio, ' +
                'freelancers.Rating AS freelancer_Rating, freelancers.Image AS freelancer_Image ' +
                'FROM gigs JOIN freelancers ON freelancers.Id = gigs.Freelancer_Id ' +
                'WHERE gigs.Id = ?', [Gig_Id]
            );
            
            console.log("SQL query executed successfully, found rows:", result ? result.length : 0);
            
            if(!result || result.length === 0){
                return res.status(404).json({ message: "No gig found with this ID" });
            }
            
            console.log("Gig found, returning data");
            return res.json(result[0]);
        } catch (sqlError) {
            console.error("SQL Error in /retrive-gig-by-id:", sqlError);
            return res.status(500).json({ message: "Database query error", error: sqlError.message });
        }
    }
    catch(err){
        console.error("General error in /retrive-gig-by-id:", err);
        res.status(500).json({ message: "Unable to retrieve gig data", error: err.message });
    }
})

// Database schema check endpoint
app.get('/check-database', async (req, res) => {
    try {
        // Check if required tables exist
        const [tables] = await database_pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'skillify' 
            AND table_name IN ('gigs', 'freelancers', 'packages', 'reviews', 'user', 'clients')
        `);
        
        const existingTables = tables.map(t => t.table_name || t.TABLE_NAME);
        const requiredTables = ['gigs', 'freelancers', 'packages', 'reviews', 'user', 'clients'];
        const missingTables = requiredTables.filter(t => !existingTables.includes(t));
        
        // Check if gigs table has expected structure
        const [gigsColumns] = await database_pool.query(`
            SHOW COLUMNS FROM gigs
        `);
        
        const columnNames = gigsColumns.map(c => c.Field);
        const requiredColumns = ['Id', 'Title', 'Description', 'Freelancer_Id', 'Category', 'Price', 'Image'];
        const missingColumns = requiredColumns.filter(c => !columnNames.includes(c));
        
        // Check sample data
        const [sampleGig] = await database_pool.query(`
            SELECT COUNT(*) as count FROM gigs WHERE Id = 1
        `);
        
        const hasGigWithId1 = sampleGig[0].count > 0;
        
        res.json({
            databaseConnected: true,
            tables: {
                existing: existingTables,
                missing: missingTables,
                status: missingTables.length === 0 ? 'ok' : 'missing_tables'
            },
            gigsTable: {
                columns: columnNames,
                missingColumns: missingColumns,
                status: missingColumns.length === 0 ? 'ok' : 'missing_columns'
            },
            sampleData: {
                hasGigWithId1: hasGigWithId1
            }
        });
    } catch (error) {
        console.error("Database schema check error:", error);
        res.status(500).json({ 
            databaseConnected: false,
            error: error.message
        });
    }
});

// Health check endpoint for connectivity testing
app.get('/health-check', (req, res) => {
    res.status(200).send('Backend server is running');
});

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
