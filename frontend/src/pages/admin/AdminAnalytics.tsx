import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  salesAnalytics: Array<{
    _id: string;
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
  }>;
  topProducts: Array<{
    _id: string;
    productName: string;
    totalQuantitySold: number;
    totalRevenue: number;
    currentStock: number;
  }>;
  customerAnalytics: {
    newCustomers: number;
    activeCustomers: number;
    topCustomers: Array<{
      _id: string;
      userName: string;
      userEmail: string;
      totalSpent: number;
      totalOrders: number;
    }>;
  };
  orderStatusDistribution: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
}

const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [salesResponse, topProductsResponse, customerResponse, orderStatusResponse] = await Promise.all([
        adminAPI.getSalesAnalytics({ period: selectedPeriod }),
        adminAPI.getTopProducts({ period: selectedPeriod, limit: 10 }),
        adminAPI.getCustomerAnalytics({ period: selectedPeriod }),
        adminAPI.getOrderStatusDistribution({ period: selectedPeriod })
      ]);

      setAnalyticsData({
        salesAnalytics: salesResponse.data.data,
        topProducts: topProductsResponse.data.data,
        customerAnalytics: customerResponse.data.data,
        orderStatusDistribution: orderStatusResponse.data.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Analytics</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const totalSales = analyticsData.salesAnalytics.reduce((sum, item) => sum + item.totalSales, 0);
  const totalOrders = analyticsData.salesAnalytics.reduce((sum, item) => sum + item.totalOrders, 0);
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Business insights and performance metrics</p>
        </div>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalSales)}</p>
              <div className="flex items-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              <div className="flex items-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(averageOrderValue)}</p>
              <div className="flex items-center mt-1">
                <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-2.1%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <UsersIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.customerAnalytics.newCustomers}</p>
              <div className="flex items-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
          <div className="space-y-4">
            {analyticsData.topProducts.slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                    <p className="text-xs text-gray-500">{product.totalQuantitySold} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(product.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.currentStock} in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
          <div className="space-y-4">
            {analyticsData.orderStatusDistribution.map((status) => (
              <div key={status._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    status._id === 'delivered' ? 'bg-green-500' :
                    status._id === 'shipped' ? 'bg-blue-500' :
                    status._id === 'pending' ? 'bg-yellow-500' :
                    status._id === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {status._id}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{status.count} orders</p>
                  <p className="text-xs text-gray-500">{formatPrice(status.totalValue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
          <div className="space-y-4">
            {analyticsData.customerAnalytics.topCustomers.slice(0, 5).map((customer, index) => (
              <div key={customer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{customer.userName}</p>
                    <p className="text-xs text-gray-500">{customer.userEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(customer.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customer.totalOrders} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h2>
          <div className="space-y-3">
            {analyticsData.salesAnalytics.slice(-7).map((item, index) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item._id}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">
                    {item.totalOrders} orders
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatPrice(item.totalSales)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;