import { useEffect, useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/jsx/ProductCard';
import Loader from '@/components/jsx/Loader';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchProducts = async (page = 1) => {
    const qs = new URLSearchParams({ page, limit: 12, ...(keyword ? { keyword } : {}), ...(category ? { category } : {}) });
    const res = await api.get(`/api/products?${qs.toString()}`);
    setProducts(res?.data?.data || []);
    setPagination(res?.data?.pagination || { page: 1, pages: 1, total: 0 });
  };

  useEffect(() => {
    (async () => {
      const res = await api.get('/api/categories');
      setCategories(res?.data?.data || []);
      fetchProducts(1);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchProducts(1); }, [keyword, category]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          className="border rounded px-3 py-2 w-full md:w-1/2"
          placeholder="Tìm kiếm sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 w-full md:w-1/4"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c._id} value={c.slug || c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {!products ? <Loader /> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => fetchProducts(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Trước
            </button>
            <span>Trang {pagination.page}/{pagination.pages}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => fetchProducts(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
