import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../lib/api';
import { formatPrice, calculateDiscount } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

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

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const searchQuery = searchParams.get('q');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let response;
        
        if (searchQuery) {
          response = await productAPI.searchProducts({ q: searchQuery, limit: 20 });
        } else {
          response = await productAPI.getProducts({ limit: 20 });
        }
        
        setProducts(response.data.data.products || response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
        </h1>
        <p className="text-gray-600 mt-2">
          {products.length} products found
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Go back to homepage
          </Link>
        </div>
      ) : (
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
                
                {product.discount_price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    {calculateDiscount(product.price, product.discount_price)}% OFF
                  </div>
                )}

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

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {product.stock_quantity > 0 ? (
                      `${product.stock_quantity} in stock`
                    ) : (
                      <span className="text-red-500">Out of stock</span>
                    )}
                  </span>
                </div>

                <div>
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
      )}
    </div>
  );
};

export default Products;