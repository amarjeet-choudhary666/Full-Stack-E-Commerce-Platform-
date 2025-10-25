import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../lib/api';
import { formatPrice, calculateDiscount } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const CategoryProducts: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    try {
      setIsLoading(true);
      const [categoryResponse, productsResponse] = await Promise.all([
        categoryAPI.getCategory(slug!),
        productAPI.getProductsByCategory(slug!, { limit: 20 })
      ]);
      
      setCategory(categoryResponse.data.data);
      setProducts(productsResponse.data.data.products);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h2>
          <Link to="/categories">
            <Button>Back to Categories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              Home
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <Link to="/categories" className="text-gray-400 hover:text-gray-500">
              Categories
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li className="text-gray-900 font-medium">
            {category.name}
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        <p className="text-gray-600 mt-2">
          {products.length} products found
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found in this category.</p>
          <Link to="/categories" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Browse other categories
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

export default CategoryProducts;