const express= require('express')
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
      const {Email , Password} = req.body;
      //Empty Inputs
      if(!Email||!Password){
         return res.status(400).json({message:"Email or Password is Empty"})
      }
      //Existing account(Email)
      const [existing]=await database_pool.query('Select * From user where Email=?', Email)
      if(existing.length>0){
         return res.status(409).json({message:"Email already Registered"})
      }
      //Registering New User
      const [result]=await database_pool.query('INSERT INTO user(Email, Password, created_at) VALUES(?,?,?)',
         [Email,Password,new Date])
         return res.status(201).json({ message: "User created successfully", userId: result.insertId})
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
   }
})

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
