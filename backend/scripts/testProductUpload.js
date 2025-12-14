const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
require('dotenv').config();

// Get token from environment or use a test token
const testToken = process.env.TEST_TOKEN || 'test-token';

async function testUpload() {
  try {
    console.log('🧪 Testing product upload...');
    
    // Create a test image file
    const testImagePath = path.join(__dirname, '../../images/slider1.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found at:', testImagePath);
      console.log('📁 Available images:', fs.readdirSync(path.join(__dirname, '../../images')));
      return;
    }

    const form = new FormData();
    form.append('name', 'Test Product');
    form.append('price', '100000');
    form.append('description', 'Test product description');
    form.append('category', '67581e8c1234567890abcdef'); // Replace with actual category ID
    form.append('stockQuantity', '10');
    form.append('images', fs.createReadStream(testImagePath));

    const response = await axios.post('http://localhost:8000/api/products', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${testToken}`
      }
    });

    console.log('✅ Upload successful:', response.data);
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
  }
}

testUpload();
