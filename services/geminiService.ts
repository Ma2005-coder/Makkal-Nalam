
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Language, UserEligibilityData } from "../types";

// Always use named parameter for apiKey and assume process.env.API_KEY is available
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getLanguageName = (lang: Language) => {
  if (lang === 'ta') return 'Tamil';
  if (lang === 'hi') return 'Hindi';
  return 'English';
};

export const searchSchemes = async (query: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find relevant and current Tamil Nadu state government welfare schemes for: ${query}. Focus on BPL/poor families in Tamil Nadu. Respond in ${langName}.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const analyzeGrievance = async (description: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this public grievance for a Tamil Nadu citizen: "${description}". 
    Perform the following:
    1. Categorize into a department: (Revenue, Housing, Health, Education, Social Welfare, or Food & Consumer Protection).
    2. Provide a 1-sentence formal summary.
    3. Suggest the "Requested Action".
    
    Respond in ${langName} as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          department: { type: Type.STRING },
          formalSummary: { type: Type.STRING },
          requestedAction: { type: Type.STRING },
          urgency: { type: Type.STRING, description: "Low, Medium, or High" }
        },
        required: ["department", "formalSummary", "requestedAction", "urgency"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const reverseGeocodeToTN = async (lat: number, lng: number, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate coordinates (lat: ${lat}, lng: ${lng}) into a structured Tamil Nadu administrative address. 
    You MUST return JSON format with these exact fields:
    - district: Must match a valid Tamil Nadu district name.
    - taluk: Must match a valid Tamil Nadu taluk name.
    - village: The local village or area name.
    - pincode: The 6-digit postal code.
    
    Ensure names are standard and match official Tamil Nadu government records. 
    Respond in ${langName}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          district: { type: Type.STRING },
          taluk: { type: Type.STRING },
          village: { type: Type.STRING },
          pincode: { type: Type.STRING }
        },
        required: ["district", "taluk", "village", "pincode"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const verifyDocumentQuality = async (base64Data: string, docType: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  // Extract mime type from base64 if possible
  const mimeTypeMatch = base64Data.match(/^data:(.*);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
  const cleanBase64 = base64Data.replace(/^data:.*;base64,/, '');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: `Check this image of a "${docType}". 
          1. Is it clear and legible? 
          2. Does it appear to be the correct document type ("${docType}")? 
          3. Is it from Tamil Nadu (if applicable)?
          Provide a helpful response in ${langName}.
          Return as JSON: { "isValid": boolean, "feedback": string }`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING }
        },
        required: ["isValid", "feedback"]
      }
    }
  });

  return JSON.parse(response.text || '{"isValid": false, "feedback": "Error analyzing"}');
};

export const verifyDetailedEligibility = async (userData: UserEligibilityData, schemeName: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const familySizeStr = userData.familySize >= 6 ? 'More than 5' : userData.familySize.toString();
  const calculatedAnnualIncome = userData.incomePeriod === 'monthly' ? userData.income * 12 : userData.income;

  const prompt = `
    Analyze this citizen's profile specifically for the Tamil Nadu state government welfare scheme: "${schemeName}".
    
    User Profile Details (from Tamil Nadu):
    - Name: ${userData.name}
    - Phone: +91 ${userData.phone}
    - Calculated Annual Income: ₹${calculatedAnnualIncome}
    - No. of Family Members: ${familySizeStr}
    - Occupation: ${userData.occupation}
    - Education Level: ${userData.education}
    - Employment Status: ${userData.employmentStatus}
    - Category: ${userData.category}
    
    Strictly evaluate if this Tamil Nadu resident meets ALL criteria for "${schemeName}". 
    Respond in ${langName} in JSON format.
    The response should be an object:
    - isEligible: boolean
    - evaluationReason: string
    - potentialBenefits: string
    - documentsVerified: string[]
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isEligible: { type: Type.BOOLEAN },
          evaluationReason: { type: Type.STRING },
          potentialBenefits: { type: Type.STRING },
          documentsVerified: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["isEligible", "evaluationReason", "potentialBenefits", "documentsVerified"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const searchNearbyCenters = async (lat: number, lng: number, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  // Fix: Use gemini-3-flash-preview for general text/search tasks as recommended in guidelines
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find nearest E-Sevai centers, CSCs, and Tahsildar offices near lat: ${lat}, lng: ${lng} in Tamil Nadu. Provide names and approximate locations. Respond in ${langName}.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const checkEligibility = async (userInput: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze user situation for Tamil Nadu state welfare schemes: ${userInput}. Suggest matches. Respond in ${langName}.`,
    config: {
      thinkingConfig: { thinkingBudget: 1000 }
    }
  });

  return response.text;
};

export const getDashboardStats = async () => {
  // Simulating fetching stats from a model or database
  return [
    { category: 'Financial Assistance', impactValue: 85 },
    { category: 'Education Support', impactValue: 72 },
    { category: 'Housing & Shelter', impactValue: 54 },
    { category: 'Healthcare Reach', impactValue: 91 },
    { category: 'Farmer Subsidies', impactValue: 68 },
  ];
};
