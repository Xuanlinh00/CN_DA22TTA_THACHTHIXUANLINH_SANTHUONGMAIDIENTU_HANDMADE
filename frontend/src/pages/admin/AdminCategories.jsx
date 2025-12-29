import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { categoryService } from '../../services/categoryService';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const initMutation = useMutation({
    mutationFn: categoryService.initDefault,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Khởi tạo danh mục mặc định thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Khởi tạo thất bại');
    },
  });

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Thêm danh mục thành công');
      setShowModal(false);
      setFormData({ name: '', description: '', icon: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Cập nhật danh mục thành công');
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', icon: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Xóa danh mục thành công');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="text-center py-20">Đang tải...</div>;

  const categories = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-sans font-bold text-primary-900">Quản lý danh mục</h1>
        <div className="flex gap-3">
          {categories.length === 0 && (
            <button 
              onClick={() => initMutation.mutate()} 
              disabled={initMutation.isPending}
              className="btn-outline flex items-center space-x-2"
            >
              <FiPlus />
              <span>{initMutation.isPending ? 'Đang khởi tạo...' : 'Khởi tạo mặc định'}</span>
            </button>
          )}
          <button onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '', icon: '' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
            <FiPlus />
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="text-6xl mb-3">{category.icon || '📦'}</div>
              <h3 className="text-lg font-semibold text-primary-900">{category.name}</h3>
              <p className="text-xs text-primary-600 mt-1">{category.description}</p>
            </div>
            
            <div className="flex gap-2 justify-center pt-4 border-t border-primary-200">
              <button 
                onClick={() => handleEdit(category)} 
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                title="Chỉnh sửa"
              >
                <FiEdit size={16} />
                <span className="text-sm">Sửa</span>
              </button>
              <button 
                onClick={() => handleDelete(category._id)} 
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Xóa"
              >
                <FiTrash2 size={16} />
                <span className="text-sm">Xóa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-4">
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Tên danh mục *</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Mô tả</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Icon (emoji)</label>
                <input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="input-field" placeholder="🎨" />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 btn-primary">
                  {editingCategory ? 'Cập nhật' : 'Thêm'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
