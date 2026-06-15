const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const Review = require("../models/Review");
const Offer = require("../models/Offer");
const Order = require("../models/Order");

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ofds";

const users = [
  {
    name: "System Admin",
    email: "admin@gmail.com",
    password: "password123",
    role: "admin",
  },
  {
    name: "Mario Rossi",
    email: "owner1@gmail.com",
    password: "password123",
    role: "restaurant_owner",
  },
  {
    name: "Luigi Verdi",
    email: "owner2@gmail.com",
    password: "password123",
    role: "restaurant_owner",
  },
  {
    name: "Gordon Ramsay",
    email: "owner3@gmail.com",
    password: "password123",
    role: "restaurant_owner",
  },
  {
    name: "John Customer",
    email: "customer1@gmail.com",
    password: "password123",
    role: "customer",
  },
  {
    name: "Jane Shopper",
    email: "customer2@gmail.com",
    password: "password123",
    role: "customer",
  },
  {
    name: "Bob Buyer",
    email: "customer3@gmail.com",
    password: "password123",
    role: "customer",
  },
  {
    name: "Alice Eater",
    email: "customer4@gmail.com",
    password: "password123",
    role: "customer",
  },
  {
    name: "Charlie Diner",
    email: "customer5@gmail.com",
    password: "password123",
    role: "customer",
  },
];

