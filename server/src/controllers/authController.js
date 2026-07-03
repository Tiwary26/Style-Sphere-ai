const User = require('../models/User');
const crypto = require('crypto');

// Helper to award badges
const awardBadgeIfEarned = (user, badgeName, badgeDesc, badgeIcon) => {
  const hasBadge = user.badges.some(b => b.name === badgeName);
  if (!hasBadge) {
    user.badges.push({ name: badgeName, description: badgeDesc, icon: badgeIcon });
    return true;
  }
  return false;
};

// Register User
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user
    user = await User.create({
      username,
      email,
      password,
      verificationToken,
      isVerified: true, // Defaulting to true for demo convenience, but architecture is ready
    });

    // Award welcome badge
    awardBadgeIfEarned(user, 'Fashion Novice', 'Started the journey on StyleSphere AI', 'sparkles');
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Manage Streaks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.streak.lastActiveDate) {
      const lastActive = new Date(user.streak.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active on consecutive day
        user.streak.count += 1;
        // Award streak badges
        if (user.streak.count >= 3) {
          awardBadgeIfEarned(user, 'Consistent Stylist', 'Logged in 3 days in a row', 'flame');
        }
      } else if (diffDays > 1) {
        // Broken streak
        user.streak.count = 1;
      }
    } else {
      user.streak.count = 1;
    }
    user.streak.lastActiveDate = new Date();
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Google Login Mock / Integration ready
exports.googleLogin = async (req, res) => {
  try {
    const { email, username, googleId, profileImage } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      user = await User.create({
        username: username || email.split('@')[0] + Math.floor(Math.random() * 100),
        email,
        password: crypto.randomBytes(8).toString('hex'), // Random password
        profileImage: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isVerified: true,
      });
      awardBadgeIfEarned(user, 'Google Connector', 'Logged in via Google Authentication', 'chrome');
      await user.save();
    }

    const token = user.getSignedJwtToken();
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password Mock (for demo)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to registered email address (simulation).',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password Mock (for demo)
exports.resetPassword = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated (simulation).',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {};
    if (req.body.username) fieldsToUpdate.username = req.body.username;
    if (req.body.profileImage) fieldsToUpdate.profileImage = req.body.profileImage;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
