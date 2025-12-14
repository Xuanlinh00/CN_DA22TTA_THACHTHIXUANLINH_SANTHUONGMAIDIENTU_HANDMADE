const express = require('express');
const router = express.Router();
const {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee,
  getDeliveryTime,
  createShippingOrder,
  trackOrder,
  getServices
} = require('../controllers/shipping.controller');

// Public routes - không cần auth
router.get('/provinces', getProvinces);
router.get('/districts/:provinceId', getDistricts);
router.get('/wards/:districtId', getWards);
router.post('/calculate-fee', calculateShippingFee);
router.post('/delivery-time', getDeliveryTime);
router.get('/services', getServices);

// Protected routes - cần auth
const { protect } = require('../middleware/auth.middleware');
router.post('/create-order', protect, createShippingOrder);
router.get('/track/:order_code', protect, trackOrder);

module.exports = router;