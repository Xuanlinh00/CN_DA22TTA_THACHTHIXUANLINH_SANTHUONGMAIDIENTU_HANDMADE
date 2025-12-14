const Product = require('../models/product.model');
const Category = require('../models/category.model');
const multer = require('multer');
const path = require('path');

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

// --- 1. LẤY TẤT CẢ SẢN PHẨM (Có Lọc & Phân trang) ---
const getProducts = async (req, res) => {
  try {
    // 1. Xử lý tìm kiếm theo tên (keyword)
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { material: { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {};

    // 2. Xử lý lọc theo danh mục
    const categoryQuery = req.query.category ? { category: req.query.category } : {};

    // 3. Lọc theo shop (từ query hoặc từ URL params)
    let shopQuery = {};
    if (req.query.shop) {
      shopQuery = { shop: req.query.shop };
    } else if (req.params.shopId) {
      shopQuery = { shop: req.params.shopId };
    }

    // 4. Lọc theo giá
    let priceQuery = {};
    if (req.query.minPrice || req.query.maxPrice) {
      priceQuery.price = {};
      if (req.query.minPrice) priceQuery.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceQuery.price.$lte = Number(req.query.maxPrice);
    }

    // 5. Phân trang
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    // 6. Sắp xếp
    let sortQuery = { createdAt: -1 }; // Mặc định mới nhất
    if (req.query.sort === 'price_asc') sortQuery = { price: 1 };
    if (req.query.sort === 'price_desc') sortQuery = { price: -1 };
    if (req.query.sort === 'rating') sortQuery = { rating: -1 };
    if (req.query.sort === 'sold') sortQuery = { sold: -1 };

    // Tổng hợp query
    const query = { 
      ...keyword, 
      ...categoryQuery, 
      ...shopQuery, 
      ...priceQuery,
      isActive: true // Chỉ lấy sản phẩm đang hoạt động
    };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('shop', 'shopName avatar')
      .populate('category', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sortQuery);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
        hasNext: page < Math.ceil(count / pageSize),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. LẤY CHI TIẾT SẢN PHẨM ---
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'shopName avatar status')
      .populate('category', 'name')
      .populate('user', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Middleware upload - export để dùng trong routes
const uploadProductImages = (req, res, next) => {
  upload.array('images', 8)(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err.message);
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    console.log('✅ Multer middleware completed');
    console.log('📁 req.files:', req.files ? `${req.files.length} files` : 'undefined');
    next();
  });
};

// --- 3. TẠO SẢN PHẨM (Shop Owner) ---
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      price, 
      description, 
      material,
      category, 
      stockQuantity,
      dimensions,
      weight,
      customizable,
      tags
    } = req.body;

    console.log('\n=== CREATING PRODUCT ===');
    console.log('📝 Form data:', { name, price, category, stockQuantity });
    console.log('📁 Files received:', req.files ? req.files.length : 0);
    if (req.files && req.files.length > 0) {
      console.log('📸 File details:', req.files.map(f => ({ fieldname: f.fieldname, filename: f.filename, size: f.size })));
    } else {
      console.log('⚠️  No files in req.files');
    }

    // Validation
    if (!name || !price || !description || !category || !stockQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Xử lý upload nhiều ảnh từ file
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/products/${file.filename}`);
      console.log('✅ Images processed:', images);
    } else {
      console.log('⚠️  req.files is:', req.files);
      console.log('⚠️  req.file is:', req.file);
    }

    if (images.length === 0) {
      console.log('❌ No images provided');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ít nhất 1 ảnh'
      });
    }

    // Kiểm tra user có shop không
    const Shop = require('../models/shop.model');
    const userShop = await Shop.findOne({ user: req.user._id, status: 'active' });
    if (!userShop) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn cần có gian hàng được duyệt để đăng sản phẩm' 
      });
    }

    const product = new Product({
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
      material: material ? material.trim() : undefined,
      category,
      stockQuantity: Number(stockQuantity),
      dimensions: dimensions ? dimensions.trim() : undefined,
      weight: weight ? Number(weight) : undefined,
      customizable: customizable === 'true' || customizable === true,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      images,
      user: req.user._id,
      shop: userShop._id,
      isActive: true
    });

    const createdProduct = await product.save();
    await createdProduct.populate(['shop', 'category']);
    
    console.log('✅ Product created successfully');
    console.log('📸 Saved images:', createdProduct.images);
    console.log('=== END CREATING PRODUCT ===\n');
    
    res.status(201).json({ 
      success: true, 
      message: 'Đã tạo sản phẩm thành công',
      data: createdProduct 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. CẬP NHẬT SẢN PHẨM ---
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Check quyền: Chỉ chủ shop hoặc Admin mới được sửa
    if (product.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa sản phẩm này' });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 5. XOÁ SẢN PHẨM ---
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Check quyền
    if (product.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xoá sản phẩm này' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Đã xoá sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 6. THÊM ĐÁNH GIÁ (REVIEW) ---
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tìm thấy' });
    }

    // Kiểm tra xem user đã review chưa (Mỗi người chỉ review 1 lần)
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    // Tạo object review
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      createdAt: Date.now()
    };

    // Thêm vào mảng reviews
    product.reviews.push(review);

    // Cập nhật lại số lượng review và điểm trung bình
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Đánh giá đã được thêm' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 7. THÊM CÂU HỎI (QUESTION) ---
const addQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tìm thấy' });
    }

    if (!question) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung câu hỏi' });
    }

    const newQuestion = {
      user: req.user._id,
      name: req.user.name,
      question: question,
      createdAt: Date.now(),
      answers: [] // Khởi tạo mảng trả lời trống
    };

    product.questions.push(newQuestion);
    await product.save();

    res.status(201).json({ success: true, message: 'Câu hỏi đã được gửi', data: newQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 8. (Optional) TRẢ LỜI CÂU HỎI (Cho Vendor/Admin) ---
// Nếu bạn muốn phát triển thêm: Cho phép chủ shop trả lời câu hỏi của khách
const answerQuestion = async (req, res) => {
    try {
        const { answer } = req.body;
        const { questionId } = req.params; // ID của câu hỏi nằm trong URL
        const productId = req.params.id;   // ID của sản phẩm

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

        // Tìm câu hỏi trong mảng questions
        const question = product.questions.id(questionId);
        if(!question) return res.status(404).json({ message: 'Câu hỏi không tồn tại' });

        // Thêm câu trả lời
        question.answers.push({
            user: req.user._id,
            name: req.user.name, // Thường là Shop Name
            answer: answer,
            createdAt: Date.now()
        });

        await product.save();
        res.status(200).json({ success: true, message: 'Đã trả lời câu hỏi' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  addQuestion,
  answerQuestion, // Export thêm nếu dùng
  uploadProductImages // Export middleware upload
};