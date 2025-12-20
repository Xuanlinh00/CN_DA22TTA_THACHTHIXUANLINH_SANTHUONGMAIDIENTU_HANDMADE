import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import { shopService } from '../../services/shopService';
import Loading from '../../components/common/Loading';
import ShopLayout from '../../components/layout/ShopLayout';
import toast from 'react-hot-toast';

const ShopSettings = () => {
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['my-shop'],
    queryFn: shopService.getMyShop,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    values: shopData?.data ? {
      shopName: shopData.data.shopName,
      description: shopData.data.description,
      phone: shopData.data.phone,
      street: shopData.data.address?.street,
      ward: shopData.data.address?.ward,
      district: shopData.data.address?.district,
      city: shopData.data.address?.city,
    } : {},
  });

  const updateMutation = useMutation({
    mutationFn: shopService.update,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-shop']);
      toast.success('Cập nhật thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('shopName', data.shopName);
    formData.append('description', data.description);
    formData.append('phone', data.phone);
    formData.append('street', data.street);
    formData.append('ward', data.ward);
    formData.append('district', data.district);
    formData.append('city', data.city);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }

    updateMutation.mutate(formData);
  };

  if (shopLoading) return <Loading fullScreen />;

  return (
    <ShopLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-sans font-bold text-primary-900">
          Cài đặt cửa hàng
        </h1>

        <div className="max-w-3xl">
          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Tên cửa hàng *
                </label>
                <input
                  {...register('shopName', { required: 'Tên cửa hàng là bắt buộc' })}
                  className="input-field"
                />
                {errors.shopName && (
                  <p className="mt-1 text-sm text-red-600">{errors.shopName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Mô tả *
                </label>
                <textarea
                  {...register('description', { required: 'Mô tả là bắt buộc' })}
                  rows={4}
                  className="input-field"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                  className="input-field"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="border-t border-primary-200 pt-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Địa chỉ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Địa chỉ cụ thể *
                    </label>
                    <input
                      {...register('street', { required: 'Địa chỉ là bắt buộc' })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Phường/Xã *
                    </label>
                    <input
                      {...register('ward', { required: 'Phường/Xã là bắt buộc' })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Quận/Huyện *
                    </label>
                    <input
                      {...register('district', { required: 'Quận/Huyện là bắt buộc' })}
                      className="input-field"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <input
                      {...register('city', { required: 'Tỉnh/Thành phố là bắt buộc' })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-primary-200 pt-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Hình ảnh</h3>
                <div className="space-y-6">
                  {/* Avatar */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Avatar (Ảnh đại diện)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : shopData?.data?.avatar ? (
                          <img 
                            src={getImageUrl(shopData.data.avatar)} 
                            alt="Current avatar" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150';
                            }}
                          />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="block w-full text-sm text-primary-600
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary-600 file:text-white
                            hover:file:bg-primary-700"
                        />
                        <p className="text-xs text-primary-500 mt-1">Tối đa 5MB, định dạng: JPG, PNG</p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Ảnh bìa (Cover Image)
                    </label>
                    <div className="space-y-2">
                      <div className="w-full h-32 rounded bg-primary-100 overflow-hidden flex items-center justify-center">
                        {coverImagePreview ? (
                          <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                        ) : shopData?.data?.coverImage ? (
                          <img 
                            src={getImageUrl(shopData.data.coverImage)} 
                            alt="Current cover" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/800x200';
                            }}
                          />
                        ) : (
                          <span className="text-4xl">🖼️</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="block w-full text-sm text-primary-600
                          file:mr-4 file:py-2 file:px-4
                          file:rounded file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-600 file:text-white
                          hover:file:bg-primary-700"
                      />
                      <p className="text-xs text-primary-500">Tối đa 5MB, định dạng: JPG, PNG</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn-primary flex items-center space-x-2"
              >
                <FiSave />
                <span>{updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
};

export default ShopSettings;