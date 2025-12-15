const mongoose = require('mongoose');
const Product = require('../models/product.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testFuzzySearch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Kiểm tra tổng số sản phẩm
    const totalProducts = await Product.countDocuments();
    console.log(`\n📊 Tổng số sản phẩm trong DB: ${totalProducts}`);

    if (totalProducts === 0) {
      console.log('⚠️  Database không có sản phẩm. Hãy seed dữ liệu trước!');
      await mongoose.connection.close();
      return;
    }

    // Lấy vài sản phẩm để test
    const sampleProducts = await Product.find().limit(5);
    console.log('\n📋 Mẫu sản phẩm:');
    sampleProducts.forEach(p => console.log(`  - ${p.name}`));

    // Test 1: Tìm kiếm chính xác
    console.log('\n📝 Test 1: Tìm kiếm chính xác "handmade"');
    const exact = await Product.find({
      name: { $regex: 'handmade', $options: 'i' }
    }).limit(5);
    console.log(`Tìm thấy ${exact.length} sản phẩm`);
    exact.forEach(p => console.log(`  - ${p.name}`));

    // Test 2: Tìm kiếm tương đối "hoa"
    console.log('\n📝 Test 2: Tìm kiếm tương đối "hoa"');
    const fuzzyPattern = 'hoa'.split('').join('.*');
    console.log(`Pattern: ${fuzzyPattern}`);
    const fuzzy = await Product.find({
      name: { $regex: fuzzyPattern, $options: 'i' }
    }).limit(5);
    console.log(`Tìm thấy ${fuzzy.length} sản phẩm`);
    fuzzy.forEach(p => console.log(`  - ${p.name}`));

    // Test 3: Tìm kiếm tương đối "len"
    console.log('\n📝 Test 3: Tìm kiếm tương đối "len"');
    const fuzzyPattern2 = 'len'.split('').join('.*');
    console.log(`Pattern: ${fuzzyPattern2}`);
    const fuzzy2 = await Product.find({
      name: { $regex: fuzzyPattern2, $options: 'i' }
    }).limit(5);
    console.log(`Tìm thấy ${fuzzy2.length} sản phẩm`);
    fuzzy2.forEach(p => console.log(`  - ${p.name}`));

    await mongoose.connection.close();
    console.log('\n✅ Test hoàn thành');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testFuzzySearch();
