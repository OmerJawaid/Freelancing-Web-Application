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
      const [result]= await database_pool.query(
         'SELECT gigs.*, freelancers.Name, freelancers.bio, freelancers.Rating, ' +
         'freelancers.Image as UserImage, ' +
         '(SELECT Price FROM packages WHERE packages.Gig_Id = gigs.Id AND packages.Type = 1) as BasicPrice ' +
         'FROM gigs JOIN freelancers ON freelancers.Id = gigs.Freelancer_Id ' +
         'WHERE Freelancer_id = ?',
         [freelancer_Id]
      )
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
        // Check if user is authenticated and is a freelancer
        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: "You must be logged in to create a gig" });
        }

        // Verify the user is a freelancer
        if (req.session.user.User_Type !== 'freelancer') {
            return res.status(403).json({ message: "Only freelancers can create gigs" });
        }

        // Get the freelancer ID from the session
        const freelancerId = req.session.user.id;
        console.log("Creating gig for freelancer ID:", freelancerId);
        
        // Get the form data
        const title = req.body.Title;
        const description = req.body.Description;
        const category = req.body.Category;
        let packages;
        
        try {
            packages = JSON.parse(req.body.packages);
        } catch (err) {
            console.error("Error parsing packages:", err);
            return res.status(400).json({ message: "Invalid package data format" });
        }
        
        // Get the uploaded image
        const imageFile = req.file;

        // Validate required fields
        if (!freelancerId || !title || !description || !category || !imageFile || !packages || !Array.isArray(packages) || packages.length === 0) {
            console.error("Missing required fields:", { 
                freelancerId: !!freelancerId, 
                title: !!title, 
                description: !!description, 
                category: !!category, 
                imageFile: !!imageFile,
                packages: !!packages,
                isArray: packages ? Array.isArray(packages) : false,
                packagesLength: packages ? packages.length : 0
            });
            return res.status(400).json({ message: "Missing required gig information" });
        }

        // Construct the image path to be stored in the database (relative to the frontend public directory)
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
            connection.release();

            return res.status(201).json({ message: "Gig created successfully!", gigId: newGigId });

        } catch (dbError) {
            // Rollback the transaction in case of any database error
            await connection.rollback();
            connection.release();
            throw dbError; // Re-throw the error to be caught by the outer catch block
        }

    } catch (err) {
        console.error("Error creating gig:", err);
        return res.status(500).json({ message: "Error creating gig", error: err.message });
    }
};

const updateGig = async (req, res) => {
    try {
        // Check if user is authenticated and is a freelancer
        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: "You must be logged in to update a gig" });
        }

        // Verify the user is a freelancer
        if (req.session.user.User_Type !== 'freelancer') {
            return res.status(403).json({ message: "Only freelancers can update gigs" });
        }

        // Get the gig ID from params
        const { gigId } = req.params;
        if (!gigId) {
            return res.status(400).json({ message: "Gig ID is required" });
        }

        // Verify the gig belongs to this freelancer
        const [gigCheck] = await database_pool.query(
            'SELECT * FROM gigs WHERE Id = ? AND Freelancer_Id = ?',
            [gigId, req.session.user.id]
        );

        if (gigCheck.length === 0) {
            return res.status(403).json({ message: "You don't have permission to edit this gig" });
        }

        // Get the form data
        const title = req.body.Title;
        const description = req.body.Description;
        const category = req.body.Category;
        let packages;
        
        try {
            packages = JSON.parse(req.body.packages);
        } catch (err) {
            console.error("Error parsing packages:", err);
            return res.status(400).json({ message: "Invalid package data format" });
        }
        
        // Get the uploaded image if provided
        const imageFile = req.file;
        let dbImagePath = gigCheck[0].Image; // Default to existing image path

        // Validate required fields
        if (!title || !description || !category || !packages || !Array.isArray(packages) || packages.length === 0) {
            console.error("Missing required fields for update");
            return res.status(400).json({ message: "Missing required gig information" });
        }

        // If a new image was uploaded, update the image path
        if (imageFile) {
            dbImagePath = `/assets/gigImages/${imageFile.filename}`;
        }

        // Start a database transaction for atomicity
        const connection = await database_pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update gig data
            const [gigResult] = await connection.query(
                'UPDATE gigs SET Title = ?, Description = ?, Category = ?, Image = ? WHERE Id = ?',
                [title, description, category, dbImagePath, gigId]
            );

            // Handle packages: 
            // 1. Delete removed packages
            // 2. Update existing packages 
            // 3. Insert new packages

            // Get current packages for this gig
            const [currentPackages] = await connection.query(
                'SELECT * FROM packages WHERE Gig_Id = ?',
                [gigId]
            );

            // Create a map of existing package IDs
            const existingPackageMap = {};
            currentPackages.forEach(pkg => {
                existingPackageMap[pkg.ID] = true;
            });

            // Track which packages we're updating
            const updatedPackageIds = [];

            // Update or insert packages
            for (const pkg of packages) {
                if (pkg.ID && existingPackageMap[pkg.ID]) {
                    // Update existing package
                    await connection.query(
                        'UPDATE packages SET Price = ?, Delivery_Time = ?, Package_Details = ?, Type = ? WHERE ID = ?',
                        [Number(pkg.Price), Number(pkg.Delivery_Time), pkg.Package_Details, Number(pkg.Type), pkg.ID]
                    );
                    updatedPackageIds.push(pkg.ID);
                } else {
                    // Insert new package
                    await connection.query(
                        'INSERT INTO packages (Gig_Id, Price, Delivery_Time, Package_Details, Type) VALUES (?, ?, ?, ?, ?)',
                        [gigId, Number(pkg.Price), Number(pkg.Delivery_Time), pkg.Package_Details, Number(pkg.Type)]
                    );
                }
            }

            // Delete packages that were removed
            const packagesToDelete = currentPackages
                .filter(pkg => !updatedPackageIds.includes(pkg.ID))
                .map(pkg => pkg.ID);

            if (packagesToDelete.length > 0) {
                await connection.query(
                    'DELETE FROM packages WHERE ID IN (?)',
                    [packagesToDelete]
                );
            }

            // Commit the transaction
            await connection.commit();
            connection.release();

            return res.status(200).json({ message: "Gig updated successfully", gigId: gigId });

        } catch (dbError) {
            // Rollback the transaction in case of any database error
            await connection.rollback();
            connection.release();
            throw dbError; // Re-throw the error to be caught by the outer catch block
        }

    } catch (err) {
        console.error("Error updating gig:", err);
        return res.status(500).json({ message: "Error updating gig", error: err.message });
    }
};

export {fetchGig,fetchGigByFreelancerIdForGigDisplay,fetchGigByGigId,fetchGigForFreelancer, updateGigViews, toggleGigState, createGig, updateGig}