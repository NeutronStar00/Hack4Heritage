require('dotenv').config(); // Load environment variables from .env file
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key from the environment variable
const genAI = new GoogleGenerativeAI('AIzaSyB6UQrCNNfrNKU70Amm-fFo--8eX1zZz_I');

async function runGeminiAILocation(latitude, longitude) {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You will receive coordinates representing your current location. Utilize this data to identify heritage sites or historical landmarks of cultural significance within 100 kilomiters. The response should adhere to the following JSON structure:
    {
        "current_location": {
          "latitude": ${latitude},
          "longitude": ${longitude}
        },
        "heritage_sites": [
          {
            "name": "NAME_OF_HERITAGE_SITE_1",
            "latitude": LATITUDE_OF_SITE_1,
            "longitude": LONGITUDE_OF_SITE_1,
            "description": "BRIEF_DESCRIPTION_OF_SITE_1",
            "distance": "Distance_in_kilometer_from_current_location"
          },
          {
            "name": "NAME_OF_HERITAGE_SITE_2",
            "latitude": LATITUDE_OF_SITE_2,
            "longitude": LONGITUDE_OF_SITE_2,
            "description": "BRIEF_DESCRIPTION_OF_SITE_2",
            "distance": "Distance_in_kilometer_from_current_location"
          }
          // Add more heritage site objects as needed
        ]
    }
    If no heritage sites are within a reasonable distance, return an empty array for the "heritage_sites" key.

    For each identified heritage site, provide the following details:

    name: The official or common name of the heritage site.
    latitude: The latitude coordinate of the site.
    longitude: The longitude coordinate of the site.
    description: A brief (1-2 sentences) overview of the site's significance or historical importance.
    Ensure strict adherence to the specified JSON format. Avoid including any extraneous information beyond the requested data.

    Use the provided latitude and longitude coordinates: Latitude: ${latitude}, Longitude: ${longitude}"`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();let cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonResponse = JSON.parse(cleanedText); // Parse cleaned text to JSON
        console.log(jsonResponse);
        return jsonResponse;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

module.exports = runGeminiAILocation;