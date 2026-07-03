const { GoogleGenerativeAI } = require('@google/generative-ai');

// Color compatibility maps for rule-based fallback
const COLOR_MATCHES = {
  black: ['white', 'grey', 'red', 'yellow', 'blue', 'pink', 'cream', 'beige'],
  white: ['black', 'jeans', 'grey', 'navy', 'olive', 'beige', 'maroon', 'rose'],
  grey: ['black', 'white', 'navy', 'pink', 'red', 'blue'],
  navy: ['white', 'grey', 'beige', 'cream', 'tan', 'maroon', 'olive'],
  beige: ['navy', 'white', 'black', 'olive', 'maroon'],
  cream: ['navy', 'black', 'maroon', 'olive', 'brown'],
  olive: ['black', 'white', 'cream', 'beige', 'navy'],
  red: ['black', 'white', 'grey', 'navy'],
  pink: ['grey', 'white', 'navy', 'black'],
  blue: ['black', 'white', 'grey', 'beige', 'cream'],
  yellow: ['black', 'grey', 'navy', 'white'],
};

// Simple helper to match colors in fallback
const areColorsCompatible = (color1, color2) => {
  const c1 = color1.toLowerCase();
  const c2 = color2.toLowerCase();
  if (c1 === c2) return true; // Monochrome
  if (COLOR_MATCHES[c1] && COLOR_MATCHES[c1].includes(c2)) return true;
  if (COLOR_MATCHES[c2] && COLOR_MATCHES[c2].includes(c1)) return true;
  return false;
};

// Modular core for calling AI services
const callAIService = async (prompt, systemInstruction = '') => {
  // Gemini Provider
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const fullPrompt = systemInstruction 
        ? `${systemInstruction}\n\nUser Request: ${prompt}`
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Gemini API Error, falling back to rule-based logic:', error.message);
    }
  }

  // OpenAI Provider Setup (Placeholder for future easy replacement)
  /*
  if (process.env.OPENAI_API_KEY) {
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const completion = await openai.chat.completions.create({ ... });
    // return JSON.parse(completion.choices[0].message.content);
  }
  */

  return null;
};

