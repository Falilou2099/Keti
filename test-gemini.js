const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiConnection() {
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyApLYcMhx3U5VrYjzAW4-99VRidHfaofDE";
  
  console.log("🔍 Test de connexion à l'API Gemini...\n");
  console.log("Clé API:", apiKey.substring(0, 10) + "...");
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Tester différents modèles
    const modelsToTest = [
      "gemini-pro",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
      "models/gemini-1.5-flash",
      "models/gemini-1.5-pro"
    ];
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`\n📝 Test du modèle: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} fonctionne!`);
        console.log(`   Réponse: ${text.substring(0, 50)}...`);
      } catch (error) {
        console.log(`❌ ${modelName} ne fonctionne pas`);
        console.log(`   Erreur: ${error.message.substring(0, 100)}`);
      }
    }
    
  } catch (error) {
    console.error("❌ Erreur de connexion:", error.message);
  }
}

testGeminiConnection();
