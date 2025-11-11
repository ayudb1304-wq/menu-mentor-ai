/**
 * Import function triggers from their respective submodules:
*/

import {setGlobalOptions} from "firebase-functions";
import {onCall, onRequest, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import {VertexAI, HarmCategory, HarmBlockThreshold} from "@google-cloud/vertexai";
// WE NEED THE VISION CLIENT AGAIN!
import {ImageAnnotatorClient} from "@google-cloud/vision";
import * as admin from "firebase-admin";
import Razorpay from "razorpay";
import * as crypto from "crypto";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Initialize BOTH clients outside the function handlers for reuse
const vertexAI = new VertexAI({project: "menu-mentor-prod", location: "us-central1"});
const visionClient = new ImageAnnotatorClient();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// 180-IQ FIX: Use the stable, powerful reasoning model.
const model = vertexAI.getGenerativeModel({model: "gemini-2.5-flash"});

setGlobalOptions({maxInstances: 10});

type SubscriptionStatus = "free" | "pending" | "active" | "failed" | "cancelled" | "pending_cancel";

interface SubscriptionUpdate {
  subscriptionStatus: SubscriptionStatus;
  planId?: string | null;
  validUntil?: admin.firestore.Timestamp | null;
}

const ALLOWED_PLAN_IDS = new Set(["plan_ReW1PnO4nBRilg", "plan_ReWBBDIuNeSvbx"]);

const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");
const razorpayWebhookSecret = defineSecret("RAZORPAY_WEBHOOK_SECRET");

const getRazorpayConfig = () => {
  const keyId = razorpayKeyId.value();
  const keySecret = razorpayKeySecret.value();
  const webhookSecret = razorpayWebhookSecret.value();

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  if (!webhookSecret) {
    throw new Error("Missing Razorpay webhook secret. Set RAZORPAY_WEBHOOK_SECRET.");
  }

  return {
    key_id: keyId,
    key_secret: keySecret,
    webhook_secret: webhookSecret,
  };
};

const createRazorpayClient = () => {
  const config = getRazorpayConfig();
  return new Razorpay({
    key_id: config.key_id,
    key_secret: config.key_secret,
  });
};

const setUserSubscriptionData = async (
  uid: string,
  data: Partial<{
    subscriptionId: string | null;
    planId: string | null;
    subscriptionStatus: SubscriptionStatus;
    validUntil: admin.firestore.Timestamp | null;
  }>
) => {
  const userRef = db.collection("users").doc(uid);
  const updateData: FirebaseFirestore.DocumentData = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (Object.prototype.hasOwnProperty.call(data, "subscriptionId")) {
    updateData.subscriptionId = data.subscriptionId ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(data, "planId")) {
    updateData.planId = data.planId ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(data, "subscriptionStatus")) {
    updateData.subscriptionStatus = data.subscriptionStatus ?? "free";
  }

  if (Object.prototype.hasOwnProperty.call(data, "validUntil")) {
    updateData.validUntil = data.validUntil ?? null;
  }

  await userRef.set(updateData, {merge: true});
};

const updateUserBySubscriptionId = async (subscriptionId: string, update: SubscriptionUpdate) => {
  const usersSnapshot = await db
    .collection("users")
    .where("subscriptionId", "==", subscriptionId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    logger.warn("No user found for subscription", {subscriptionId});
    return;
  }

  const userRef = usersSnapshot.docs[0].ref;
  const updateData: FirebaseFirestore.DocumentData = {
    subscriptionStatus: update.subscriptionStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (Object.prototype.hasOwnProperty.call(update, "planId")) {
    updateData.planId = update.planId ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(update, "validUntil")) {
    updateData.validUntil = update.validUntil ?? null;
  }

  await userRef.update(updateData);
};

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
export const analyzeMenu = onCall({timeoutSeconds: 300}, async (request) => {
  const functionStartTime = Date.now();
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
    const ocrStartTime = Date.now();
    logger.info("Step 1: Calling Cloud Vision API", {imageUrl});
    const [visionResult] = await visionClient.documentTextDetection(imageUrl);
    const fullTextAnnotation = visionResult.fullTextAnnotation;

    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      logger.error("No text found in image by Vision API", {imageUrl});
      throw new HttpsError("not-found", "No text could be read from the image.");
    }

    const rawOcrText = fullTextAnnotation.text;
    const ocrDuration = Date.now() - ocrStartTime;
    logger.info("Step 1 Complete: Text extracted.", {durationMs: ocrDuration});

    // ==========================================================
    // STEP 2: AI ANALYSIS (This is our Phase 3 code, now dynamic)
    // ==========================================================
    const aiStartTime = Date.now();
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

    const aiDuration = Date.now() - aiStartTime;
    logger.info("Step 2 Complete: AI analysis received.", {durationMs: aiDuration});

    // THE 180-IQ FIX (Clean-up): Strip the Markdown
    const cleanedJsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");

    // Parse and return the JSON
    const parsedResponse = JSON.parse(cleanedJsonText);

    // ==========================================================
    // STEP 3: RETURN THE MAGIC
    // ==========================================================
    const totalDuration = Date.now() - functionStartTime;
    logger.info("Step 3: Success. Returning magic JSON.", {
      totalDurationMs: totalDuration,
      ocrDurationMs: ocrDuration,
      aiDurationMs: aiDuration,
    });
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

export const createSubscription = onCall(
  {secrets: [razorpayKeyId, razorpayKeySecret, razorpayWebhookSecret]},
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const {planId} = request.data as {planId?: string};
    if (!planId) {
      throw new HttpsError("invalid-argument", "Missing planId.");
    }

    if (!ALLOWED_PLAN_IDS.has(planId)) {
      throw new HttpsError("invalid-argument", "Unsupported planId.");
    }

    try {
      const config = getRazorpayConfig();
      const razorpay = createRazorpayClient();

      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: 12,
        quantity: 1,
        customer_notify: 0,
      });

      await setUserSubscriptionData(uid, {
        subscriptionId: subscription.id,
        planId,
        subscriptionStatus: "pending",
        validUntil: null,
      });

      return {
        subscriptionId: subscription.id,
        keyId: config.key_id,
      };
    } catch (error) {
      logger.error("Failed to create Razorpay subscription", error);
      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Failed to create subscription."
      );
    }
  }
);

