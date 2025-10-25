import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, reviewAPI } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { formatPrice, calculateDiscount } from '../lib/utils';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon,
  MinusIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number;
  images: string[];
  stock_quantity: number;
  status: string;
  specifications?: Record<string, any>;
  category_id: {
    name: string;
    slug: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const [productResponse, reviewStatsResponse] = await Promise.all([
        productAPI.getProduct(slug!),
        reviewAPI.getReviewStats(slug!).catch(() => null)
      ]);
      
      setProduct(productResponse.data.data);
      if (reviewStatsResponse) {
        setReviewStats(reviewStatsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product._id, quantity);
    }
  };

  const handleWishlistToggle = async () => {
    if (product) {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < Math.floor(rating) ? (
          <StarSolidIcon className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarIcon className="h-5 w-5 text-gray-300" />
        )}
      </span>
    ));
  };

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
            <Link to="/products" className="text-gray-400 hover:text-gray-500">
              Products
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <Link 
              to={`/categories/${product.category_id.slug}`} 
              className="text-gray-400 hover:text-gray-500"
            >
              {product.category_id.name}
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li className="text-gray-900 font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={product.images[selectedImage] || '/placeholder-image.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <Link 
              to={`/categories/${product.category_id.slug}`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {product.category_id.name}
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          {reviewStats && reviewStats.totalReviews > 0 && (
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(reviewStats.averageRating)}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            {product.discount_price ? (
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(product.discount_price)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                  {calculateDiscount(product.price, product.discount_price)}% OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock_quantity > 0 ? (
              <span className="text-green-600 font-medium">
                ✓ In Stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                ✗ Out of Stock
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock_quantity > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="text-lg font-semibold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  disabled={quantity >= product.stock_quantity}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            {product.stock_quantity > 0 ? (
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                size="lg"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                {isInCart(product._id) ? 'Added to Cart' : 'Add to Cart'}
              </Button>
            ) : (
              <Button disabled className="flex-1" size="lg">
                Out of Stock
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleWishlistToggle}
              size="lg"
            >
              {isInWishlist(product._id) ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="font-medium text-gray-900">{key}:</dt>
                      <dd className="text-gray-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;