const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const User = require('../models/User');
const Clothe = require('../models/Clothe');
const Outfit = require('../models/Outfit');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stylesphere');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Clothe.deleteMany();
    await Outfit.deleteMany();
    console.log('Cleared existing collections...');

    // 1. Create Default User
    const user = await User.create({
      username: 'AlexStyles',
      email: 'alex@stylesphere.com',
      password: 'password123', // Will be hashed automatically by pre-save middleware
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isVerified: true,
      streak: { count: 3, lastActiveDate: new Date() },
      badges: [
        { name: 'Fashion Novice', description: 'Started the journey on StyleSphere AI', icon: 'sparkles' },
        { name: 'Consistent Stylist', description: 'Logged in 3 days in a row', icon: 'flame' }
      ]
    });
    console.log(`Default User created: ${user.email} (password: password123)`);

    // 2. Create Clothes Dataset
    const clothesData = [
      {
        user: user._id,
        name: 'White Oxford Button-Down',
        category: 'Shirts',
        color: 'White',
        brand: 'Ralph Lauren',
        size: 'M',
        fabric: 'Cotton',
        season: 'All-Season',
        occasion: 'Formal',
        price: 85,
        laundryStatus: 'Clean',
        timesWorn: 12,
        imageUrls: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300'],
        notes: 'Classic crisp formal shirt. Fits perfectly.'
      },
      {
        user: user._id,
        name: 'Classic Navy Blue Crewneck',
        category: 'T-Shirts',
        color: 'Navy',
        brand: 'Uniqlo',
        size: 'M',
        fabric: 'Cotton Blend',
        season: 'Summer',
        occasion: 'Casual',
        price: 20,
        laundryStatus: 'Clean',
        timesWorn: 24,
        imageUrls: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300'],
        notes: 'Comfortable casual tee.'
      },
      {
        user: user._id,
        name: 'Slim Fit Dark Wash Jeans',
        category: 'Jeans',
        color: 'Blue',
        brand: 'Levi\'s 511',
        size: '32',
        fabric: 'Denim',
        season: 'All-Season',
        occasion: 'Casual',
        price: 70,
        laundryStatus: 'Clean',
        timesWorn: 30,
        imageUrls: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=300'],
        notes: 'Go-to everyday jeans.'
      },
      {
        user: user._id,
        name: 'Beige Relaxed Chino Pants',
        category: 'Pants',
        color: 'Beige',
        brand: 'Dockers',
        size: '32',
        fabric: 'Cotton Twill',
        season: 'All-Season',
        occasion: 'Casual',
        price: 60,
        laundryStatus: 'Clean',
        timesWorn: 8,
        imageUrls: ['https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=300'],
        notes: 'Versatile smart-casual trousers.'
      },
      {
        user: user._id,
        name: 'Black Leather Jacket',
        category: 'Jackets',
        color: 'Black',
        brand: 'Zara',
        size: 'L',
        fabric: 'Leather',
        season: 'Winter',
        occasion: 'Party',
        price: 150,
        laundryStatus: 'Clean',
        timesWorn: 4,
        imageUrls: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300'],
        notes: 'Adds an edge to any outfit. Dry clean only.'
      },
      {
        user: user._id,
        name: 'Grey Pullover Hoodie',
        category: 'Hoodies',
        color: 'Grey',
        brand: 'Champion',
        size: 'M',
        fabric: 'Fleece',
        season: 'Winter',
        occasion: 'Sports',
        price: 55,
        laundryStatus: 'Dirty',
        timesWorn: 18,
        imageUrls: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300'],
        notes: 'Cozy hoodie for weekends.'
      },
      {
        user: user._id,
        name: 'Minimalist White Sneakers',
        category: 'Shoes',
        color: 'White',
        brand: 'Common Projects',
        size: '42',
        fabric: 'Leather',
        season: 'All-Season',
        occasion: 'Casual',
        price: 220,
        laundryStatus: 'Clean',
        timesWorn: 15,
        imageUrls: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300'],
        notes: 'Clean leather sneakers. Avoid mud.'
      },
      {
        user: user._id,
        name: 'Classic Chronograph Watch',
        category: 'Watches',
        color: 'Silver',
        brand: 'Seiko',
        size: 'One Size',
        fabric: 'Steel',
        season: 'All-Season',
        occasion: 'Formal',
        price: 300,
        laundryStatus: 'Clean',
        timesWorn: 40,
        imageUrls: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300'],
        notes: 'Elegant metal watch.'
      }
    ];

    const clothes = [];
    for (const item of clothesData) {
      const c = new Clothe(item);
      c.qrCode = `stylesphere://clothe/${c._id}`;
      await c.save();
      clothes.push(c);
    }
    console.log(`Seeded ${clothes.length} clothes items...`);

    // 3. Create Default Outfit
    const whiteShirt = clothes.find(c => c.name === 'White Oxford Button-Down');
    const beigeChino = clothes.find(c => c.name === 'Beige Relaxed Chino Pants');
    const sneakers = clothes.find(c => c.name === 'Minimalist White Sneakers');

    const outfit = await Outfit.create({
      user: user._id,
      name: 'Smart-Casual White & Beige',
      clothes: [whiteShirt._id, beigeChino._id, sneakers._id],
      season: 'Spring',
      occasion: 'Interview',
      mood: 'Confident',
      timesWorn: 3,
      imageUrl: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=300'
    });
    console.log(`Seeded default outfit: ${outfit.name}`);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
