import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiPhone, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

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
    // Kiểm tra đã đồng ý chính sách
    if (!agreedToPolicy) {
      toast.error('Vui lòng đồng ý với chính sách hoa hồng để tiếp tục');
      return;
    }

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
          <h1 className="text-4xl font-sans font-bold text-primary-900 mb-2">
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

            {/* Commission Policy */}
            <div className="border-t border-primary-200 pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                {/* Policy Header */}
                <button
                  type="button"
                  onClick={() => setShowPolicyDetails(!showPolicyDetails)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div className="text-left">
                      <h3 className="font-semibold text-primary-900">Chính sách hoa hồng Craftify</h3>
                      <p className="text-sm text-primary-600">Nhấp để xem chi tiết</p>
                    </div>
                  </div>
                  {showPolicyDetails ? (
                    <FiChevronUp size={20} className="text-primary-600" />
                  ) : (
                    <FiChevronDown size={20} className="text-primary-600" />
                  )}
                </button>

                {/* Policy Details */}
                {showPolicyDetails && (
                  <div className="px-6 py-4 bg-white border-t border-blue-200 space-y-4 text-sm text-primary-700">
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-2">💰 Tỷ lệ hoa hồng</h4>
                      <p>Craftify sẽ thu hoa hồng <span className="font-bold text-accent-600">5%</span> từ doanh thu (giá sản phẩm) của mỗi đơn hàng hoàn thành.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-2">📊 Cách tính</h4>
                      <p>Hoa hồng = Tổng tiền hàng × 5%</p>
                      <p className="text-xs text-primary-600 mt-1">Ví dụ: Nếu bạn bán sản phẩm 100.000đ, Craftify sẽ thu 5.000đ</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-2">✅ Khi nào tính hoa hồng</h4>
                      <p>Hoa hồng chỉ được tính khi đơn hàng đã được giao thành công cho khách hàng.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-2">🚚 Phí vận chuyển</h4>
                      <p>Phí vận chuyển không tính vào hoa hồng. Bạn sẽ nhận toàn bộ phí vận chuyển từ khách hàng.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-2">💳 Thanh toán</h4>
                      <p>Doanh thu sau khi trừ hoa hồng sẽ được chuyển vào tài khoản ngân hàng của bạn hàng tháng.</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">⚠️ Lưu ý:</span> Bằng cách đăng ký cửa hàng, bạn đồng ý với chính sách hoa hồng này. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Agreement Checkbox */}
              <div className="mt-4 flex items-start gap-3 p-4 bg-primary-50 rounded-lg">
                <input
                  type="checkbox"
                  id="policy-agreement"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-primary-300 cursor-pointer"
                />
                <label htmlFor="policy-agreement" className="flex-1 cursor-pointer">
                  <p className="text-sm text-primary-900">
                    <span className="font-semibold">Tôi đồng ý</span> với chính sách hoa hồng 5% của Craftify và hiểu rằng hoa hồng sẽ được tính từ doanh thu của mỗi đơn hàng hoàn thành.
                  </p>
                </label>
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
