const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('../models/product.model');
  const products = await Product.find().select('name images');
  console.log('=== PRODUCTS IN DATABASE ===');
  console.log(`Total products: ${products.length}\n`);
  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   Images: ${p.images.length > 0 ? p.images.join(', ') : '(empty)'}`);
  });
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
