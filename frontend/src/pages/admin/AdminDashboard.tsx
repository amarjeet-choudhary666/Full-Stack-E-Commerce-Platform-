import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  UsersIcon,
  ShoppingBagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  totalCustomers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalSales: number;
  averageOrderValue: number;
  recentOrders: any[];
  lowStockProducts: any[];
  dailySales: any[];
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getDashboardOverview();
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Sales',
      value: formatPrice(dashboardData.totalSales),
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Orders',
      value: dashboardData.totalOrders.toString(),
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Products',
      value: dashboardData.totalProducts.toString(),
      icon: CubeIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Customers',
      value: dashboardData.totalCustomers.toString(),
      icon: UsersIcon,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your e-commerce admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {order.status === 'delivered' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : order.status === 'shipped' ? (
                        <TruckIcon className="h-5 w-5 text-blue-500" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.order_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user_id?.name || 'Unknown Customer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(order.final_amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            Low Stock Alerts
          </h2>
          <div className="space-y-4">
            {dashboardData.lowStockProducts.length > 0 ? (
              dashboardData.lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.images?.[0] || '/placeholder-image.jpg'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">
                      {product.stock_quantity} left
                    </p>
                    <p className="text-xs text-gray-500">{product.category_id?.name}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">All products are well stocked</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
            <CubeIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">Add Product</p>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
            <ShoppingBagIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">View Orders</p>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
            <UsersIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-900">Manage Users</p>
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
            <CurrencyDollarIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-900">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;