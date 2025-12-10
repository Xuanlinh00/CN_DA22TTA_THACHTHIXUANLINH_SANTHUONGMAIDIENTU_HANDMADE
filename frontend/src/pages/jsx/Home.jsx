import { useEffect, useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/jsx/ProductCard';
import Loader from '@/components/jsx/Loader';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/products?limit=12');
        setProducts(res?.data?.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Sản phẩm nổi bật</h1>
      {loading ? <Loader /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
