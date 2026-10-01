const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const products = [
  {
    name: 'iPhone 15 Pro',
    description:
      'The most pro iPhone ever. Featuring a titanium design, A17 Pro chip, and a customizable Action button. The 48MP Main camera captures stunning photos with 4K video.',
    price: 134900,
    originalPrice: 139900,
    category: 'Electronics',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592286927505-1def25115558?w=600&auto=format&fit=crop',
    ],
    stock: 25,
    rating: 4.8,
    numReviews: 128,
    tags: ['smartphone', 'apple', 'premium'],
    isFeatured: true,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description:
      'Galaxy AI is here. Packed with a 200MP camera, built-in S Pen, and the most powerful Galaxy processor ever. Experience next-level mobile intelligence.',
    price: 124999,
    originalPrice: 134999,
    category: 'Electronics',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop',
    ],
    stock: 18,
    rating: 4.7,
    numReviews: 96,
    tags: ['smartphone', 'samsung', 'android'],
    isFeatured: true,
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description:
      'Industry-leading noise canceling with Auto NC Optimizer. Crystal clear hands-free calling with 8 microphones. Up to 30 hours battery life with quick charging.',
    price: 29990,
    originalPrice: 34990,
    category: 'Electronics',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&auto=format&fit=crop',
    ],
    stock: 40,
    rating: 4.9,
    numReviews: 210,
    tags: ['headphones', 'audio', 'wireless'],
    isFeatured: true,
  },
  {
    name: 'MacBook Air M3',
    description:
      'Supercharged by M3. Strikingly thin with an 18-hour battery. The 13.6-inch Liquid Retina display with true-to-life color. Fanless design runs silently.',
    price: 114900,
    originalPrice: 119900,
    category: 'Electronics',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop',
    ],
    stock: 12,
    rating: 4.9,
    numReviews: 185,
    tags: ['laptop', 'apple', 'premium'],
    isFeatured: true,
  },
  {
    name: 'Nike Air Max 270',
    description:
      'The Nike Air Max 270 delivers visible heel cushioning for all-day comfort. The large Air unit provides lightweight cushioning with a bold look that stands out.',
    price: 10995,
    originalPrice: 12995,
    category: 'Footwear',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    ],
    stock: 55,
    rating: 4.5,
    numReviews: 320,
    tags: ['shoes', 'nike', 'sports'],
    isFeatured: true,
  },
  {
    name: 'Levi\'s 511 Slim Fit Jeans',
    description:
      'A modern take on our iconic jeans. The 511 Slim Fit sits below the waist and is slim through the thigh and leg with a narrow leg opening. Made with stretch denim.',
    price: 2999,
    originalPrice: 3999,
    category: 'Clothing',
    brand: 'Levi\'s',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop',
    ],
    stock: 80,
    rating: 4.3,
    numReviews: 445,
    tags: ['jeans', 'clothing', 'casual'],
    isFeatured: false,
  },
  {
    name: 'Kindle Paperwhite (16GB)',
    description:
      'The thinnest, lightest Kindle Paperwhite ever. Waterproof with a flush-front display and 300 ppi glare-free display. Read in bright sunlight or under the covers.',
    price: 16999,
    originalPrice: 19999,
    category: 'Electronics',
    brand: 'Amazon',
    image: 'https://images.unsplash.com/photo-1584378136636-851eebe1aa5a?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584378136636-851eebe1aa5a?w=600&auto=format&fit=crop',
    ],
    stock: 30,
    rating: 4.6,
    numReviews: 890,
    tags: ['ereader', 'books', 'kindle'],
    isFeatured: false,
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description:
      'The Instant Pot Duo is a 7-in-1 multi-cooker that combines the functions of a pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and food warmer.',
    price: 6999,
    originalPrice: 9999,
    category: 'Kitchen',
    brand: 'Instant Pot',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop',
    ],
    stock: 22,
    rating: 4.7,
    numReviews: 1250,
    tags: ['kitchen', 'cooking', 'appliance'],
    isFeatured: false,
  },
  {
    name: 'Adidas Ultraboost 22',
    description:
      'Experience incredible energy return with every stride. The Ultraboost 22 features a Boost midsole and Primeknit upper that adapts to your foot. Perfect for long runs.',
    price: 12999,
    originalPrice: 15999,
    category: 'Footwear',
    brand: 'Adidas',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop',
    ],
    stock: 45,
    rating: 4.6,
    numReviews: 278,
    tags: ['shoes', 'adidas', 'running'],
    isFeatured: true,
  },
  {
    name: 'The North Face Thermoball Jacket',
    description:
      'Lightweight, packable warmth. ThermoBall Eco insulation clusters mimic the loft and warmth of down. Ideal for layering or wearing as an outer layer.',
    price: 14999,
    originalPrice: 18999,
    category: 'Clothing',
    brand: 'The North Face',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&auto=format&fit=crop',
    ],
    stock: 35,
    rating: 4.4,
    numReviews: 167,
    tags: ['jacket', 'outdoor', 'winter'],
    isFeatured: false,
  },
  {
    name: 'Apple Watch Series 9',
    description:
      'Apple Watch Series 9 with the new S9 chip. Double Tap gesture, brighter Always-On display, and enhanced health features including blood oxygen monitoring.',
    price: 41900,
    originalPrice: 44900,
    category: 'Electronics',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop',
    ],
    stock: 20,
    rating: 4.8,
    numReviews: 342,
    tags: ['smartwatch', 'apple', 'wearable'],
    isFeatured: true,
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    description:
      'Laser reveals microscopic dust you cannot see. Piezo sensor counts and sizes particles in real-time. Powerful suction with up to 60 minutes of cordless runtime.',
    price: 54990,
    originalPrice: 62990,
    category: 'Home',
    brand: 'Dyson',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
    ],
    stock: 15,
    rating: 4.7,
    numReviews: 89,
    tags: ['vacuum', 'home', 'cleaning'],
    isFeatured: false,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${createdProducts.length} products successfully!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedProducts();
