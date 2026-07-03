const { askFashionAssistant } = require('../services/aiAssistant');
const Clothe = require('../models/Clothe');

// Post user query to AI Fashion Assistant
exports.askAssistant = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    // Retrieve user's clothes to provide context to the AI model
    const clothes = await Clothe.find({ user: req.user.id, isArchived: false });

    // Query assistant (integrates Gemini with rule-based fallback)
    const response = await askFashionAssistant(clothes, chatHistory || [], message);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
