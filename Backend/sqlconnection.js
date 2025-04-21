const express = require('express')
const mysql = require('mysql2');

const app= express();
const cors = require('cors')
app.use(cors())
app.use(express.json())


const database_pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Hina@1976',
  database: 'skillify'
}).promise();


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

//Login: Verifying user credentials
app.post('/login',async (req,res)=>{
   const {email,password} = req.body;
   try{
      const [result] = await database_pool.query('SELECT * FROM user WHERE Email = ? AND Password = ?', [email,password])
      console.log(email,password)
      if(result.length>0){
         console.log("Sucessfully Login");
         return res.status(201).json({Authenticate: true,message: "Successfully Logged in", userId: result.insertId})
      }
      else{ 
         console.log("Invalid credentials");
         return res.status(201).json({Authenticate: false,message: "Invalid Credentials", userId: result.insertId})
      }
   }
   catch(err){
      console.log(err) 
   }
})

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



app.listen(8081, ()=>{
   console.log("Server is running on port 8081")
})
