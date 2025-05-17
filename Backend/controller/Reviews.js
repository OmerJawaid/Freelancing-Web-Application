import { database_pool } from "../config/dbconnection.js";

const fetchReviewsByGigId=async(req,res)=>{
    try{
        const{Gig_Id}=req.query;
        if(!Gig_Id){
            return res.status(400).json({ message: "Gig_Id is required" });
        }
        const[result]= await database_pool.query('Select * From reviews where Gig_Id=?',[Gig_Id])
        if(!result|| result.length === 0){
            return res.status(200).json([]);
         }
         return res.json(result)
    }
    catch(err){
        console.error("Error fetching reviews:", err);
        res.status(500).json({ message: "Unable to retrieve reviews data" });
    }
}
export {fetchReviewsByGigId};