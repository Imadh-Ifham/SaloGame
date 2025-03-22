import express from 'express';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
const router = express.Router();


//Google Analytics Data API client from environment variables
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY,
  },

  projectId: process.env.project_id,
});

//Google Analytics Property ID from environment variables
const propertyId = process.env.GA_PROPERTY_ID;


//User activity
router.get("/ga4/userActivity", async (req, res) => {
  try {
    //The request to the Google Analytics Data API
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,

      //The date range for which the data is to be fetched
      dateRanges:[{startDate: '2021-01-01', endDate: 'today'}],

      //The dimensions for the data to be fetched
      dimensions: [{name: "date"}],

      //The metrics for the data to be fetched
      metrics: [{name: "activeUsers"}],
});

  //The data from the response
   const labels : string[] = [];
   const values : number[] = [];

   response.rows?.forEach(row => {
    const date = row.dimensionValues?.[0]?.value;
    //Formatting the date to be in the format YYYY-MM-DD
    const formattedDate = date?.substring(0, 4) + "-" + date?.substring(4, 6) + "-" + date?.substring(6, 8);
    labels.push(formattedDate);
    values.push(parseInt(row.metricValues?.[0]?.value || "0"));
    });

    res.json({labels, values});
  } catch (error) {
    console.error("Error fetching GA4 user activity",error);
    res.status(500).json({error: "Failed to fetch analytics data"});
  }
});


//top actions
router.get("/ga4/top-actions", async (req, res) => {
    try{

        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{startDate: "30daysAgo", endDate: 'today'}],
            dimensions: [{name: "eventName"}],
            metrics: [{name: "eventCount"}],
            limit: 5
            
        });

        const labels : string[] = [];
        const values : number[] = [];

        response.rows?.forEach(row => {

            labels.push(row.dimensionValues?.[0]?.value ?? "unknown");
            values.push(parseInt(row.metricValues?.[0]?.value ?? "0"));
        });

        res.json({labels, values});
    }  catch (error) {
        console.error("Error fetching GA4 top actions",error);
        res.status(500).json({error: "Failed to fetch analytics data"});
      }
});

//page views
router.get("/ga4/page-views", async (req, res) => {

    try{
        
        //Calls the Google Analytics Data API to retrieve an analytics report.
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{startDate: "30daysAgo", endDate: 'today'}],
            dimensions: [{name: "pagePath"}],
            metrics: [{name: "screenPageViews"}],
            orderBys: [{metric: {metricName: "screenPageViews"}, desc: true}],
            //Limits the results to only the top 5 most viewed pages.
            limit: 5
    });

    const labels : string[] = [];
    const values : number[] = [];

    response.rows?.forEach(row => {
     let path = row.dimensionValues?.[0]?.value;

     //If the path is a URL, we extract the page path from the URL.
     path = path ? (path.length > 20 ? path.substring(0, 20) + "..." : path) : "";
        labels.push(path);
        values.push(parseInt(row.metricValues?.[0]?.value || "0"));
    });
    res.json({labels, values});
}catch (error) {
    console.error("Error fetching GA4 page views",error);
    res.status(500).json({error: "Failed to fetch analytics data"});
  }
});

export default router;