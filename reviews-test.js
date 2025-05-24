// Simple script to test reviews API
const fetchReviews = async () => {
  try {
    // Check the debug endpoint first
    console.log("Checking reviews table structure...");
    const debugResponse = await fetch('http://localhost:8081/reviews/debug');
    const debugData = await debugResponse.json();
    console.log("Debug data:", JSON.stringify(debugData, null, 2));

    // Try fetching reviews for a specific gig
    console.log("\nFetching reviews for gig ID 1...");
    const reviewsResponse = await fetch('http://localhost:8081/reviews/retrieve?Gig_Id=1');
    const reviewsData = await reviewsResponse.json();
    console.log("Reviews data:", JSON.stringify(reviewsData, null, 2));
    
    if (Array.isArray(reviewsData) && reviewsData.length > 0) {
      console.log(`Found ${reviewsData.length} reviews.`);
    } else {
      console.log("No reviews found for gig ID 1. Trying gig ID 4...");
      
      const reviews4Response = await fetch('http://localhost:8081/reviews/retrieve?Gig_Id=4');
      const reviews4Data = await reviews4Response.json();
      console.log("Reviews for gig 4:", JSON.stringify(reviews4Data, null, 2));
      
      if (Array.isArray(reviews4Data) && reviews4Data.length > 0) {
        console.log(`Found ${reviews4Data.length} reviews for gig ID 4.`);
      } else {
        console.log("No reviews found for gig ID 4 either.");
      }
    }
  } catch (error) {
    console.error("Error testing reviews API:", error);
  }
};

fetchReviews(); 