// 1. RECOMMEND OUTFIT
const recommendOutfit = async (clothes, weather, occasion, mood, season) => {
  const condensedClothes = clothes.map(c => ({
    id: c._id.toString(),
    name: c.name,
    category: c.category,
    color: c.color,
    season: c.season,
    occasion: c.occasion,
    brand: c.brand,
  }));

  const systemInstruction = `You are StyleSphere AI, an expert fashion stylist.
Your task is to recommend a stylish outfit from the user's wardrobe list.
You must return your response in JSON format matching the schema:
{
  "outfitIds": ["string (clothing ID)"],
  "reasoning": "detailed explanation of why this outfit was selected based on weather, occasion, and mood",
  "colorAccessories": "suggestions on matching colors and accessory items to complete this look"
}
Ensure the outfit has a logical combination (e.g. Top wear like Shirt/T-Shirt and Bottom wear like Jeans/Pants, or a single Dress, plus optional Shoes/Accessories). Do not suggest duplicate topwear.`;

  const prompt = `Wardrobe items: ${JSON.stringify(condensedClothes)}
Current Weather: ${JSON.stringify(weather)}
Occasion: ${occasion}
Mood: ${mood}
Season: ${season}`;

  const aiResult = await callAIService(prompt, systemInstruction);
  if (aiResult) return aiResult;

  // RULE-BASED FALLBACK
  // Filter clothes by season, occasion
  const available = clothes.filter(c => c.laundryStatus === 'Clean' && !c.isArchived);
  
  // Find top wear
  const tops = available.filter(c => ['Shirts', 'T-Shirts', 'Hoodies', 'Jackets', 'Kurti'].includes(c.category));
  // Find bottom wear
  const bottoms = available.filter(c => ['Jeans', 'Pants'].includes(c.category));
  // Find one-piece
  const dresses = available.filter(c => ['Dresses', 'Saree'].includes(c.category));
  // Find shoes
  const shoes = available.filter(c => c.category === 'Shoes');
  // Find accessories
  const accessories = available.filter(c => ['Accessories', 'Watches', 'Bags'].includes(c.category));

  let outfitItems = [];
  let reasonParts = [];

  // Pick top and bottom, or a dress
  if (dresses.length > 0 && (occasion === 'Party' || occasion === 'Wedding' || Math.random() > 0.6)) {
    const dress = dresses[Math.floor(Math.random() * dresses.length)];
    outfitItems.push(dress);
    reasonParts.push(`Selected the elegant ${dress.color} ${dress.name} which matches the ${occasion} setting perfectly.`);
  } else if (tops.length > 0 && bottoms.length > 0) {
    // Find compatible top and bottom
    let selectedTop = tops[0];
    let selectedBottom = bottoms[0];
    let foundMatch = false;

    for (const t of tops) {
      for (const b of bottoms) {
        if (areColorsCompatible(t.color, b.color)) {
          selectedTop = t;
          selectedBottom = b;
          foundMatch = true;
          break;
        }
      }
      if (foundMatch) break;
    }

    outfitItems.push(selectedTop, selectedBottom);
    reasonParts.push(`Paired the ${selectedTop.color} ${selectedTop.name} with ${selectedBottom.color} ${selectedBottom.name} for a balanced, color-coordinated look.`);
  } else if (tops.length > 0) {
    outfitItems.push(tops[0]);
    reasonParts.push(`Selected ${tops[0].name} for your top wear.`);
  }

  // Add shoes if available
  if (shoes.length > 0 && outfitItems.length > 0) {
    const pair = shoes[Math.floor(Math.random() * shoes.length)];
    outfitItems.push(pair);
    reasonParts.push(`Completed the look with ${pair.name} shoes.`);
  }

  // Add accessory
  let suggestedAcc = 'silver watch or a minimalist leather bag';
  if (accessories.length > 0) {
    const acc = accessories[Math.floor(Math.random() * accessories.length)];
    outfitItems.push(acc);
    suggestedAcc = `${acc.color} ${acc.name}`;
  }

  // Weather-specific additions to reason
  if (weather && weather.temp < 15) {
    reasonParts.push('Recommended layering since the weather is cold.');
  } else if (weather && weather.isRain) {
    reasonParts.push('Remember to grab an umbrella or raincoat as rain is active.');
  }

  return {
    outfitIds: outfitItems.map(i => i._id.toString()),
    reasoning: reasonParts.join(' ') || 'Compiled a comfortable, clean outfit based on your available wardrobe items.',
    colorAccessories: `Accessorize this with a ${suggestedAcc}. Complementary accents would look great.`,
  };
};

