//Gig.js
import { database_pool } from "../config/dbconnection.js";

const fetchGig=async(req,res)=>{
   try{
      // Modified query to include basic package price (Type=1)
      const [result] = await database_pool.query(
         'SELECT gigs.Id, gigs.Freelancer_Id, gigs.Title, gigs.Description, ' +
         'gigs.Category, gigs.Image, gigs.State, gigs.Views, ' +
         'freelancers.Id as freelancer_id, freelancers.Name, freelancers.Rating, ' +
         'freelancers.Image as freelancerimage, user.Email, ' +
         '(SELECT MIN(price) FROM packages WHERE packages.Gig_Id = gigs.Id AND packages.Type = 1) as BasicPrice ' +
         'FROM gigs ' +
         'JOIN freelancers ON gigs.Freelancer_Id = freelancers.Id ' +
         'JOIN user ON freelancers.id = user.id'
      );
      
      return res.status(200).json(result);
   }
   catch(err){
      console.error("Error fetching gigs with package prices:", err);
      return res.status(500).json({ message: "Error retrieving gigs data", error: err.message });
   }
}


const fetchGigForFreelancer=async(req,res)=>{
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
}

const fetchGigByFreelancerIdForGigDisplay= async(req,res)=>{
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
 }


 const fetchGigByGigId=async(req,res)=>{
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
}

export {fetchGig,fetchGigByFreelancerIdForGigDisplay,fetchGigByGigId,fetchGigForFreelancer}