const seedData = async () => {
  try {
    console.log("📌 Using MONGODB_URI:", MONGODB_URI);
    console.log("📌 Database name from URI:", new URL(MONGODB_URI).pathname);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });
    console.log("Connected to Database for seeding...");

    // Clear existing data
    await User.deleteMany();
    await Restaurant.deleteMany();
    await MenuItem.deleteMany();
    await Review.deleteMany();
    await Offer.deleteMany();
    await Order.deleteMany();
    console.log("Cleared existing data.");

    // Seed users
    const createdUsers = [];
    for (const u of users) {
      try {
        const newUser = new User(u);
        const savedUser = await newUser.save();
        createdUsers.push(savedUser);
      } catch (err) {
        console.error(`❌ Failed to save user ${u.email}:`, err.message);
      }
    }
    console.log(`✅ Seeded ${createdUsers.length} users.`);

    const owners = createdUsers.filter((u) => u.role === "restaurant_owner");
    const customers = createdUsers.filter((u) => u.role === "customer");

    // Seed Restaurants
    const restaurantsData = [
      {
        name: "Bella Italia",
        description: "Authentic Italian wood-fired pizzas, handmade pasta.",
        cuisine: ["Italian", "Pizza"],
        location: "123 Piazza Way",
        hours: { open: "11:00 AM", close: "11:00 PM" },
        imageUrl:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
        priceRange: "$$",
        rating: 4.8,
        reviewsCount: 1,
        owner: owners[0]._id,
        isAcceptingOrders: true,
      },
      {
        name: "Burger Bistro",
        description: "Premium craft burgers using 100% grass-fed beef.",
        cuisine: ["American", "Burgers"],
        location: "456 Patty Lane",
        hours: { open: "10:00 AM", close: "10:00 PM" },
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
        priceRange: "$",
        rating: 4.5,
        reviewsCount: 1,
        owner: owners[1]._id,
        isAcceptingOrders: true,
      },
      {
        name: "Wok & Roll",
        description: "Fresh sushi rolls and sizzling stir-fries.",
        cuisine: ["Asian", "Sushi"],
        location: "789 Bamboo Ave",
        hours: { open: "12:00 PM", close: "10:00 PM" },
        imageUrl:
          "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&auto=format&fit=crop&q=80",
        priceRange: "$$$",
        rating: 4.6,
        reviewsCount: 1,
        owner: owners[2]._id,
        isAcceptingOrders: true,
      },
      {
        name: "Gourmet Garden",
        description: "Healthy salad bowls and organic juices.",
        cuisine: ["Healthy", "Salads"],
        location: "101 Wellness Blvd",
        hours: { open: "08:00 AM", close: "08:00 PM" },
        imageUrl:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
        priceRange: "$$",
        rating: 4.7,
        reviewsCount: 1,
        owner: owners[0]._id,
        isAcceptingOrders: false,
      },
      {
        name: "Annachi Kadai",
        description: "Authentic Chettinad cuisine known for fiery curries.",
        cuisine: ["South Indian", "Chettinad"],
        location: "202 Spice Route",
        hours: { open: "11:00 AM", close: "11:30 PM" },
        imageUrl:
          "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&auto=format&fit=crop&q=80",
        priceRange: "$$",
        rating: 4.8,
        reviewsCount: 1,
        owner: owners[1]._id,
        isAcceptingOrders: true,
      },
      {
        name: "Adayar Tiffin Centre",
        description: "Traditional vegetarian South Indian meals.",
        cuisine: ["South Indian", "Tiffin"],
        location: "304 Morning Dew St",
        hours: { open: "06:00 AM", close: "09:00 PM" },
        imageUrl:
          "https://images.unsplash.com/photo-1610190179968-ebbbda043236?w=600&auto=format&fit=crop&q=80",
        priceRange: "$",
        rating: 4.9,
        reviewsCount: 1,
        owner: owners[2]._id,
        isAcceptingOrders: true,
      },
      {
        name: "Taco Fiesta",
        description: "Spicy tacos and authentic Mexican street food.",
        cuisine: ["Mexican", "Fast Food"],
        location: "111 Salsa St",
        hours: { open: "11:00 AM", close: "12:00 AM" },
        imageUrl:
          "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80",
        priceRange: "$",
        rating: 4.4,
        reviewsCount: 0,
        owner: owners[0]._id,
        isAcceptingOrders: true,
      },
      {
        name: "Le Petit Chef",
        description: "Fine French dining with an exquisite wine selection.",
        cuisine: ["French", "Fine Dining"],
        location: "888 Paris Blvd",
        hours: { open: "05:00 PM", close: "11:00 PM" },
        imageUrl:
          "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80",
        priceRange: "$$$$",
        rating: 4.9,
        reviewsCount: 0,
        owner: owners[1]._id,
        isAcceptingOrders: true,
      },
      {
        name: "Delhi Dhaba",
        description: "North Indian curries and tandoori specials.",
        cuisine: ["Indian", "Curry"],
        location: "444 Spice Ave",
        hours: { open: "12:00 PM", close: "11:00 PM" },
        imageUrl:
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
        priceRange: "$$",
        rating: 4.6,
        reviewsCount: 0,
        owner: owners[2]._id,
        isAcceptingOrders: true,
      },
      {
        name: "Midnight Munchies",
        description: "Late night cravings delivered fast.",
        cuisine: ["Fast Food", "Desserts"],
        location: "999 Moon Ln",
        hours: { open: "08:00 PM", close: "04:00 AM" },
        imageUrl:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
        priceRange: "$",
        rating: 4.2,
        reviewsCount: 0,
        owner: owners[0]._id,
        isAcceptingOrders: false,
      },
    ];

    const seededRestaurants = [];
    for (const r of restaurantsData) {
      try {
        r.isApproved = true; // Auto-approve seeded restaurants
        r.isActive = true;
        const rest = await Restaurant.create(r);
        seededRestaurants.push(rest);
      } catch (err) {
        console.error(`❌ Failed to save restaurant ${r.name}:`, err.message);
      }
    }
    console.log(`✅ Seeded ${seededRestaurants.length} restaurants.`);

    // MenuItem definitions
    const menuItems = [
      // Bella Italia Menu Items
      {
        restaurant: seededRestaurants[0]._id,
        name: "Margherita Pizza",
        description:
          "Fresh mozzarella, san marzano tomatoes, fresh basil, and extra virgin olive oil on wood-fired crust.",
        price: 14.99,
        category: "Pizzas",
        imageUrl:
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 850,
          protein: "34g",
          carbs: "98g",
          fat: "28g",
          allergens: ["Gluten", "Dairy"],
        },
      },
      {
        restaurant: seededRestaurants[0]._id,
        name: "Truffle Mushroom Fettuccine",
        description:
          "Handmade fettuccine pasta tossed in a rich, velvety black truffle cream sauce with wild mushrooms.",
        price: 18.99,
        category: "Pasta",
        imageUrl:
          "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 920,
          protein: "18g",
          carbs: "84g",
          fat: "42g",
          allergens: ["Gluten", "Dairy"],
        },
      },
      {
        restaurant: seededRestaurants[0]._id,
        name: "Tiramisu",
        description:
          "Classic Italian dessert with layers of coffee-soaked ladyfingers, creamy mascarpone, and cocoa powder.",
        price: 7.99,
        category: "Desserts",
        imageUrl:
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 450,
          protein: "6g",
          carbs: "48g",
          fat: "24g",
          allergens: ["Dairy", "Eggs", "Gluten"],
        },
      },

      // Burger Bistro Menu Items
      {
        restaurant: seededRestaurants[1]._id,
        name: "The Bistro Bacon Cheeseburger",
        description:
          "Grass-fed beef patty, crispy applewood smoked bacon, sharp cheddar cheese, butter lettuce, tomato, and bistro secret sauce on brioche bun.",
        price: 12.99,
        category: "Burgers",
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 950,
          protein: "42g",
          carbs: "54g",
          fat: "58g",
          allergens: ["Gluten", "Dairy"],
        },
      },
      {
        restaurant: seededRestaurants[1]._id,
        name: "Truffle Parmesan Fries",
        description:
          "Crispy double-fried russet potatoes tossed in truffle oil, fresh herbs, and finely grated parmesan cheese.",
        price: 5.99,
        category: "Sides",
        imageUrl:
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 420,
          protein: "5g",
          carbs: "52g",
          fat: "22g",
          allergens: ["Dairy"],
        },
      },

      // Wok & Roll Menu Items
      {
        restaurant: seededRestaurants[2]._id,
        name: "Signature Dragon Roll",
        description:
          "Shrimp tempura and cucumber inside, topped with avocado, unagi (eel), unagi sauce, and toasted sesame seeds.",
        price: 15.99,
        category: "Sushi",
        imageUrl:
          "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 510,
          protein: "16g",
          carbs: "64g",
          fat: "14g",
          allergens: ["Seafood", "Gluten", "Sesame"],
        },
      },
      {
        restaurant: seededRestaurants[2]._id,
        name: "Spicy Dan Dan Noodles",
        description:
          "Sichuan wheat noodles in a fiery chili oil and sesame-peanut paste broth, topped with minced pork, bok choy, and crushed peanuts.",
        price: 13.99,
        category: "Noodles",
        imageUrl:
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 780,
          protein: "28g",
          carbs: "82g",
          fat: "30g",
          allergens: ["Gluten", "Peanuts", "Sesame"],
        },
      },

      // Gourmet Garden Menu Items
      {
        restaurant: seededRestaurants[3]._id,
        name: "Harvest Quinoa Bowl",
        description:
          "Organic quinoa, roasted sweet potatoes, kale, avocado, cherry tomatoes, pumpkin seeds, and tahini lemon dressing.",
        price: 11.99,
        category: "Salad Bowls",
        imageUrl:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 480,
          protein: "14g",
          carbs: "58g",
          fat: "22g",
          allergens: ["Sesame"],
        },
      },
      {
        restaurant: seededRestaurants[3]._id,
        name: "Super Green Juice",
        description:
          "Organic cold-pressed juice with cucumber, celery, green apple, kale, spinach, ginger, and lemon.",
        price: 6.99,
        category: "Juices",
        imageUrl:
          "https://images.unsplash.com/photo-1610970881699-44a5587caa90?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 120,
          protein: "2g",
          carbs: "26g",
          fat: "0g",
          allergens: [],
        },
      },

      // Annachi Kadai Menu Items
      {
        restaurant: seededRestaurants[4]._id,
        name: "Hyderabadi Dum Biryani (Chicken)",
        description:
          "Aromatic basmati rice cooked with marinated chicken, secret spices, and saffron, slow-cooked in a sealed pot.",
        price: 15.99,
        category: "Biryani",
        imageUrl:
          "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 850,
          protein: "45g",
          carbs: "75g",
          fat: "25g",
          allergens: ["Dairy"],
        },
      },
      {
        restaurant: seededRestaurants[4]._id,
        name: "Chettinad Chicken Curry",
        description:
          "Spicy, flavorful chicken curry made with roasted coriander seeds, red chillies, coconut, and fennel.",
        price: 13.99,
        category: "Main Course",
        imageUrl:
          "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 600,
          protein: "40g",
          carbs: "15g",
          fat: "35g",
          allergens: [],
        },
      },

      // Adayar Tiffin Centre Menu Items
      {
        restaurant: seededRestaurants[5]._id,
        name: "Crispy Ghee Roast Dosa",
        description:
          "Paper-thin, crispy crepe made from fermented rice and lentil batter, generously roasted with pure ghee. Served with sambar and 3 chutneys.",
        price: 7.99,
        category: "Breakfast",
        imageUrl:
          "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 420,
          protein: "12g",
          carbs: "60g",
          fat: "15g",
          allergens: ["Dairy"],
        },
      },
      {
        restaurant: seededRestaurants[5]._id,
        name: "South Indian Thali (Meals)",
        description:
          "Traditional full-course meal served on a banana leaf including rice, sambar, rasam, kootu, poriyal, appalam, and payasam.",
        price: 11.99,
        category: "Meals",
        imageUrl:
          "https://images.unsplash.com/photo-1610190179968-ebbbda043236?w=500&auto=format&fit=crop&q=80",
        nutritionalInfo: {
          calories: 750,
          protein: "20g",
          carbs: "110g",
          fat: "18g",
          allergens: ["Dairy"],
        },
      },
    ];

    const createdMenuItems = [];
    for (const item of menuItems) {
      try {
        const createdItem = await MenuItem.create(item);
        createdMenuItems.push(createdItem);
      } catch (err) {
        console.error(`❌ Failed to save menu item ${item.name}:`, err.message);
      }
    }
    console.log(
      `✅ Seeded ${createdMenuItems.length} menu items successfully.`,
    );

    // Seed Reviews
    const reviewsData = [
      {
        user: customers[0]._id,
        userName: "John Doe",
        restaurant: seededRestaurants[0]._id,
        rating: 5,
        comment:
          "Absolutely spectacular Margherita! Crisp crust, rich tomato base, and super fresh mozzarella. Tastes just like Naples!",
        response:
          "Thank you John! We import our flour and tomatoes from Campania to ensure it tastes authentic. Hope to serve you again soon!",
      },
      {
        user: customers[0]._id,
        userName: "John Doe",
        restaurant: seededRestaurants[1]._id,
        rating: 4,
        comment:
          "Loved the burger and the secret sauce. The truffle fries are amazing. A bit pricey but worth the treat.",
      },
      {
        user: customers[0]._id,
        userName: "John Doe",
        restaurant: seededRestaurants[2]._id,
        rating: 5,
        comment:
          "Sushi is extremely fresh and beautifully presented. Dragon roll is a must-try!",
      },
      {
        user: customers[0]._id,
        userName: "John Doe",
        restaurant: seededRestaurants[3]._id,
        rating: 4,
        comment:
          "Clean, healthy and yummy. Perfect lunch option. Quinoa bowl was very filling.",
      },
      {
        user: customers[0]._id,
        userName: "John Doe",
        restaurant: seededRestaurants[4]._id,
        rating: 5,
        comment:
          "Best biryani I have had outside of India. The spice level is perfect and the meat falls off the bone.",
      },
      {
        user: customers[0]._id,
        userName: "John Doe",
        restaurant: seededRestaurants[5]._id,
        rating: 5,
        comment:
          "Authentic South Indian breakfast. The dosa was incredibly crispy and the filter coffee was divine.",
      },
    ];

    let reviewCount = 0;
    for (const rev of reviewsData) {
      try {
        await Review.create(rev);
        reviewCount++;
      } catch (err) {
        console.error(`❌ Failed to save review:`, err.message);
      }
    }
    console.log(`✅ Seeded ${reviewCount} reviews successfully.`);

    // --- Seed Offers ---
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 30);
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 10);

    const offersData = [
      {
        title: "50% Off First Pizza",
        description:
          "Get half off any large pizza when you order for the first time.",
        discountType: "percentage",
        discountValue: 50,
        startDate: now,
        endDate: futureDate,
        restaurant: seededRestaurants[0]._id,
        owner: seededRestaurants[0].owner,
        isActive: true,
      },
      {
        title: "$5 Off Burgers",
        description: "Save $5 on any order over $20.",
        discountType: "fixed",
        discountValue: 5,
        startDate: now,
        endDate: futureDate,
        restaurant: seededRestaurants[1]._id,
        owner: seededRestaurants[1].owner,
        isActive: true,
      },
      {
        title: "Free Delivery Weekend",
        description: "Get free delivery on all sushi orders this weekend.",
        discountType: "percentage",
        discountValue: 100, // effectively free delivery if applied to fee
        startDate: now,
        endDate: futureDate,
        restaurant: seededRestaurants[2]._id,
        owner: seededRestaurants[2].owner,
        isActive: true,
      },
      {
        title: "Expired Offer",
        description: "This offer is no longer valid.",
        discountType: "fixed",
        discountValue: 10,
        startDate: pastDate,
        endDate: now,
        restaurant: seededRestaurants[0]._id,
        owner: seededRestaurants[0].owner,
        isActive: false,
      },
    ];

    let offerCount = 0;
    for (const off of offersData) {
      try {
        await Offer.create(off);
        offerCount++;
      } catch (err) {
        console.error(`❌ Failed to save offer ${off.title}:`, err.message);
      }
    }
    console.log(`✅ Seeded ${offerCount} offers.`);

    // --- Seed Orders ---
    const orderStatuses = [
      "pending",
      "accepted",
      "preparing",
      "out-for-delivery",
      "delivered",
      "cancelled",
    ];
    const sampleOrders = [];

    // Create 10 orders for testing
    for (let i = 0; i < 10; i++) {
      const rest = seededRestaurants[i % seededRestaurants.length];
      const randomStatus =
        orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const randomCustomer =
        customers[Math.floor(Math.random() * customers.length)];

      const order = {
        customer: randomCustomer._id,
        restaurant: rest._id,
        items: [
          {
            menuItem: createdMenuItems[i % createdMenuItems.length]._id,
            name: createdMenuItems[i % createdMenuItems.length].name,
            price: createdMenuItems[i % createdMenuItems.length].price,
            quantity: 2,
          },
        ],
        totalAmount:
          createdMenuItems[i % createdMenuItems.length].price * 2 + 5,
        deliveryAddress: {
          fullName: "John Doe",
          mobileNumber: "1234567890",
          houseNumber: "123",
          street: "Main St",
          area: "Downtown",
          city: "Food City",
          state: "FC",
          country: "USA",
          pinCode: "12345",
          latitude: 40.7128,
          longitude: -74.006,
        },
        paymentMethod: "card",
        paymentStatus: "paid",
        status: randomStatus,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 10000000000),
        ),
      };

      if (randomStatus === "delivered") {
        order.deliveredAt = new Date();
      }

      sampleOrders.push(order);
    }

    let orderCount = 0;
    for (const ord of sampleOrders) {
      try {
        await Order.create(ord);
        orderCount++;
      } catch (err) {
        console.error(`❌ Failed to save order:`, err.message);
      }
    }
    console.log(`✅ Seeded ${orderCount} sample orders.`);

    // Verification: Count documents in each collection
    console.log("\n📊 Verification - Document counts in database:");
    const verifyUserCount = await User.countDocuments();
    const verifyRestaurantCount = await Restaurant.countDocuments();
    const verifyMenuItemCount = await MenuItem.countDocuments();
    const verifyReviewCount = await Review.countDocuments();
    const verifyOfferCount = await Offer.countDocuments();
    const verifyOrderCount = await Order.countDocuments();

    console.log(`   Users: ${verifyUserCount}`);
    console.log(`   Restaurants: ${verifyRestaurantCount}`);
    console.log(`   Menu Items: ${verifyMenuItemCount}`);
    console.log(`   Reviews: ${verifyReviewCount}`);
    console.log(`   Offers: ${verifyOfferCount}`);
    console.log(`   Orders: ${verifyOrderCount}`);

    console.log("\n✅ Database Seeding Completed Successfully!");
    console.log(`📍 Connected to: ${MONGODB_URI.split("@")[1]}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err.message);
    process.exit(1);
  }
};

seedData();
