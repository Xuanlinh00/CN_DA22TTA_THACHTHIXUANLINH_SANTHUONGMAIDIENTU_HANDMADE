import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { shopService } from '../../services/shopService';
import { categoryService } from '../../services/categoryService';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import ShopLayout from '../../components/layout/ShopLayout';
import toast from 'react-hot-toast';

const ShopProducts = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-icon.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    defaultValues: {
      name: '',
      price: '',
      description: '',
      material: '',
      category: '',
      stockQuantity: '',
      dimensions: '',
      weight: '',
      customizable: false,
      tags: ''
    }
  });

  // Update form values when editing product changes
  useEffect(() => {
    if (editingProduct) {
      console.log('🔄 Editing product:', editingProduct);
      setValue('name', editingProduct.name);
      setValue('price', editingProduct.price);
      setValue('description', editingProduct.description);
      setValue('material', editingProduct.material || '');
      // Xử lý category - có thể là object hoặc string
      const categoryId = typeof editingProduct.category === 'object' 
        ? editingProduct.category?._id 
        : editingProduct.category;
      console.log('📂 Category:', editingProduct.category, '-> ID:', categoryId);
      setValue('category', categoryId || '');
      setValue('stockQuantity', editingProduct.stockQuantity || 0);
      setValue('dimensions', editingProduct.dimensions || '');
      setValue('weight', editingProduct.weight || '');
      setValue('customizable', editingProduct.customizable || false);
      setValue('tags', editingProduct.tags || '');
    }
  }, [editingProduct, setValue]);

  const { data: shopData } = useQuery({
    queryKey: ['my-shop'],
    queryFn: shopService.getMyShop,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['shop-products', shopData?.data?._id],
    queryFn: () => productService.getByShop(shopData.data._id),
    enabled: !!shopData?.data?._id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('price', data.price);
      formData.append('description', data.description);
      formData.append('material', data.material);
      formData.append('category', data.category);
      formData.append('stockQuantity', data.stockQuantity);
      formData.append('dimensions', data.dimensions);
      formData.append('weight', data.weight);
      formData.append('customizable', data.customizable);
      formData.append('tags', data.tags);
      
      // Thêm tất cả file ảnh
      console.log('📤 Uploading product with', uploadedImages.length, 'images');
      console.log('📋 Form data keys:', Array.from(formData.keys()));
      uploadedImages.forEach((image, index) => {
        console.log(`  Image ${index + 1}:`, image.name, `(${(image.size / 1024).toFixed(2)}KB)`);
        formData.append('images', image);
      });
      console.log('✅ FormData ready to send');

      return productService.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      toast.success('Thêm sản phẩm thành công');
      setShowModal(false);
      reset();
      setUploadedImages([]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Thêm sản phẩm thất bại');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      console.log('📤 Updating product with data:', data);
      return productService.update(editingProduct._id, data);
    },
    onSuccess: (response) => {
      console.log('✅ Update response:', response);
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      toast.success('Cập nhật sản phẩm thành công');
      setShowModal(false);
      setEditingProduct(null);
      reset();
    },
    onError: (error) => {
      console.error('❌ Update error:', error);
      toast.error(error.response?.data?.message || 'Cập nhật sản phẩm thất bại');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      toast.success('Xóa sản phẩm thành công');
    },
    onError: () => {
      toast.error('Xóa sản phẩm thất bại');
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedImages([...uploadedImages, ...files]);
  };

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    console.log('📋 Form submitted with data:', data);
    console.log('📋 Form errors:', Object.keys(errors).length > 0 ? errors : 'No errors');
    
    // Kiểm tra tên sản phẩm trùng trong cùng cửa hàng
    const isDuplicate = products.some(product => 
      product.name.toLowerCase() === data.name.toLowerCase() &&
      product._id !== editingProduct?._id // Nếu đang edit, bỏ qua sản phẩm hiện tại
    );

    if (isDuplicate) {
      toast.error('Tên sản phẩm này đã tồn tại trong cửa hàng của bạn. Vui lòng đổi tên khác.');
      return;
    }

    // Đảm bảo tất cả field được gửi
    const submitData = {
      name: data.name || '',
      price: Number(data.price) || 0,
      description: data.description || '',
      category: data.category || '',
      stockQuantity: Number(data.stockQuantity) || 0,
      material: data.material || '',
      dimensions: data.dimensions || '',
      weight: Number(data.weight) || 0,
      customizable: data.customizable || false,
      tags: data.tags || ''
    };

    console.log('📋 Form data to submit:', submitData);

    if (editingProduct) {
      updateMutation.mutate(submitData);
    } else {
      if (uploadedImages.length === 0) {
        toast.error('Vui lòng upload ít nhất 1 ảnh');
        return;
      }
      createMutation.mutate(submitData);
    }
  };

  if (isLoading) return <Loading />;

  const products = productsData?.data || [];

  return (
    <ShopLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
        <h1 className="text-3xl font-sans font-bold text-primary-900">
          Quản lý sản phẩm
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-primary-600 mb-4">Chưa có sản phẩm nào</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Thêm sản phẩm đầu tiên
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-primary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-primary-500">
                            {product.category?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-accent-600">
                        {formatCurrency(product.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-900">{product.stockQuantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.stockQuantity > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stockQuantity > 0 ? '✓ Còn hàng' : '✗ Hết hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/products/${product._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEye size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto pt-20">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary-900">
                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  reset();
                  setUploadedImages([]);
                }}
                className="text-primary-400 hover:text-primary-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
                  className="input-field"
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>

              {/* Giá & Tồn kho */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    {...register('price', { required: 'Giá là bắt buộc' })}
                    className="input-field"
                    placeholder="0"
                  />
                  {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Tồn kho *
                  </label>
                  <input
                    type="number"
                    {...register('stockQuantity', { required: 'Tồn kho là bắt buộc' })}
                    className="input-field"
                    placeholder="0"
                  />
                  {errors.stockQuantity && <p className="text-red-600 text-sm mt-1">{errors.stockQuantity.message}</p>}
                </div>
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Danh mục {editingProduct ? '' : '*'}
                </label>
                <select
                  {...register('category', { 
                    validate: (value) => {
                      if (!editingProduct && !value) {
                        return 'Danh mục là bắt buộc';
                      }
                      return true;
                    }
                  })}
                  className="input-field"
                >
                  <option value="">Chọn danh mục</option>
                  {categoriesData?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Mô tả *
                </label>
                <textarea
                  {...register('description', { required: 'Mô tả là bắt buộc' })}
                  className="input-field"
                  rows="3"
                  placeholder="Nhập mô tả sản phẩm"
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
              </div>

              {/* Chất liệu & Kích thước */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Chất liệu
                  </label>
                  <input
                    {...register('material')}
                    className="input-field"
                    placeholder="Ví dụ: Cotton, Linen..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Kích thước
                  </label>
                  <input
                    {...register('dimensions')}
                    className="input-field"
                    placeholder="Ví dụ: 10x10x5cm"
                  />
                </div>
              </div>

              {/* Trọng lượng & Tùy chỉnh */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Trọng lượng (gram)
                  </label>
                  <input
                    type="number"
                    {...register('weight')}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('customizable')}
                      className="rounded border-primary-300"
                    />
                    <span className="ml-2 text-sm text-primary-700">Có thể tùy chỉnh</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Tags (cách nhau bằng dấu phẩy)
                </label>
                <input
                  {...register('tags')}
                  className="input-field"
                  placeholder="handmade, độc đáo, quà tặng"
                />
              </div>

              {/* Upload ảnh */}
              {!editingProduct && (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Ảnh sản phẩm * (Tối đa 8 ảnh)
                  </label>

                  {/* Upload từ file */}
                  <div className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center mb-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      <p className="text-2xl mb-2">📁</p>
                      <p className="text-primary-600 font-medium">Kéo thả ảnh hoặc click để chọn</p>
                      <p className="text-sm text-primary-500 mt-1">Mỗi ảnh tối đa 5MB, định dạng: JPG, PNG</p>
                    </label>
                  </div>

                  {/* Hiển thị ảnh đã upload */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-primary-700 mb-2">
                        Ảnh đã thêm ({uploadedImages.length}/8)
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`preview-${index}`}
                              className="w-full h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Đang xử lý...'
                    : editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    reset();
                    setUploadedImages([]);
                  }}
                  className="btn-outline flex-1"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ShopLayout>
  );
};

export default ShopProducts;
