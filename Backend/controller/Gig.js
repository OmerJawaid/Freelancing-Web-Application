//Gig.js
import { database_pool } from "../config/dbconnection.js";
import path from 'path';

const fetchGig=async(req,res)=>{
   try{
      // Modified query to include basic package price (Type=1) and filter by State=1
      const [result] = await database_pool.query(
         'SELECT gigs.Id, gigs.Freelancer_Id, gigs.Title, gigs.Description, ' +
         'gigs.Category, gigs.Image, gigs.State, gigs.Views, ' +
         'freelancers.Id as freelancer_id, freelancers.Name, freelancers.Rating, ' +
         'freelancers.Image as freelancerimage, user.Email, ' +
         '(SELECT MIN(price) FROM packages WHERE packages.Gig_Id = gigs.Id AND packages.Type = 1) as BasicPrice ' +
         'FROM gigs ' +
         'JOIN freelancers ON gigs.Freelancer_Id = freelancers.Id ' +
         'JOIN user ON freelancers.id = user.id ' +
         'WHERE gigs.State = 1' // Add this condition to filter active gigs
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

const updateGigViews = async (req, res) => {
    try {
        const { gigId } = req.params;
        if (!gigId) {
            return res.status(400).json({ message: "Gig ID is required" });
        }

        const [result] = await database_pool.query(
            'UPDATE gigs SET Views = Views + 1 WHERE Id = ?',
            [gigId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Gig not found" });
        }

        return res.status(200).json({ message: "Views updated successfully" });

    } catch (err) {
        console.error("Error updating gig views:", err);
        return res.status(500).json({ message: "Error updating gig views", error: err.message });
    }
};

const toggleGigState = async (req, res) => {
    try {
        const { gigId } = req.params;
        const { state } = req.body;

        if (!gigId || (state !== 0 && state !== 1)) {
            return res.status(400).json({ message: "Valid Gig ID and state (0 or 1) are required" });
        }

        const [result] = await database_pool.query(
            'UPDATE gigs SET State = ? WHERE Id = ?',
            [state, gigId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Gig not found" });
        }

        return res.status(200).json({ message: "Gig state updated successfully" });

    } catch (err) {
        console.error("Error toggling gig state:", err);
        return res.status(500).json({ message: "Error toggling gig state", error: err.message });
    }
};

const createGig = async (req, res) => {
    try {
        // Check if user is authenticated and is a freelancer (assuming user type is available in session)
        if (!req.session || !req.session.user || req.session.user.userType !== 'freelancer') {
             // If user type is not stored in session, you might need a different way to verify freelancer
             // For now, I'll proceed assuming user.id corresponds to freelancer id for logged in users
        }

        const freelancerId = req.session.user.id; // Get logged-in freelancer ID from session
        const { title, description, category, packages } = req.body;
        const imageFile = req.file; // Get uploaded file details from Multer

        if (!freelancerId || !title || !description || !category || !imageFile || !packages || !Array.isArray(packages) || packages.length === 0) {
            // If any required data is missing, return an error
            // Also, if an image was uploaded, you might want to delete it here
            if (imageFile) {
                // Add logic to delete the uploaded file if there's a validation error
                // Example (requires fs module): fs.unlink(imageFile.path, (err) => { if (err) console.error('Error deleting file:', err); });
            }
            return res.status(400).json({ message: "Missing required gig information." });
        }

        // Construct the image path to be stored in the database (relative to the frontend public directory)
        // This path should be what the browser uses to access the image
        const dbImagePath = `/assets/gigImages/${imageFile.filename}`;

        // Start a database transaction for atomicity
        const connection = await database_pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert gig data
            const [gigResult] = await connection.query(
                'INSERT INTO gigs (Freelancer_Id, Title, Description, Category, Image, State, Views) VALUES (?, ?, ?, ?, ?, 1, 0)',
                [freelancerId, title, description, category, dbImagePath]
            );

            const newGigId = gigResult.insertId;

            // Insert package data
            for (const pkg of packages) {
                 // Ensure package data is valid before inserting
                if (!pkg.Type || pkg.Price === undefined || pkg.Delivery_Time === undefined || pkg.Package_Details === undefined) {
                    throw new Error('Invalid package data provided.');
                }
                await connection.query(
                    'INSERT INTO packages (Gig_Id, Price, Delivery_Time, Package_Details, Type) VALUES (?, ?, ?, ?, ?)',
                    [newGigId, pkg.Price, pkg.Delivery_Time, pkg.Package_Details, pkg.Type]
                );
            }

            // Commit the transaction
            await connection.commit();
            connection.release(); // Release the connection back to the pool

            return res.status(201).json({ message: "Gig created successfully!", gigId: newGigId });

        } catch (dbError) {
            // Rollback the transaction in case of any database error
            await connection.rollback();
            connection.release();
             // Also, delete the uploaded image if the database transaction fails
            if (imageFile) {
                 // Add logic to delete the uploaded file if the transaction fails
                 // Example (requires fs module): fs.unlink(imageFile.path, (err) => { if (err) console.error('Error deleting file during rollback:', err); });
            }
            throw dbError; // Re-throw the error to be caught by the outer catch block
        }

    } catch (err) {
        console.error("Error creating gig:", err);
         // If an error occurred before the database transaction (e.g., validation),
         // the uploaded file needs to be deleted here as well.
         // If you added deletion logic in the validation check, this part might be redundant,
         // but it's good practice to ensure cleanup.
        if (req.file) {
             // Add logic to delete the uploaded file if an error occurs
             // Example (requires fs module): fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file in final catch:', err); });
        }
        res.status(500).json({ message: "Failed to create gig", error: err.message });
    }
};

export {fetchGig,fetchGigByFreelancerIdForGigDisplay,fetchGigByGigId,fetchGigForFreelancer, updateGigViews, toggleGigState, createGig}