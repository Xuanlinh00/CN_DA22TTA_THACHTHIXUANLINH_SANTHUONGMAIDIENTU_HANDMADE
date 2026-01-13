import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

const CommissionChart = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Tạo danh sách năm từ 2020 đến năm hiện tại
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i).reverse();
  
  const { data: revenueData } = useQuery({
    queryKey: ['admin-monthly-revenue', selectedYear],
    queryFn: () => adminService.getMonthlyRevenue(selectedYear),
  });

  const monthlyData = revenueData?.data || [];
  const COMMISSION_RATE = 0.05; // 5%

  const getMonthName = (monthIndex) => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return months[monthIndex];
  };

  const maxCommission = Math.max(...monthlyData.map(d => d.commission || 0), 1);
  const totalRevenue = monthlyData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalCommission = monthlyData.reduce((sum, d) => sum + (d.commission || 0), 0);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-primary-900">💵 Hoa hồng ({(COMMISSION_RATE * 100).toFixed(0)}%)</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-primary-300 rounded-lg bg-white text-primary-900 font-semibold hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              Năm {year}
            </option>
          ))}
        </select>
      </div>

      {monthlyData.length === 0 ? (
        <p className="text-center text-primary-600 py-8">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-orange-50 p-3 rounded text-center">
              <p className="text-xs text-primary-600">Tổng hoa hồng</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(totalCommission)}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded text-center">
              <p className="text-xs text-primary-600">Trung bình/tháng</p>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(totalCommission / 12)}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded text-center">
              <p className="text-xs text-primary-600">Tổng doanh thu</p>
              <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="flex items-end justify-between gap-1 h-48">
            {monthlyData.map((data, index) => {
              const commission = data.commission || 0;
              const barHeight = (commission / maxCommission) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full flex justify-center h-40">
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer group"
                      style={{ height: `${barHeight}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {formatCurrency(commission)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-primary-700 mt-2">{getMonthName(index)}</p>
                  <p className="text-xs text-primary-500">{formatCurrency(data.revenue)}</p>
                </div>
              );
            })}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-900">
            <strong>ℹ️</strong> Hoa hồng = {(COMMISSION_RATE * 100).toFixed(0)}% doanh thu từ các đơn hàng đã giao
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionChart;