export const cancelSubscription = onCall(
  {secrets: [razorpayKeyId, razorpayKeySecret, razorpayWebhookSecret]},
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    try {
      const userSnap = await db.collection("users").doc(uid).get();
      if (!userSnap.exists) {
        throw new HttpsError("not-found", "User profile not found.");
      }

      const userData = userSnap.data() as {
        subscriptionId?: string | null;
      };

      const subscriptionId = userData.subscriptionId;
      if (!subscriptionId) {
        throw new HttpsError("failed-precondition", "No active subscription to cancel.");
      }

      const razorpay = createRazorpayClient();
      const cancellation = await razorpay.subscriptions.cancel(subscriptionId, true);

      const currentEnd =
        typeof cancellation?.current_end === "number" ?
          admin.firestore.Timestamp.fromMillis(cancellation.current_end * 1000) :
          null;
      const planId =
        typeof cancellation?.plan_id === "string" && cancellation.plan_id.length > 0 ?
          cancellation.plan_id :
          undefined;

      await setUserSubscriptionData(uid, {
        subscriptionStatus: cancellation?.status === "cancelled" ? "cancelled" : "pending_cancel",
        validUntil: currentEnd ?? null,
        ...(planId ? {planId} : {}),
      });

      return {message: "Subscription cancellation requested. Access remains until period ends."};
    } catch (error) {
      logger.error("Failed to cancel Razorpay subscription", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Failed to cancel subscription."
      );
    }
  }
);

