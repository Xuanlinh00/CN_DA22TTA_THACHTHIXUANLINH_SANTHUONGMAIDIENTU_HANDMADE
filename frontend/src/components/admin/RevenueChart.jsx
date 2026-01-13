import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

const RevenueChart = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [period, setPeriod] = useState('month'); // 'month' or 'week'
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  const { data: revenueData } = useQuery({
    queryKey: ['admin-monthly-revenue', selectedYear],
    queryFn: () => adminService.getMonthlyRevenue(selectedYear),
  });

  const { data: dailyData } = useQuery({
    queryKey: ['admin-daily-revenue', selectedYear, selectedMonth],
    queryFn: () => adminService.getDailyRevenue(selectedYear, selectedMonth),
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

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const displayData = period === 'month' ? monthlyData : getWeekData();
  const maxRevenue = Math.max(...displayData.map(d => d.revenue || 0), 1);
  const maxOrders = Math.max(...displayData.map(d => d.orders || 0), 1);

  const currentPeriodTotal = displayData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const currentPeriodOrders = displayData.reduce((sum, d) => sum + (d.orders || 0), 0);

  const getLabel = (index) => {
    if (period === 'month') {
      return getMonthName(index);
    } else {
      return `Tuần ${index + 1}`;
    }
  };

  // Tính tỷ lệ để chuẩn hóa hai trục
  const revenueScale = maxRevenue / 100;
  const ordersScale = maxOrders / 100;

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-primary-900">📊 Thống kê doanh thu</h2>
          <p className="text-xs text-primary-500 mt-1">Năm {selectedYear}</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 border border-primary-300 rounded text-sm font-medium"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Period Selection */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
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

        {/* Month Selector for Week View */}
        {period === 'week' && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 border border-primary-300 rounded text-sm"
          >
            {months.map(month => (
              <option key={month} value={month}>
                Tháng {getMonthName(month)} {selectedYear}
              </option>
            ))}
          </select>
        )}
      </div>

      {displayData.length === 0 ? (
        <p className="text-center text-primary-600 py-12">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-semibold mb-1">💰 TỔNG DOANH THU</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentPeriodTotal)}</p>
              <p className="text-xs text-blue-600 mt-2">Trong {period === 'month' ? '12 tháng' : '4 tuần'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 font-semibold mb-1">📈 TRUNG BÌNH/KỲ</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(currentPeriodTotal / (displayData.length || 1))}</p>
              <p className="text-xs text-green-600 mt-2">Doanh thu bình quân</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 font-semibold mb-1">📦 TỔNG ĐƠN HÀNG</p>
              <p className="text-2xl font-bold text-purple-600">{currentPeriodOrders}</p>
              <p className="text-xs text-purple-600 mt-2">Số đơn hàng hoàn thành</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg p-6 border border-primary-200 overflow-x-auto">
            {/* Legend */}
            <div className="flex gap-6 mb-6 pb-4 border-b border-primary-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
                <span className="text-xs text-primary-600 font-medium">Doanh thu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-accent-500 to-accent-400 rounded"></div>
                <span className="text-xs text-primary-600 font-medium">Số đơn hàng</span>
              </div>
            </div>

            {/* Chart Container */}
            <div style={{ minWidth: period === 'month' ? '800px' : '600px' }}>
              <div className="flex gap-8" style={{ height: '280px' }}>
                {/* Y-axis */}
                <div className="flex flex-col justify-between text-xs text-primary-600 font-medium pr-4 border-r border-primary-200 w-16 flex-shrink-0">
                  <span className="text-right">{formatCurrency(maxRevenue)}</span>
                  <span className="text-right">{formatCurrency(maxRevenue * 0.75)}</span>
                  <span className="text-right">{formatCurrency(maxRevenue * 0.5)}</span>
                  <span className="text-right">{formatCurrency(maxRevenue * 0.25)}</span>
                  <span className="text-right">0 ₫</span>
                </div>

                {/* Bars */}
                <div className="flex items-end justify-around flex-1 gap-4" style={{ alignItems: 'flex-end' }}>
                  {displayData.map((data, index) => {
                    const revenueHeight = (data.revenue / maxRevenue) * 100;
                    const ordersHeight = (data.orders / maxOrders) * 100;
                    return (
                      <div key={index} className="flex flex-col items-center group flex-1" style={{ height: '200px', justifyContent: 'flex-end' }}>
                        {/* Bars Container */}
                        <div className="relative w-full flex justify-center gap-1" style={{ height: '200px', display: 'flex', alignItems: 'flex-end' }}>
                          {/* Revenue Bar */}
                          <div
                            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-all duration-200 cursor-pointer shadow-md relative group/revenue"
                            style={{ height: `${revenueHeight}%` }}
                            title={`Doanh thu: ${formatCurrency(data.revenue)}`}
                          >
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 group-hover/revenue:opacity-100 transition-opacity z-10 pointer-events-none font-semibold">
                              💰 {formatCurrency(data.revenue)}
                            </div>
                          </div>

                          {/* Orders Bar */}
                          <div
                            className="flex-1 bg-gradient-to-t from-accent-500 to-accent-400 rounded-t hover:from-accent-600 hover:to-accent-500 transition-all duration-200 cursor-pointer shadow-md relative group/orders"
                            style={{ height: `${ordersHeight}%` }}
                            title={`Đơn hàng: ${data.orders}`}
                          >
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-primary-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 group-hover/orders:opacity-100 transition-opacity z-10 pointer-events-none font-semibold">
                              📦 {data.orders} đơn
                            </div>
                          </div>
                        </div>
                        
                        {/* Labels Below X-axis */}
                        <div className="text-center mt-3 w-full">
                          <p className="text-xs font-bold text-primary-900">{getLabel(index)}</p>
                          <p className="text-xs text-blue-600 font-semibold">{formatCurrency(data.revenue)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
            <p className="text-xs text-primary-700">
              <span className="font-semibold">📊 Phân tích:</span> Doanh thu trung bình mỗi {period === 'month' ? 'tháng' : 'tuần'} là <span className="text-blue-600 font-bold">{formatCurrency(currentPeriodTotal / (displayData.length || 1))}</span> từ <span className="text-purple-600 font-bold">{currentPeriodOrders}</span> đơn hàng.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
