const Product = require('../models/product.model');
const Category = require('../models/category.model');
const multer = require('multer');
const path = require('path');

// ========== CẤU HÌNH UPLOAD ẢNH ==========
// Cấu hình multer cho upload ảnh sản phẩm
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
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

// ========== QUẢN LÝ SẢN PHẨM ==========

/**
 * 0. LẤY SẢN PHẨM NỔI BẬT
 * - Lấy top searched (50% số lượng)
 * - Lấy top sold (50% số lượng còn lại)
 * - Loại trừ sản phẩm trùng lặp
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    
    // Lấy top searched (50% số lượng)
    const searchedLimit = Math.ceil(limit / 2);
    const topSearched = await Product.find({ searchCount: { $gt: 0 } })
      .populate('shop', 'shopName avatar')
      .populate('category', 'name')
      .sort({ searchCount: -1 })
      .limit(searchedLimit);

    // Lấy top sold (50% số lượng còn lại)
    const soldLimit = limit - topSearched.length;
    const topSold = await Product.find({ 
      sold: { $gt: 0 },
      _id: { $nin: topSearched.map(p => p._id) } // Loại trừ sản phẩm đã có
    })
      .populate('shop', 'shopName avatar')
      .populate('category', 'name')
      .sort({ sold: -1 })
      .limit(soldLimit);

    // Merge kết quả
    const featuredProducts = [...topSearched, ...topSold];

    res.json({
      success: true,
      data: featuredProducts,
      pagination: { total: featuredProducts.length }
    });

  } catch (error) {
    console.error('Lỗi lấy sản phẩm nổi bật:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 1. LẤY TẤT CẢ SẢN PHẨM (Có Lọc & Phân trang) ---
/**
 * 1. LẤY DANH SÁCH SẢN PHẨM
 * - Tìm kiếm theo tên, mô tả, chất liệu
 * - Lọc theo danh mục, shop, giá
 * - Sắp xếp theo giá, rating, lượt bán, lượt tìm kiếm
 * - Phân trang
 * - Tăng searchCount khi tìm kiếm
 */