export const abortPendingSubscription = onCall(
  {secrets: [razorpayKeyId, razorpayKeySecret, razorpayWebhookSecret]},
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    try {
      const userSnap = await db.collection("users").doc(uid).get();
      if (!userSnap.exists) {
        throw new HttpsError("not-found", "User profile not found.");
      }

      const userData = userSnap.data() as {
        subscriptionId?: string | null;
      };

      const subscriptionId = userData.subscriptionId;
      if (!subscriptionId) {
        return {message: "No pending subscription to abort."};
      }

      const razorpay = createRazorpayClient();
      try {
        await razorpay.subscriptions.cancel(subscriptionId, false);
      } catch (error) {
        // If Razorpay already cancelled the subscription, continue to clear local state
        logger.warn("Failed to cancel pending Razorpay subscription", {
          subscriptionId,
          error,
        });
      }

      await setUserSubscriptionData(uid, {
        subscriptionId: null,
        planId: null,
        subscriptionStatus: "free",
        validUntil: null,
      });

      return {message: "Pending subscription aborted."};
    } catch (error) {
      logger.error("Failed to abort pending subscription", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Failed to abort pending subscription."
      );
    }
  }
);

export const razorpayWebhookHandler = onRequest(
  {timeoutSeconds: 60, secrets: [razorpayKeyId, razorpayKeySecret, razorpayWebhookSecret]},
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    let config;
    try {
      config = getRazorpayConfig();
    } catch (error) {
      logger.error("Razorpay configuration error", error);
      response.status(500).send("Configuration error");
      return;
    }

    const expectedSignature = request.get("x-razorpay-signature");
    if (!expectedSignature) {
      response.status(400).send("Missing signature");
      return;
    }

    const rawBody = request.rawBody;
    const actualSignature = crypto
      .createHmac("sha256", config.webhook_secret)
      .update(rawBody)
      .digest("hex");

    if (actualSignature !== expectedSignature) {
      logger.warn("Invalid Razorpay webhook signature");
      response.status(400).send("Invalid signature");
      return;
    }

    const body =
      typeof request.body === "object" && request.body !== null ?
        request.body :
        JSON.parse(rawBody.toString("utf8"));

    const event: string | undefined = body.event;
    if (!event) {
      response.status(400).send("Missing event");
      return;
    }

    logger.info("Razorpay webhook received", {event});

    try {
      switch (event) {
      case "subscription.charged": {
        const subscriptionId: string | undefined =
            body.payload?.subscription?.entity?.id ??
            body.payload?.payment?.entity?.subscription_id;
        if (!subscriptionId) {
          logger.warn("subscription.charged missing subscription id");
          break;
        }

        const currentEnd: number | undefined =
            body.payload?.subscription?.entity?.current_end ??
            body.payload?.payment?.entity?.subscription?.current_end;

        const validUntil =
            typeof currentEnd === "number" ?
              admin.firestore.Timestamp.fromMillis(currentEnd * 1000) :
              null;

        await updateUserBySubscriptionId(subscriptionId, {
          subscriptionStatus: "active",
          validUntil: validUntil ?? null,
        });
        break;
      }
      case "subscription.cancelled": {
        const subscriptionId: string | undefined = body.payload?.subscription?.entity?.id;
        if (!subscriptionId) {
          logger.warn("subscription.cancelled missing subscription id");
          break;
        }

        await updateUserBySubscriptionId(subscriptionId, {
          subscriptionStatus: "cancelled",
        });
        break;
      }
      case "payment.failed": {
        const subscriptionId: string | undefined =
            body.payload?.payment?.entity?.subscription_id;
        if (!subscriptionId) {
          logger.warn("payment.failed missing subscription id");
          break;
        }

        await updateUserBySubscriptionId(subscriptionId, {
          subscriptionStatus: "failed",
        });
        break;
      }
      default:
        logger.info("Unhandled Razorpay event", {event});
      }

      response.status(200).send("OK");
    } catch (error) {
      logger.error("Error processing Razorpay webhook", error);
      response.status(500).send("Internal Server Error");
    }
  }
);
