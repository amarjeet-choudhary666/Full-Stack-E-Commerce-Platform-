import React, { useState, useEffect } from 'react';
import { authAPI, orderAPI } from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { EyeIcon, UserIcon } from '@heroicons/react/24/outline';

interface Customer {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'blocked';
  isEmailVerified: boolean;
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      // Since we don't have a specific customers endpoint, we'll simulate it
      // In a real app, you'd have an admin endpoint to get all customers
      const mockCustomers: Customer[] = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active',
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          orderCount: 5,
          totalSpent: 2500
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          status: 'active',
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          orderCount: 3,
          totalSpent: 1200
        }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    try {
      // Fetch customer orders
      const response = await orderAPI.getAllOrders({ user_id: customer._id });
      setCustomerOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setCustomerOrders([]);
    }
  };

  const handleBlockCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to block this customer?')) {
      try {
        // In a real app, you'd have an endpoint to block/unblock customers
        console.log('Block customer:', customerId);
        fetchCustomers();
      } catch (error) {
        console.error('Error blocking customer:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage customer accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customers List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              Joined {formatDateTime(customer.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.orderCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{customer.totalSpent || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.status}
                        </span>
                        {customer.isEmailVerified && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewCustomer(customer)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockCustomer(customer._id)}
                            className={customer.status === 'blocked' ? 'text-green-600' : 'text-red-600'}
                          >
                            {customer.status === 'blocked' ? 'Unblock' : 'Block'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{selectedCustomer.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedCustomer.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className={`font-medium ${
                    selectedCustomer.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedCustomer.status}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Verified</label>
                  <p className={`font-medium ${
                    selectedCustomer.isEmailVerified ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedCustomer.isEmailVerified ? 'Yes' : 'No'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-gray-900">{formatDateTime(selectedCustomer.createdAt)}</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Recent Orders</h3>
                {customerOrders.length > 0 ? (
                  <div className="space-y-2">
                    {customerOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">#{order.order_number}</span>
                          <span className="text-sm text-gray-500">₹{order.final_amount}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDateTime(order.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No orders found</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6">
              <p className="text-gray-500 text-center">Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;