const getProducts = async (req, res) => {
  try {
    // 1. Xử lý tìm kiếm theo tên (keyword) - Tìm kiếm linh hoạt
    let keyword = {};
    if (req.query.keyword) {
      const searchTerm = req.query.keyword.trim();
      // Tách từ khóa thành các từ riêng lẻ
      const words = searchTerm.split(/\s+/).filter(w => w.length > 0);
      
      // Tạo các pattern tìm kiếm
      const orConditions = [];
      
      // 1. Tìm kiếm chính xác toàn bộ từ khóa (ưu tiên cao)
      orConditions.push(
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { material: { $regex: searchTerm, $options: 'i' } }
      );
      
      // 2. Tìm kiếm từng từ riêng lẻ (ưu tiên thấp hơn)
      words.forEach(word => {
        if (word.length > 1) {
          orConditions.push(
            { name: { $regex: word, $options: 'i' } },
            { description: { $regex: word, $options: 'i' } },
            { material: { $regex: word, $options: 'i' } }
          );
        }
      });
      
      keyword = { $or: orConditions };
    }

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
    if (req.query.sort === 'searched') sortQuery = { searchCount: -1 }; // Sản phẩm được tìm kiếm nhiều nhất

    // Tổng hợp query
    const query = { 
      ...keyword, 
      ...categoryQuery, 
      ...shopQuery, 
      ...priceQuery
      // Bỏ isActive vì có thể sản phẩm không có field này
    };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('shop', 'shopName avatar')
      .populate('category', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sortQuery);

    // Tăng searchCount cho các sản phẩm được tìm kiếm
    if (req.query.keyword && products.length > 0) {
      await Product.updateMany(
        { _id: { $in: products.map(p => p._id) } },
        { $inc: { searchCount: 1 } }
      );
    }

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
/**
 * 2. LẤY THÔNG TIN CHI TIẾT SẢN PHẨM
 * - Lấy thông tin sản phẩm, shop, danh mục
 * - Populate reviews, questions
 * - Tính toán phân bố đánh giá (ratingCount)
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'shopName avatar status')
      .populate('category', 'name')
      .populate('user', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Tính toán phân bố đánh giá (ratingCount)
    const ratingCount = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    // Đếm số lượng đánh giá cho mỗi mức sao
    if (product.reviews && product.reviews.length > 0) {
      product.reviews.forEach(review => {
        const rating = Math.round(review.rating);
        if (rating >= 1 && rating <= 5) {
          ratingCount[rating]++;
        }
      });
    }

    // Thêm ratingCount vào response
    const productData = product.toObject();
    productData.ratingCount = ratingCount;

    res.json({ success: true, data: productData });
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
/**
 * 3. TẠO SẢN PHẨM MỚI
 * - Kiểm tra shop owner có gian hàng active
 * - Upload nhiều ảnh (tối đa 8 ảnh)
 * - Lưu thông tin sản phẩm
 */
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
/**
 * 4. CẬP NHẬT THÔNG TIN SẢN PHẨM
 * - Chỉ chủ shop hoặc admin mới được sửa
 * - Cập nhật tên, giá, mô tả, số lượng, v.v.
 */
const updateProduct = async (req, res) => {
  try {
    console.log('\n=== UPDATE PRODUCT ===');
    console.log('📝 Request body:', req.body);
    console.log('📝 Product ID:', req.params.id);
    console.log('📝 User:', req.user?._id, 'Role:', req.user?.role);
    
    const { 
      name, 
      price, 
      description, 
      category, 
      stockQuantity,
      material,
      dimensions,
      weight,
      customizable,
      tags
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Check quyền: Chỉ chủ shop hoặc Admin mới được sửa
    if (product.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa sản phẩm này' });
    }

    // Cập nhật các field
    if (name !== undefined && name !== null && name !== '') product.name = name.trim();
    if (price !== undefined && price !== null && price !== '') product.price = Number(price);
    if (description !== undefined && description !== null && description !== '') product.description = description.trim();
    if (category !== undefined && category !== null && category !== '') product.category = category;
    // Xử lý stockQuantity đặc biệt vì có thể là 0
    if (stockQuantity !== undefined && stockQuantity !== null && stockQuantity !== '') {
      product.stockQuantity = Number(stockQuantity);
      console.log('✅ Updated stockQuantity to:', product.stockQuantity);
    }
    if (material !== undefined) product.material = material ? material.trim() : undefined;
    if (dimensions !== undefined) product.dimensions = dimensions ? dimensions.trim() : undefined;
    if (weight !== undefined) product.weight = weight ? Number(weight) : undefined;
    if (customizable !== undefined) product.customizable = customizable === 'true' || customizable === true;
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        product.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      } else if (Array.isArray(tags)) {
        product.tags = tags;
      } else {
        product.tags = [];
      }
    }

    const updatedProduct = await product.save();
    await updatedProduct.populate(['shop', 'category']);
    
    console.log('✅ Product updated successfully');
    console.log('📊 Updated product:', {
      name: updatedProduct.name,
      price: updatedProduct.price,
      stockQuantity: updatedProduct.stockQuantity,
      category: updatedProduct.category
    });
    
    res.json({ 
      success: true, 
      message: 'Cập nhật sản phẩm thành công',
      data: updatedProduct 
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 5. XOÁ SẢN PHẨM ---
/**
 * 5. XÓA SẢN PHẨM
 * - Chỉ chủ shop hoặc admin mới được xóa
 */
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
/**
 * 6. THÊM ĐÁNH GIÁ SẢN PHẨM
 * - Mỗi người chỉ review 1 lần
 * - Kiểm tra user đã mua sản phẩm (nếu có orderId)
 * - Cập nhật rating trung bình
 */
const addReview = async (req, res) => {
  try {
    const { rating, comment, orderId } = req.body;
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

    // Nếu có orderId, kiểm tra user đã mua sản phẩm này chưa
    if (orderId) {
      const Order = require('../models/order.model');
      const order = await Order.findById(orderId);
      
      if (!order || order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền đánh giá sản phẩm này' });
      }

      // Kiểm tra đơn hàng đã giao thành công chưa
      if (order.status !== 'delivered') {
        return res.status(400).json({ success: false, message: 'Chỉ có thể đánh giá khi đơn hàng đã giao thành công' });
      }

      // Kiểm tra sản phẩm có trong đơn hàng không
      const itemInOrder = order.items.find(item => item.product.toString() === req.params.id);
      if (!itemInOrder) {
        return res.status(400).json({ success: false, message: 'Sản phẩm không có trong đơn hàng này' });
      }

      // Cập nhật review trong order item
      itemInOrder.reviewed = true;
      itemInOrder.review = {
        rating: Number(rating),
        comment,
        createdAt: new Date()
      };
      await order.save();
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
    res.status(201).json({ success: true, message: 'Đánh giá đã được thêm', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 7. THÊM CÂU HỎI (QUESTION) ---
/**
 * 7. THÊM CÂU HỎI CHO SẢN PHẨM
 * - Khách hàng có thể hỏi về sản phẩm
 * - Chủ shop có thể trả lời
 */
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

// --- 8. TRẢ LỜI CÂU HỎI (Cho Vendor/Admin) ---
/**
 * 8. TRẢ LỜI CÂU HỎI
 * - Chủ shop trả lời câu hỏi của khách
 */
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
  getFeaturedProducts,
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