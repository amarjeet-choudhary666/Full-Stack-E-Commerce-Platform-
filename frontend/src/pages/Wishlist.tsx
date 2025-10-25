import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, calculateDiscount } from '../lib/utils';
import Button from '../components/ui/Button';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your wishlist.</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8">Save items you love to your wishlist!</p>
          <Link to="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      await clearWishlist();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">{wishlist.items.length} items saved</p>
        </div>
        <Button variant="outline" onClick={handleClearWishlist}>
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.items.map((item) => (
          <div
            key={item.product_id._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <Link to={`/products/${item.product_id.slug}`}>
                <img
                  src={item.product_id.images[0] || '/placeholder-image.jpg'}
                  alt={item.product_id.name}
                  className="w-full h-48 object-cover"
                />
              </Link>
              
              {item.product_id.discount_price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  {calculateDiscount(item.product_id.price, item.product_id.discount_price)}% OFF
                </div>
              )}

              <button
                onClick={() => handleRemoveFromWishlist(item.product_id._id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <TrashIcon className="h-5 w-5 text-red-500" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-2">
                <span className="text-xs text-blue-600 font-medium">
                  {item.product_id.category_id.name}
                </span>
              </div>
              
              <Link to={`/products/${item.product_id.slug}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                  {item.product_id.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {item.product_id.discount_price ? (
                    <>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(item.product_id.discount_price)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.product_id.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(item.product_id.price)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  {item.product_id.stock_quantity > 0 ? (
                    `${item.product_id.stock_quantity} in stock`
                  ) : (
                    <span className="text-red-500">Out of stock</span>
                  )}
                </span>
              </div>

              <div>
                {item.product_id.stock_quantity > 0 ? (
                  <Button
                    onClick={() => handleAddToCart(item.product_id._id)}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCartIcon className="h-4 w-4 mr-2" />
                    {isInCart(item.product_id._id) ? 'Added to Cart' : 'Add to Cart'}
                  </Button>
                ) : (
                  <Button disabled className="w-full" size="sm">
                    Out of Stock
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;