import express, { Request, Response } from 'express';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize the Google Analytics client
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.PROJECT_ID,
});

// Get active users for the past 7 days
router.get('/active-users', async (_req: Request, res: Response) : Promise<void> =>  {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    
    if (!propertyId) {
       res.status(500).json({ error: 'Google Analytics Property ID not found' });
    }

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'activeUsers',
        },
      ],
      dimensions: [
        {
          name: 'date',
        },
      ],
    });

    const formattedData = response.rows?.map(row => ({
      date: row.dimensionValues?.[0].value,
      activeUsers: row.metricValues?.[0].value,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch Google Analytics data' });
  }
});

// Get page views for the past 7 days
router.get('/page-views', async (req: Request, res: Response) : Promise<void> =>  {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    
    if (!propertyId) {
       res.status(500).json({ error: 'Google Analytics Property ID not found' });
    }

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'screenPageViews',
        },
      ],
      dimensions: [
        {
          name: 'pagePath',
        },
      ],
      orderBys: [
        {
          metric: {
            metricName: 'screenPageViews',
          },
          desc: true,
        },
      ],
      limit: 10,
    });

    const formattedData = response.rows?.map(row => ({
      pagePath: row.dimensionValues?.[0].value,
      pageViews: row.metricValues?.[0].value,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch Google Analytics data' });
  }
});

// Get user engagement metrics
router.get('/user-engagement', async (_req: Request, res: Response) : Promise<void> =>  {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    
    if (!propertyId) {
       res.status(500).json({ error: 'Google Analytics Property ID not found' });
    }

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'userEngagementDuration',
        },
        {
          name: 'engagementRate',
        },
        {
          name: 'sessionsPerUser',
        },
      ],
    });

    const metrics = {
      userEngagementDuration: response.rows?.[0].metricValues?.[0].value,
      engagementRate: response.rows?.[0].metricValues?.[1].value,
      sessionsPerUser: response.rows?.[0].metricValues?.[2].value,
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch Google Analytics data' });
  }
});

// Get event count for the past 7 days
router.get('/event-count', async (_req: Request, res: Response) : Promise<void> =>  {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    
    if (!propertyId) {
       res.status(500).json({ error: 'Google Analytics Property ID not found' });
    }

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'eventCount',
        },
      ],
      dimensions: [
        {
          name: 'date',
        },
      ],
    });

    const formattedData = response.rows?.map(row => ({
      date: row.dimensionValues?.[0].value,
      eventCount: row.metricValues?.[0].value,
    }));

    // Get the total event count for summary
    const totalEventCount = response.rows?.reduce((sum, row) => {
      return sum + Number(row.metricValues?.[0].value || 0);
    }, 0);

    res.status(200).json({
      total: totalEventCount,
      dailyData: formattedData
    });
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch Google Analytics data' });
  }
});


// Get counts for specific event types
router.get('/event-types', async (_req: Request, res: Response): Promise<void> => {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    
    if (!propertyId) {
      res.status(500).json({ error: 'Google Analytics Property ID not found' });
      return;
    }

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'eventCount',
        },
      ],
      dimensions: [
        {
          name: 'eventName',
        },
      ],
      orderBys: [
        {
          metric: {
            metricName: 'eventCount',
          },
          desc: true,
        },
      ],
      limit: 20,
    });

    const formattedData = response.rows?.map(row => ({
      eventName: row.dimensionValues?.[0].value,
      count: row.metricValues?.[0].value,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching Google Analytics event data:', error);
    res.status(500).json({ error: 'Failed to fetch Google Analytics event data' });
  }
});

export default router;