require('dotenv').config(); // Load environment variables from .env file
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Access your API key from the environment variable
const genAI = new GoogleGenerativeAI('AIzaSyB6UQrCNNfrNKU70Amm-fFo--8eX1zZz_I');

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

async function run() {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You have been provided with an image. Please analyze the image and determine whether it depicts a plant or an animal. Based on your analysis, return the appropriate JSON object with the relevant information. You must provide data for every key in the JSON object, even if it's a general or approximate value.

    If the image shows a plant, return the following JSON object:

    {
      "uploaded_image": "URL_OF_THE_UPLOADED_IMAGE",
      "botanical_name": "BOTANICAL_NAME_OF_THE_PLANT",
      "historical_significance": "HISTORICAL_SIGNIFICANCE_OF_THE_PLANT",
      "cultural_significance": "CULTURAL_SIGNIFICANCE_OF_THE_PLANT",
      "uses": "COMMON_USES_OF_THE_PLANT",
      "fun_fact": "AN_INTERESTING_FUN_FACT_ABOUT_THE_PLANT"
    }

    If the image shows an animal, return the following JSON object:

    {
      "uploaded_image": "dvhdva",
      "name": "COMMON_NAME_OF_THE_ANIMAL",
      "habitat_country": "PRIMARY_HABITAT_OR_COUNTRY_WHERE_THE_ANIMAL_IS_MOSTLY_FOUND",
      "speciality": "A_UNIQUE_OR_SPECIAL_CHARACTERISTIC_OF_THE_ANIMAL",
      "cultural_significance": "CULTURAL_SIGNIFICANCE_OF_THE_ANIMAL",
      "fun_fact": "AN_INTERESTING_FUN_FACT_ABOUT_THE_ANIMAL"
    }

    You must provide some data for every key in the JSON object. If you cannot determine the specific information for a key, provide a general or approximate value. Do not leave any key empty.

    Please replace the placeholders (shown in uppercase) with the appropriate information based on your analysis of the image.
  `;

  // Ensure the path to the image file is correct
  const imagePart = fileToGenerativePart(path.join(__dirname, 'images', 'image1.jpeg'), 'image/jpeg');

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = await response.text();
    
    // Log the raw response text for debugging
    console.log("Raw Response:", text);

    // Parse and log the JSON response
    const jsonResponse = JSON.parse(text);
    console.log(JSON.stringify(jsonResponse, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
