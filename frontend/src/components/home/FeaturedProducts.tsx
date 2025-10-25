import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../lib/api';
import { formatPrice, calculateDiscount } from '../../lib/utils';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  images: string[];
  stock_quantity: number;
  status: string;
  category_id: {
    name: string;
    slug: string;
  };
}

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productAPI.getFeaturedProducts({ limit: 8 });
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        toast.error('Failed to load featured products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const handleWishlistToggle = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600">Discover our handpicked selection of amazing products</p>
          </div>
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover our handpicked selection of amazing products</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative">
                <Link to={`/products/${product.slug}`}>
                  <img
                    src={product.images[0] || '/placeholder-image.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* Discount Badge */}
                {product.discount_price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    {calculateDiscount(product.price, product.discount_price)}% OFF
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={() => handleWishlistToggle(product._id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  {isInWishlist(product._id) ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-blue-600 font-medium">
                    {product.category_id.name}
                  </span>
                </div>
                
                <Link to={`/products/${product.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {product.discount_price ? (
                      <>
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(product.discount_price)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {product.stock_quantity > 0 ? (
                      `${product.stock_quantity} in stock`
                    ) : (
                      <span className="text-red-500">Out of stock</span>
                    )}
                  </span>
                </div>

                <div className="mt-4">
                  {product.stock_quantity > 0 ? (
                    <Button
                      onClick={() => handleAddToCart(product._id)}
                      className="w-full"
                      size="sm"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      {isInCart(product._id) ? 'Added to Cart' : 'Add to Cart'}
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

        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;