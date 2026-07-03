const TravelPlan = require('../models/TravelPlan');
const Clothe = require('../models/Clothe');
const { generateTravelChecklist } = require('../services/aiAssistant');

// Get all travel plans
exports.getTravelPlans = async (req, res) => {
  try {
    const plans = await TravelPlan.find({ user: req.user.id })
      .populate('items.clothe')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a travel plan and generate checklist
exports.createTravelPlan = async (req, res) => {
  try {
    const { destination, startDate, endDate, weather, occasion } = req.body;

    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide destination, start date, and end date' });
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Retrieve user's clothes to map recommendations
    const clothes = await Clothe.find({ user: req.user.id, isArchived: false });

    // Call AI to generate travel checklist
    const aiChecklist = await generateTravelChecklist(destination, days, weather || 'Mild', occasion || 'Vacation', clothes);

    // Format items into TravelPlan subdocument structure
    const planItems = [];
    
    for (const group of aiChecklist.packingList) {
      if (group.recommendedClotheIds && group.recommendedClotheIds.length > 0) {
        // Create an item entry for each recommended piece
        for (const clotheId of group.recommendedClotheIds) {
          planItems.push({
            category: group.category,
            clothe: clotheId,
            packed: false
          });
        }
      } else {
        // If no matching clothes, create generic placeholder entries
        for (let i = 0; i < group.quantity; i++) {
          planItems.push({
            category: group.category,
            customItemName: `Generic ${group.category} item`,
            packed: false
          });
        }
      }
    }

    const plan = await TravelPlan.create({
      user: req.user.id,
      destination,
      startDate,
      endDate,
      days,
      weather: weather || 'Moderate',
      occasion: occasion || 'Vacation',
      items: planItems,
      checklistGenerated: true,
    });

    const populatedPlan = await TravelPlan.findById(plan._id).populate('items.clothe');

    res.status(201).json({
      success: true,
      message: 'Travel packing list generated successfully',
      data: populatedPlan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle packed status on a travel item
exports.togglePackItem = async (req, res) => {
  try {
    const { planId, itemId } = req.params;

    const plan = await TravelPlan.findOne({ _id: planId, user: req.user.id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Travel plan not found' });
    }

    const item = plan.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Packing item not found in this plan' });
    }

    item.packed = !item.packed;
    await plan.save();

    const populatedPlan = await TravelPlan.findById(planId).populate('items.clothe');

    res.status(200).json({ success: true, data: populatedPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete travel plan
exports.deleteTravelPlan = async (req, res) => {
  try {
    const plan = await TravelPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Travel plan not found' });
    }

    res.status(200).json({ success: true, message: 'Travel plan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
