const Product = require('../models/product.model');

// --- 1. LẤY TẤT CẢ SẢN PHẨM (Có Lọc & Phân trang) ---
// @route GET /api/products?keyword=abc&page=1&category=...
const getProducts = async (req, res) => {
  try {
    // 1. Xử lý tìm kiếm theo tên (keyword)
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i', // 'i' để không phân biệt hoa thường
          },
        }
      : {};

    // 2. Xử lý lọc theo danh mục
    const categoryQuery = req.query.category ? { category: req.query.category } : {};

    // 3. Phân trang
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Tổng hợp query
    const query = { ...keyword, ...categoryQuery };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('shop', 'shopName') // Hiện tên shop bán
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        pages: Math.ceil(count / pageSize),
        total: count
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
      .populate('shop', 'shopName avatar')
      .populate('reviews.user', 'name avatar') // Hiện info người review
      .populate('questions.user', 'name'); // Hiện info người hỏi

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. TẠO SẢN PHẨM (Admin/Vendor) ---
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock, shop } = req.body;

    const product = new Product({
      name,
      price,
      user: req.user._id, // Người tạo (Vendor/Admin)
      shop: shop || req.user.shop, // Nếu user là vendor thì lấy shop của họ
      image,
      category,
      countInStock,
      description,
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
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
  answerQuestion // Export thêm nếu dùng
};