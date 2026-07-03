const Laundry = require('../models/Laundry');
const Clothe = require('../models/Clothe');
const Notification = require('../models/Notification');
const { sendRealTimeNotification } = require('../services/socketService');

// Get laundry queue items
exports.getLaundryQueue = async (req, res) => {
  try {
    const queue = await Laundry.find({ user: req.user.id })
      .populate('clothe')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: queue.length,
      data: queue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to laundry or update status
exports.updateLaundryStatus = async (req, res) => {
  try {
    const { clotheId, status, notes } = req.body;

    if (!clotheId || !status) {
      return res.status(400).json({ success: false, message: 'Please provide clotheId and status' });
    }

    // 1. Verify and update clothing item status
    const clothe = await Clothe.findOne({ _id: clotheId, user: req.user.id });
    if (!clothe) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }

    clothe.laundryStatus = status;
    await clothe.save();

    // 2. Manage laundry log entry
    let log = await Laundry.findOne({ clothe: clotheId, user: req.user.id });
    if (!log) {
      log = new Laundry({
        user: req.user.id,
        clothe: clotheId,
      });
    }

    log.status = status;
    if (notes) log.notes = notes;
    await log.save();

    // 3. Clean up queue if item is fully clean/ready to wear
    if (status === 'Clean' || status === 'Ready To Wear') {
      await Laundry.deleteOne({ clothe: clotheId, user: req.user.id });
    }

    // 4. Send real-time socket updates
    sendRealTimeNotification(req.user.id, 'laundry_update', {
      clotheId: clothe._id,
      name: clothe.name,
      status,
    });

    res.status(200).json({
      success: true,
      message: `Laundry status updated to ${status}`,
      data: log,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add laundry reminder
exports.addLaundryReminder = async (req, res) => {
  try {
    const { clotheId, reminderDate, notes } = req.body;

    if (!clotheId || !reminderDate) {
      return res.status(400).json({ success: false, message: 'Please provide clotheId and reminder date' });
    }

    const clothe = await Clothe.findOne({ _id: clotheId, user: req.user.id });
    if (!clothe) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }

    // Create laundry record with reminderDate
    let log = await Laundry.findOne({ clothe: clotheId, user: req.user.id });
    if (!log) {
      log = new Laundry({
        user: req.user.id,
        clothe: clotheId,
        status: clothe.laundryStatus || 'Dirty',
      });
    }

    log.reminderDate = reminderDate;
    if (notes) log.notes = notes;
    await log.save();

    // Create Notification document
    const notification = await Notification.create({
      user: req.user.id,
      title: 'Laundry Reminder Set',
      message: `Reminder scheduled for cleaning your "${clothe.name}" on ${new Date(reminderDate).toLocaleDateString()}`,
      type: 'laundry',
    });

    // Setup an in-memory setTimeout trigger for real-time alert (for active sessions)
    const delay = new Date(reminderDate) - new Date();
    if (delay > 0) {
      setTimeout(() => {
        sendRealTimeNotification(req.user.id, 'notification', {
          title: 'Laundry Alert!',
          message: `It is time to clean or iron your "${clothe.name}".`,
          type: 'laundry',
        });
      }, Math.min(delay, 2147483647)); // Limit max delay to 32-bit int
    }

    res.status(201).json({
      success: true,
      message: 'Laundry reminder scheduled successfully',
      data: log,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