// 2. CHATBOT ASSISTANT
const askFashionAssistant = async (clothes, chatHistory, userMessage) => {
  const summary = clothes.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const systemInstruction = `You are StyleSphere AI, a friendly, professional virtual wardrobe stylist.
The user has a digital wardrobe containing: ${JSON.stringify(summary)} items.
Your job is to answer fashion questions, suggest styling rules, suggest color pairings, or give matching advice.
You must return your response in JSON format matching the schema:
{
  "reply": "your direct conversational reply text",
  "recommendedOutfitIds": ["optional list of clothing IDs if you recommended specific clothes from their closet"]
}
Keep your tone encouraging and helpful. Reference the user's wardrobe if relevant.`;

  const prompt = `Chat History: ${JSON.stringify(chatHistory)}
User Message: ${userMessage}
Available clothes detailed: ${JSON.stringify(clothes.map(c => ({ id: c._id, name: c.name, category: c.category, color: c.color, occasion: c.occasion })))}`;

  const aiResult = await callAIService(prompt, systemInstruction);
  if (aiResult) return aiResult;

  // RULE-BASED FALLBACK
  let reply = '';
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('college') || msg.includes('university')) {
    reply = "For college, comfort and style go hand-in-hand. I recommend pairing a casual T-Shirt or a light Shirt with denim Jeans or comfortable pants. Complete this with sneakers and a backpack.";
  } else if (msg.includes('interview') || msg.includes('job') || msg.includes('formal')) {
    reply = "For an interview or formal event, a well-ironed formal Shirt (in neutral colors like White or Light Blue) paired with dark trousers or pants is ideal. Keep accessories minimal (e.g. a classic watch).";
  } else if (msg.includes('wedding') || msg.includes('marriage') || msg.includes('party')) {
    reply = "For weddings or parties, don't be afraid of bold and rich colors! A Saree, a beautiful Kurti, or a premium shirt and trouser pair works wonderfully. Add a statement watch or elegant accessories.";
  } else if (msg.includes('color') || msg.includes('match') || msg.includes('pair')) {
    reply = "A great general styling rule for colors is pairing neutrals (like black, white, grey, beige) with a single pop of color (like red, navy, or olive). Neutral-on-neutral is also a very clean and premium look.";
  } else {
    reply = "That's a great styling question! In general, focus on fit, comfort, and choosing fabrics that suit the current weather (e.g., breathable cotton for summers, cozy fleece/wool for winters). Let me know if you want me to recommend a specific outfit from your wardrobe!";
  }

  return {
    reply,
    recommendedOutfitIds: []
  };
};

// 3. TRAVEL PACKING CHECKLIST
const generateTravelChecklist = async (destination, days, weather, occasion, clothes) => {
  const categories = clothes.map(c => ({ id: c._id.toString(), category: c.category, name: c.name, color: c.color }));

  const systemInstruction = `You are StyleSphere AI, a packing specialist.
Generate a comprehensive packing checklist for a trip.
You must return your response in JSON format matching the schema:
{
  "summary": "description of the destination weather and packing strategy",
  "packingList": [
    {
      "category": "clothing category (e.g. Shirts)",
      "quantity": 3,
      "recommendedClotheIds": ["optional list of matched clothing IDs from their wardrobe"]
    }
  ]
}
Design the checklist to cover the number of days specified.`;

  const prompt = `Destination: ${destination}
Duration: ${days} days
Expected Weather: ${weather}
Trip Occasion: ${occasion}
User's Wardrobe options: ${JSON.stringify(categories)}`;

  const aiResult = await callAIService(prompt, systemInstruction);
  if (aiResult) return aiResult;

  // RULE-BASED FALLBACK
  const packingList = [
    { category: 'Shirts', quantity: Math.max(1, Math.ceil(days / 2)), recommendedClotheIds: [] },
    { category: 'T-Shirts', quantity: Math.max(1, Math.ceil(days / 2)), recommendedClotheIds: [] },
    { category: 'Jeans', quantity: Math.max(1, Math.ceil(days / 4)), recommendedClotheIds: [] },
    { category: 'Pants', quantity: Math.max(1, Math.ceil(days / 4)), recommendedClotheIds: [] },
    { category: 'Shoes', quantity: 2, recommendedClotheIds: [] },
    { category: 'Accessories', quantity: 3, recommendedClotheIds: [] }
  ];

  // Try to recommend specific wardrobe items matching categories
  for (const item of packingList) {
    const matched = clothes.filter(c => c.category === item.category && c.laundryStatus === 'Clean');
    if (matched.length > 0) {
      item.recommendedClotheIds = matched.slice(0, item.quantity).map(c => c._id.toString());
    }
  }

  return {
    summary: `Packing strategy for a ${days}-day trip to ${destination} with ${weather} weather for a ${occasion} event. Highly recommended to carry light layers.`,
    packingList
  };
};

module.exports = {
  recommendOutfit,
  askFashionAssistant,
  generateTravelChecklist,
};
