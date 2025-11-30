import axios from 'axios';

// ✅ Sửa baseURL để trỏ đến backend của bạn
const instance = axios.create({
  baseURL: 'http://localhost:8000',  // ← Thêm URL backend ở đây
  timeout: 10000,  // Tăng timeout lên 10s cho chắc
  withCredentials: true  // Cho phép gửi cookies nếu dùng JWT
});

// Sample mock data used when backend is unreachable
const sampleProducts = [
  {
    _id: 'p1',
    name: 'Túi vải thêu tay',
    price: 120000,
    image: '/assets/sample-bag.jpg',
    description: 'Túi vải thêu tay, phong cách vintage.',
    stockQuantity: 10,
    category: { _id: 'c1', name: 'Phụ kiện' },
    shop: { shopName: 'Xưởng Linh' }
  },
  {
    _id: 'p2',
    name: 'Dây chuyền đá tự nhiên',
    price: 220000,
    image: '/assets/sample-necklace.jpg',
    description: 'Dây chuyền đá tự nhiên làm thủ công.',
    stockQuantity: 5,
    category: { _id: 'c2', name: 'Trang sức' },
    shop: { shopName: 'Quà Tặng Handmade' }
  }
];

const sampleCart = {
  items: [
    { _id: 'ci1', product: sampleProducts[0], quantity: 2 },
    { _id: 'ci2', product: sampleProducts[1], quantity: 1 }
  ]
};

async function safeGet(url, options) {
  try {
    const res = await instance.get(url, options);
    return res;
  } catch (err) {
    console.warn(`⚠️ Backend không phản hồi (${url}), dùng mock data:`, err.message);
    
    // Provide helpful fallback data for development when backend is down
    if (url.startsWith('/api/products')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      if (id && id !== 'products' && !id.includes('?')) {
        const prod = sampleProducts.find(p => p._id === id) || sampleProducts[0];
        return { data: prod };
      }

      // query by category
      if (url.includes('category=')) {
        return { data: sampleProducts };
      }

      return { data: sampleProducts };
    }

    if (url.startsWith('/api/cart')) {
      return { data: sampleCart };
    }

    // Default fallback
    return { data: null };
  }
}

async function safePost(url, data, options) {
  try {
    const res = await instance.post(url, data, options);
    return res;
  } catch (err) {
    console.warn(`⚠️ Backend không phản hồi (${url}):`, err.message);
    return { data: null };
  }
}

async function safePut(url, data, options) {
  try {
    const res = await instance.put(url, data, options);
    return res;
  } catch (err) {
    console.warn(`⚠️ Backend không phản hồi (${url}):`, err.message);
    return { data: null };
  }
}

async function safeDelete(url, options) {
  try {
    const res = await instance.delete(url, options);
    return res;
  } catch (err) {
    console.warn(`⚠️ Backend không phản hồi (${url}):`, err.message);
    return { data: null };
  }
}

export default {
  get: safeGet,
  post: safePost,
  put: safePut,
  delete: safeDelete,
  axios: instance,
};
// import axios from 'axios';

// const instance = axios.create({
//   baseURL: 'http://localhost:8000',
//   timeout: 10000,
//   withCredentials: true
// });

// const sampleProducts = [
//   {
//     _id: 'p1',
//     name: 'Túi vải thêu tay',
//     price: 120000,
//     image: '/assets/sample-bag.jpg',
//     description: 'Túi vải thêu tay, phong cách vintage.',
//     stockQuantity: 10,
//     category: { _id: 'c1', name: 'Phụ kiện' },
//     shop: { shopName: 'Xưởng Linh' }
//   }
// ];

// async function safeGet(url, options) {
//   try {
//     const res = await instance.get(url, options);
//     return res;
//   } catch (err) {
//     console.warn(`⚠️ Backend không phản hồi (${url}):`, err.message);
//     if (url.startsWith('/api/products')) {
//       return { data: sampleProducts };
//     }
//     return { data: null };
//   }
// }

// export default {
//   get: safeGet,
//   axios: instance,
// };