import React, { useState, useEffect } from 'react';
import { couponAPI } from '../../lib/api';
import { formatPrice, formatDateTime } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { PencilIcon, TrashIcon, PlusIcon, GiftIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  used_count: number;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'inactive' | 'expired';
  created_by: {
    name: string;
  };
}

interface CouponFormData {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  start_date: string;
  expiry_date: string;
}

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CouponFormData>();

  const discountType = watch('discount_type');

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await couponAPI.getAllCoupons({ page: currentPage, limit: 10 });
      setCoupons(response.data.data.coupons);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async (data: CouponFormData) => {
    try {
      await couponAPI.createCoupon(data);
      toast.success('Coupon created successfully');
      setIsModalOpen(false);
      reset();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleUpdateCoupon = async (data: CouponFormData) => {
    if (!editingCoupon) return;
    
    try {
      await couponAPI.updateCoupon(editingCoupon._id, data);
      toast.success('Coupon updated successfully');
      setIsModalOpen(false);
      setEditingCoupon(null);
      reset();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponAPI.deleteCoupon(couponId);
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete coupon');
      }
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    reset({
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase_amount: coupon.min_purchase_amount,
      max_discount_amount: coupon.max_discount_amount,
      usage_limit: coupon.usage_limit,
      start_date: new Date(coupon.start_date).toISOString().split('T')[0],
      expiry_date: new Date(coupon.expiry_date).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600 mt-2">Manage discount coupons and promotions</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Coupon
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coupon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Until
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
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <GiftIcon className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {coupon.code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {coupon.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%` 
                        : formatPrice(coupon.discount_value)
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      Min: {formatPrice(coupon.min_purchase_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {coupon.used_count} / {coupon.usage_limit}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(coupon.expiry_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(coupon.status)}`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(coupon)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCoupon(null);
          reset();
        }}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
      >
        <form onSubmit={handleSubmit(editingCoupon ? handleUpdateCoupon : handleCreateCoupon)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Coupon Code"
              {...register('code', { 
                required: 'Coupon code is required',
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'Code must contain only uppercase letters and numbers'
                }
              })}
              error={errors.code?.message}
              placeholder="SAVE20"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                {...register('discount_type', { required: 'Discount type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          <Input
            label="Description"
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message}
            placeholder="Get 20% off on all products"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`Discount Value ${discountType === 'percentage' ? '(%)' : '(₹)'}`}
              type="number"
              {...register('discount_value', { 
                required: 'Discount value is required',
                min: { value: 1, message: 'Discount value must be at least 1' },
                max: discountType === 'percentage' ? { value: 100, message: 'Percentage cannot exceed 100' } : undefined
              })}
              error={errors.discount_value?.message}
            />

            <Input
              label="Minimum Purchase Amount (₹)"
              type="number"
              {...register('min_purchase_amount', { 
                required: 'Minimum purchase amount is required',
                min: { value: 0, message: 'Amount cannot be negative' }
              })}
              error={errors.min_purchase_amount?.message}
            />
          </div>

          {discountType === 'percentage' && (
            <Input
              label="Maximum Discount Amount (₹) - Optional"
              type="number"
              {...register('max_discount_amount', {
                min: { value: 1, message: 'Amount must be at least 1' }
              })}
              error={errors.max_discount_amount?.message}
            />
          )}

          <Input
            label="Usage Limit"
            type="number"
            {...register('usage_limit', { 
              required: 'Usage limit is required',
              min: { value: 1, message: 'Usage limit must be at least 1' }
            })}
            error={errors.usage_limit?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              {...register('start_date', { required: 'Start date is required' })}
              error={errors.start_date?.message}
            />

            <Input
              label="Expiry Date"
              type="date"
              {...register('expiry_date', { required: 'Expiry date is required' })}
              error={errors.expiry_date?.message}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCoupon(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoupons;