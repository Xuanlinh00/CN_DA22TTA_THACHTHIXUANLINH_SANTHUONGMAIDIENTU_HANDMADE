import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shopService } from '../../services/shopService';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../common/Loading';
import { FiRefreshCw } from 'react-icons/fi';

const ShopRevenueChart = () => {
  const [period, setPeriod] = useState('month'); // 'month' or 'week'
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: revenueData, isLoading, error, refetch } = useQuery({
    queryKey: ['shop-monthly-revenue'],
    queryFn: shopService.getMonthlyRevenue,
  });

  const { data: dailyData } = useQuery({
    queryKey: ['shop-daily-revenue', selectedYear, selectedMonth],
    queryFn: () => shopService.getDailyRevenue(selectedYear, selectedMonth),
    enabled: period === 'week'
  });

  const monthlyData = revenueData?.data || [];
  const dayData = dailyData?.data || [];

  const getMonthName = (monthIndex) => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return months[monthIndex];
  };

  const getWeekData = () => {
    if (dayData.length === 0) return [];
    
    // Chia dữ liệu ngày thành 4 tuần
    const weeks = [[], [], [], []];
    dayData.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);
      if (weekIndex < 4) {
        weeks[weekIndex].push(day);
      }
    });

    return weeks.map((weekDays, weekIndex) => {
      const revenue = weekDays.reduce((sum, day) => sum + (day.revenue || 0), 0);
      const orders = weekDays.reduce((sum, day) => sum + (day.orders || 0), 0);
      return {
        week: weekIndex + 1,
        revenue,
        orders
      };
    });
  };

  const months = Array.from({ length: 12 }, (_, i) => i);
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);
  const displayData = period === 'month' ? monthlyData : getWeekData();
  const maxOrders = Math.max(...displayData.map(d => d.orders || 0), 1);

  const currentPeriodTotal = displayData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const currentPeriodOrders = displayData.reduce((sum, d) => sum + (d.orders || 0), 0);
  const avgRevenue = currentPeriodTotal / (displayData.length || 1);

  // Calculate growth trend
  const firstHalf = displayData.slice(0, Math.floor(displayData.length / 2));
  const secondHalf = displayData.slice(Math.floor(displayData.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.revenue, 0) / (firstHalf.length || 1);
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.revenue, 0) / (secondHalf.length || 1);
  const growthTrend = ((secondHalfAvg - firstHalfAvg) / (firstHalfAvg || 1)) * 100;

  const getLabel = (index) => {
    if (period === 'month') {
      return getMonthName(index);
    } else {
      return `Tuần ${index + 1}`;
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-bold text-primary-900 mb-6">
          📊 Doanh thu
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-bold text-primary-900 mb-6">
          📊 Doanh thu
        </h2>
        <div className="text-center py-12 text-red-600">
          <p>Lỗi tải dữ liệu: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-primary-900">📊 Doanh thu</h2>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          title="Cập nhật dữ liệu"
        >
          <FiRefreshCw size={18} className="text-primary-700" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              period === 'month'
                ? 'bg-primary-700 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            Theo tháng
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              period === 'week'
                ? 'bg-primary-700 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            Theo tuần
          </button>
        </div>

        {/* Month & Year Selector for Week View */}
        {period === 'week' && (
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-primary-300 rounded text-sm"
            >
              {months.map(month => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-primary-300 rounded text-sm"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {displayData.length === 0 ? (
        <div className="text-center py-12 text-primary-600">
          <p>Chưa có dữ liệu doanh thu. Hãy hoàn thành một số đơn hàng để xem biểu đồ.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-semibold mb-1">💰 TỔNG DOANH THU</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(currentPeriodTotal)}
              </p>
              <p className="text-xs text-blue-600 mt-2">Trong {period === 'month' ? '12 tháng' : '4 tuần'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 font-semibold mb-1">📈 TRUNG BÌNH/KỲ</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(avgRevenue)}
              </p>
              <p className="text-xs text-green-600 mt-2">Doanh thu bình quân</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 font-semibold mb-1">📦 TỔNG ĐƠN HÀNG</p>
              <p className="text-2xl font-bold text-purple-600">
                {currentPeriodOrders}
              </p>
              <p className="text-xs text-purple-600 mt-2">Số đơn hàng hoàn thành</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg p-6 border border-primary-200 overflow-x-auto">
            {/* Legend */}
            <div className="flex gap-6 mb-6 pb-4 border-b border-primary-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-accent-500 to-accent-400 rounded"></div>
                <span className="text-xs text-primary-600 font-medium">Số đơn hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span className="text-xs text-primary-600 font-medium">Doanh thu</span>
              </div>
            </div>

            {/* Chart Container */}
            <div style={{ minWidth: period === 'month' ? '800px' : '600px' }}>
              <div className="flex gap-8" style={{ height: '280px' }}>
                {/* Y-axis */}
                <div className="flex flex-col justify-between text-xs text-primary-600 font-medium pr-4 border-r border-primary-200 w-10 flex-shrink-0">
                  <span className="text-right">{maxOrders}</span>
                  <span className="text-right">{Math.floor(maxOrders * 0.75)}</span>
                  <span className="text-right">{Math.floor(maxOrders * 0.5)}</span>
                  <span className="text-right">{Math.floor(maxOrders * 0.25)}</span>
                  <span className="text-right">0</span>
                </div>

                {/* Bars */}
                <div className="flex items-end justify-around flex-1 pb-8 gap-3">
                  {displayData.map((data, index) => {
                    const barHeight = (data.orders / maxOrders) * 100;
                    return (
                      <div key={index} className="flex flex-col items-center group flex-1">
                        {/* Bar Container - Fixed height with baseline alignment */}
                        <div className="relative w-full flex flex-col justify-end items-center" style={{ height: '200px' }}>
                          <div
                            className="w-8 bg-gradient-to-t from-accent-500 to-accent-400 rounded-t hover:from-accent-600 hover:to-accent-500 transition-all duration-200 cursor-pointer shadow-md"
                            style={{ height: `${barHeight}%` }}
                          >
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none font-semibold">
                              {data.orders} đơn
                            </div>
                          </div>
                        </div>
                        
                        {/* Labels */}
                        <p className="text-xs font-bold text-primary-900 mt-2">{getLabel(index)}</p>
                        <p className="text-xs text-blue-600 font-semibold mt-1">{formatCurrency(data.revenue)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis Label */}
              <div className="text-center text-xs text-primary-600 font-medium mt-4">
                {period === 'month' ? 'Tháng' : 'Tuần'}
              </div>
            </div>
          </div>

          {/* Summary & Analysis */}
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
            <p className="text-xs text-primary-700 mb-2">
              <span className="font-semibold">📊 Phân tích:</span> Doanh thu trung bình mỗi {period === 'month' ? 'tháng' : 'tuần'} là <span className="text-blue-600 font-bold">{formatCurrency(avgRevenue)}</span> từ <span className="text-purple-600 font-bold">{Math.floor(currentPeriodOrders / (displayData.length || 1))}</span> đơn hàng/{period === 'month' ? 'tháng' : 'tuần'}.
            </p>
            <p className="text-xs text-primary-700">
              <span className="font-semibold">📈 Xu hướng:</span> {growthTrend > 0 ? (
                <span className="text-green-600 font-bold">Tăng {growthTrend.toFixed(1)}% ↑</span>
              ) : (
                <span className="text-red-600 font-bold">Giảm {Math.abs(growthTrend).toFixed(1)}% ↓</span>
              )} so với giai đoạn trước.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopRevenueChart;
