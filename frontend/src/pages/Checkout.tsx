import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addressAPI, orderAPI } from '../lib/api';
import { formatPrice } from '../lib/utils';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Address {
  _id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone?: string;
  is_default: boolean;
  address_type: string;
  landmark?: string;
}

interface CheckoutFormData {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  landmark?: string;
}

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CheckoutFormData>();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!cart || cart.items.length === 0) {
      navigate('/cart');
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, cart, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAddresses();
      setAddresses(response.data.data);
      
      // Select default address if available
      const defaultAddress = response.data.data.find((addr: Address) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddAddress = async (data: CheckoutFormData) => {
    try {
      setIsLoading(true);
      await addressAPI.createAddress({
        ...data,
        country: 'India',
        address_type: 'home'
      });
      
      await fetchAddresses();
      setShowAddressForm(false);
      reset();
      toast.success('Address added successfully');
    } catch (error) {
      toast.error('Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    try {
      setIsLoading(true);
      const response = await orderAPI.createOrder({
        shipping_address_id: selectedAddress,
        payment_method: paymentMethod,
        notes: ''
      });

      toast.success('Order placed successfully!');
      await clearCart();
      navigate(`/orders`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <LoadingSpinner />;
  }

  const subtotal = cart.total_amount;
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                Add New Address
              </Button>
            </div>

            {/* Address Selection */}
            <div className="space-y-3 mb-4">
              {addresses.map((address) => (
                <label
                  key={address._id}
                  className={`block p-4 border rounded-lg cursor-pointer ${
                    selectedAddress === address._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={address._id}
                    checked={selectedAddress === address._id}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {address.address_line1}
                      </p>
                      {address.address_line2 && (
                        <p className="text-gray-600">{address.address_line2}</p>
                      )}
                      <p className="text-gray-600">
                        {address.city}, {address.state} {address.pincode}
                      </p>
                      {address.phone && (
                        <p className="text-gray-600">Phone: {address.phone}</p>
                      )}
                    </div>
                    {address.is_default && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Default
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleSubmit(handleAddAddress)} className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Address Line 1"
                    {...register('address_line1', { required: 'Address is required' })}
                    error={errors.address_line1?.message}
                  />
                  <Input
                    label="Address Line 2 (Optional)"
                    {...register('address_line2')}
                  />
                  <Input
                    label="City"
                    {...register('city', { required: 'City is required' })}
                    error={errors.city?.message}
                  />
                  <Input
                    label="State"
                    {...register('state', { required: 'State is required' })}
                    error={errors.state?.message}
                  />
                  <Input
                    label="Pincode"
                    {...register('pincode', { 
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[1-9][0-9]{5}$/,
                        message: 'Please enter a valid pincode'
                      }
                    })}
                    error={errors.pincode?.message}
                  />
                  <Input
                    label="Phone"
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    error={errors.phone?.message}
                  />
                </div>
                <Input
                  label="Landmark (Optional)"
                  {...register('landmark')}
                />
                <div className="flex space-x-3">
                  <Button type="submit" isLoading={isLoading}>
                    Add Address
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddressForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-gray-300">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-gray-300 opacity-50">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  disabled
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900">Online Payment</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            {/* Order Items */}
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div key={item.product_id._id} className="flex items-center space-x-3">
                  <img
                    src={item.product_id.images[0] || '/placeholder-image.jpg'}
                    alt={item.product_id.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.product_id.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18%)</span>
                <span className="font-semibold">{formatPrice(tax)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              isLoading={isLoading}
              disabled={!selectedAddress}
              className="w-full"
              size="lg"
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;