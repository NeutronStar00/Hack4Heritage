require('dotenv').config(); // Load environment variables from .env file
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key from the environment variable
const genAI = new GoogleGenerativeAI('AIzaSyB6UQrCNNfrNKU70Amm-fFo--8eX1zZz_I');

async function runGeminiAI(latitude, longitude) {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You will be provided with a set of coordinates representing your current location. Please use this information to identify any nearby heritage sites or historical landmarks of cultural significance.
The response should be in the following JSON format:
{
"current_location": {
"latitude": YOUR_LATITUDE,
"longitude": YOUR_LONGITUDE
},
"heritage_sites": [
{
"name": "NAME_OF_HERITAGE_SITE_1",
"latitude": LATITUDE_OF_SITE_1,
"longitude": LONGITUDE_OF_SITE_1,
"description": "BRIEF_DESCRIPTION_OF_SITE_1"
},
{
"name": "NAME_OF_HERITAGE_SITE_2",
"latitude": LATITUDE_OF_SITE_2,
"longitude": LONGITUDE_OF_SITE_2,
"description": "BRIEF_DESCRIPTION_OF_SITE_2"
}
// Add more heritage site objects as needed
]
}
Replace YOUR_LATITUDE and YOUR_LONGITUDE with the coordinates of your current location. If there are no heritage sites within a reasonable distance, return an empty array for the "heritage_sites" key.
For each heritage site identified, provide the following information:
name: The official name or commonly known name of the heritage site.
latitude: The latitude coordinate of the heritage site's location.
longitude: The longitude coordinate of the heritage site's location.
description: A brief description (1-2 sentences) about the heritage site's significance or historical importance.
Please ensure that the response strictly follows the specified JSON format, and do not include any additional information or commentary outside of the requested data.

Here are the coordinates: Latitude: ${latitude}, Longitude: ${longitude}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        const jsonResponse = JSON.parse(text);
        return jsonResponse;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

module.exports = runGeminiAI;