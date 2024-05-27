require('dotenv').config(); // Load environment variables from .env file
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key from the environment variable
const genAI = new GoogleGenerativeAI('AIzaSyB6UQrCNNfrNKU70Amm-fFo--8eX1zZz_I');

async function runGeminiAILocation(latitude, longitude) {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `just written this :
    {
      name: 'Bhojpur Temple',
      latitude: 23.2676,
      longitude: 77.4204,
      description: 'An ancient Hindu temple dedicated to Lord Shiva, built by Raja Bhoj, a Paramara king, in the 11th century. The temple complex is known for its beautiful architecture and intricate carvings.'
    },
    {
      name: 'Taj-ul-Masjid',
      latitude: 23.263,
      longitude: 77.393,
      description: 'One of the largest mosques in India, built in the 19th century. The mosque is known for its grand architecture and its intricate carvings.'
    },
    {
      name: 'Sanchi Stupa',
      latitude: 23.4893,
      longitude: 77.6880,
      description: 'A UNESCO World Heritage Site, consisting of a group of ancient Buddhist monuments, built by Emperor Ashoka in the 3rd century BCE. The stupas are known for their intricate carvings and their historical significance.'
    },
    {
      name: 'Bharat Bhavan',
      latitude: 23.2539,
      longitude: 77.4121,
      description: 'A cultural center, showcasing the art and culture of India. It is home to a museum, an art gallery, and a theater.'
    },
    {
      name: 'Upper Lake',
      latitude: 23.2627,
      longitude: 77.4131,
      description: 'A scenic artificial lake in the heart of Bhopal, surrounded by hills. It is a popular destination for boating and picnicking.'
    },
    {
      name: 'Lower Lake',
      latitude: 23.2487,
      longitude: 77.4066,
      description: 'Another scenic artificial lake in Bhopal, known for its beautiful sunsets. It is a popular spot for evening walks.'
    },
    {
      name: 'Rani Kamalapati Railway Station',
      latitude: 23.2636,
      longitude: 77.4188,
      description: 'The main railway station in Bhopal, known for its beautiful architecture. It is a great place to experience the local culture.'
    }`;

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