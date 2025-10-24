/**
 * Import function triggers from their respective submodules:
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {VertexAI, HarmCategory, HarmBlockThreshold} from "@google-cloud/vertexai";
// WE NEED THE VISION CLIENT AGAIN!
import {ImageAnnotatorClient} from "@google-cloud/vision";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Initialize BOTH clients outside the function handlers for reuse
const vertexAI = new VertexAI({project: "menu-mentor-prod", location: "us-central1"});
const visionClient = new ImageAnnotatorClient();

// 180-IQ FIX: Use the stable, powerful reasoning model.
const model = vertexAI.getGenerativeModel({model: "gemini-2.5-flash"});

setGlobalOptions({maxInstances: 10});

/**
 * Interface for the user's dietary profile
 * We're using TypeScript, let's use types.
 */
interface UserProfile {
  diets: string[];
  restrictions: string[];
}

/**
 * Interface for the data we expect from the app
 */
interface AnalyzeMenuData {
  imageUrl: string; // This MUST be a gs:// path for now
  userProfile: UserProfile;
}

// THE 180-IQ "REAL" FUNCTION
export const analyzeMenu = onCall({timeoutSeconds: 540}, async (request) => {
  logger.info("analyzeMenu (v4) function called", {structuredData: true});

  // 1. VALIDATE THE INPUT
  // We're not hardcoding anymore. We're reading the real data.
  const data = request.data as AnalyzeMenuData;
  const {imageUrl, userProfile} = data;

  if (!imageUrl || !userProfile) {
    logger.error("Missing imageUrl or userProfile");
    throw new HttpsError("invalid-argument", "Missing imageUrl or userProfile.");
  }

  if (!imageUrl.startsWith("gs://")) {
    logger.error("Invalid imageUrl format. Must be a gs:// path.", {imageUrl});
    throw new HttpsError("invalid-argument", "Invalid imageUrl. Must be gs:// path.");
  }

  try {
    // ==========================================================
    // STEP 1: OCR (This is our Phase 2 code, now inside the real function)
    // ==========================================================
    logger.info("Step 1: Calling Cloud Vision API", {imageUrl});
    const [visionResult] = await visionClient.documentTextDetection(imageUrl);
    const fullTextAnnotation = visionResult.fullTextAnnotation;

    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      logger.error("No text found in image by Vision API", {imageUrl});
      throw new HttpsError("not-found", "No text could be read from the image.");
    }

    const rawOcrText = fullTextAnnotation.text;
    logger.info("Step 1 Complete: Text extracted.");

    // ==========================================================
    // STEP 2: AI ANALYSIS (This is our Phase 3 code, now dynamic)
    // ==========================================================
    logger.info("Step 2: Calling Gemini API");

    // We're not hardcoding the profile anymore!
    const systemPrompt = `
You are a highly-intelligent AI assistant for the 'Menu Mentor' app. Your one and only job is to analyze messy, raw OCR text from a restaurant menu and return a *single, valid JSON object*.

You will be given the menu text and a user's dietary profile.

Your task is to:
1.  Identify every individual dish on the menu.
2.  Analyze the dish's name, description, and ingredients against the user's profile.
3.  Classify each dish into one of three categories:
    * 'compliant': This dish appears 100% safe.
    * 'non_compliant': This dish contains an ingredient that violates the profile.
    * 'modifiable': The dish *could* be safe if a specific ingredient is removed (e..g, "ask for no cheese").
4.  Provide a *brief, clear reason* for every 'non_compliant' and 'modifiable' classification (e.g., "Contains 'milk'", "Contains 'wheat'").
5.  **SAFETY IS THE ONLY PRIORITY.** If a dish is ambiguous or has common hidden allergens (e.g., 'house sauce', 'dressing', 'broth'), default to 'non_compliant' or 'modifiable'. Do not guess.

The user's profile is: ${JSON.stringify(userProfile)}
The menu's raw text is:
---
${rawOcrText}
---

Return *nothing* but the single, valid JSON object in this exact format:
{
  "items": [
    {
      "name": "Dish Name",
      "classification": "compliant" | "non_compliant" | "modifiable",
      "reason": "e.g., Contains 'wheat'"
    }
  ]
}
`;

    // Safety settings to block harmful content
    const safetySettings = [
      {category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE},
      {category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE},
      {category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE},
      {category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE},
    ];

    // Call Gemini model
    const result = await model.generateContent({
      contents: [{role: "user", parts: [{text: systemPrompt}]}],
      safetySettings,
    });

    // Extract the JSON text from the response
    const candidates = result.response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }

    const jsonText = candidates[0].content.parts[0].text;
    if (!jsonText) {
      throw new Error("No text returned from Gemini");
    }

    logger.info("Step 2 Complete: AI analysis received.");

    // THE 180-IQ FIX (Clean-up): Strip the Markdown
    const cleanedJsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");

    // Parse and return the JSON
    const parsedResponse = JSON.parse(cleanedJsonText);

    // ==========================================================
    // STEP 3: RETURN THE MAGIC
    // ==========================================================
    logger.info("Step 3: Success. Returning magic JSON.");
    return parsedResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ?
      error.message :
      "An unknown error occurred";
    logger.error("Error in analyzeMenu pipeline", error);
    // Throw a real HttpsError so the client knows what happened
    throw new HttpsError("internal", errorMessage);
  }
});
