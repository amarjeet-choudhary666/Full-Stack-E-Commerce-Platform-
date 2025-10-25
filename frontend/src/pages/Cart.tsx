import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
import Button from '../components/ui/Button';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

const Cart: React.FC = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your cart.</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart!</p>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId: string) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <Button variant="outline" onClick={handleClearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cart.items.map((item) => (
              <div key={item.product_id._id} className="p-6 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product_id.images[0] || '/placeholder-image.jpg'}
                    alt={item.product_id.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.product_id.name}
                    </h3>
                    <p className="text-gray-600">
                      {formatPrice(item.price)} each
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock: {item.product_id.stock_quantity} available
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(item.product_id._id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      disabled={isLoading}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.product_id._id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      disabled={isLoading || item.quantity >= item.product_id.stock_quantity}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.product_id._id)}
                      className="text-red-600 hover:text-red-800 mt-2"
                      disabled={isLoading}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cart.total_items} items)</span>
                <span className="font-semibold">{formatPrice(cart.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {cart.total_amount > 500 ? 'Free' : formatPrice(50)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18%)</span>
                <span className="font-semibold">
                  {formatPrice(Math.round(cart.total_amount * 0.18))}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  {formatPrice(
                    cart.total_amount + 
                    (cart.total_amount > 500 ? 0 : 50) + 
                    Math.round(cart.total_amount * 0.18)
                  )}
                </span>
              </div>
            </div>

            <Link to="/checkout">
              <Button className="w-full mb-4">
                Proceed to Checkout
              </Button>
            </Link>
            
            <Link to="/products">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;