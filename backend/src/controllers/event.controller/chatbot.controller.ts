import { Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from 'dotenv';

dotenv.config();

// Safe way to get project ID from credentials
let projectId: string;
try {
  // Check if credentials are provided as a string (JSON) or a file path
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
  
  // Determine if it's JSON content or a file path
  if (credentials.trim().startsWith('{')) {
    // It's a JSON string
    projectId = JSON.parse(credentials).project_id;
  } else if (credentials) {
    // It's a file path
    const fs = require('fs');
    projectId = JSON.parse(fs.readFileSync(credentials, 'utf8')).project_id;
  } else {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS not provided");
  }
} catch (error) {
  console.error("Error loading DialogFlow credentials:", error);
  projectId = "default-project"; // Fallback, though this won't work in production
}

// Configure session client with environment variables
const sessionClient = new SessionsClient();

/**
 * Handle chatbot questions using DialogFlow
 */
export const askQuestion = async (req: Request, res: Response): Promise<void> => {
  const { message, sessionId, eventId } = req.body;
  
  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }
  
  try {
    // Create a session path
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId || uuidv4()
    );

    // Create the request with contexts if eventId is provided
    const request: any = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "en-US",
        },
      }
    };
    
    // Add event context if available
    if (eventId) {
      request.queryParams = {
        contexts: [
          {
            name: `${sessionPath}/contexts/event-context`,
            lifespanCount: 5,
            parameters: {
              eventId: eventId
            }
          }
        ]
      };
    }

    // Send request to DialogFlow
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0]?.queryResult;
    
    if (!result) {
      throw new Error("No response from DialogFlow");
    }
    
    res.json({ 
      reply: result.fulfillmentText || "I'm not sure how to respond to that."
    });
  } catch (error) {
    console.error("Dialogflow error:", error);
    res.status(500).json({ error: "Failed to get response from chatbot service" });
  }
};
