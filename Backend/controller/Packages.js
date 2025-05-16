import { database_pool } from "../config/dbconnection.js";

const fetchPackagesByGigId=async(req,res)=>{
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
}

export{fetchPackagesByGigId};
