import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import { shopService } from '../../services/shopService';
import toast from 'react-hot-toast';

const CreateShop = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
    setIsLoading(true);
    try {
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

      await shopService.create(formData);
      toast.success('Đăng ký cửa hàng thành công! Vui lòng chờ admin duyệt.');
      navigate('/shop-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary-900 mb-2">
            Đăng ký cửa hàng
          </h1>
          <p className="text-primary-600">
            Bắt đầu bán sản phẩm handmade của bạn trên Craftify
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Tên cửa hàng *
              </label>
              <div className="relative">
                <MdStorefront className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  {...register('shopName', {
                    required: 'Tên cửa hàng là bắt buộc',
                    minLength: {
                      value: 3,
                      message: 'Tên cửa hàng phải có ít nhất 3 ký tự',
                    },
                  })}
                  className="input-field pl-10"
                  placeholder="Ví dụ: Handmade by Linh"
                />
              </div>
              {errors.shopName && (
                <p className="mt-1 text-sm text-red-600">{errors.shopName.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Mô tả cửa hàng *
              </label>
              <textarea
                {...register('description', {
                  required: 'Mô tả là bắt buộc',
                  minLength: {
                    value: 20,
                    message: 'Mô tả phải có ít nhất 20 ký tự',
                  },
                })}
                rows={4}
                className="input-field"
                placeholder="Giới thiệu về cửa hàng và sản phẩm của bạn..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Số điện thoại *
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  {...register('phone', {
                    required: 'Số điện thoại là bắt buộc',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Số điện thoại không hợp lệ',
                    },
                  })}
                  className="input-field pl-10"
                  placeholder="0123456789"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="border-t border-primary-200 pt-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                <FiMapPin className="mr-2" />
                Địa chỉ cửa hàng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    {...register('street', { required: 'Địa chỉ là bắt buộc' })}
                    className="input-field"
                    placeholder="Số nhà, tên đường"
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Phường/Xã *
                  </label>
                  <input
                    {...register('ward', { required: 'Phường/Xã là bắt buộc' })}
                    className="input-field"
                  />
                  {errors.ward && (
                    <p className="mt-1 text-sm text-red-600">{errors.ward.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Quận/Huyện *
                  </label>
                  <input
                    {...register('district', { required: 'Quận/Huyện là bắt buộc' })}
                    className="input-field"
                  />
                  {errors.district && (
                    <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    {...register('city', { required: 'Tỉnh/Thành phố là bắt buộc' })}
                    className="input-field"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Images (Optional) */}
            <div className="border-t border-primary-200 pt-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">
                Hình ảnh (Tùy chọn)
              </h3>

              <div className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Avatar cửa hàng
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🏪</span>
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
                    Ảnh bìa cửa hàng
                  </label>
                  <div className="space-y-2">
                    <div className="w-full h-32 rounded bg-primary-100 overflow-hidden flex items-center justify-center">
                      {coverImagePreview ? (
                        <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
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

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng ký cửa hàng'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-outline"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateShop;
