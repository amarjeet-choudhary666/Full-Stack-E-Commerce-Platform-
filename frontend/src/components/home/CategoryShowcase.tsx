import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../../lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

const CategoryShowcase: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        const response = await categoryAPI.getPopularCategories({ limit: 6 });
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600">Explore our wide range of product categories</p>
          </div>
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600">Explore our wide range of product categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/categories/${category.slug}`}
              className="group text-center"
            >
              <div className="relative overflow-hidden rounded-full w-24 h-24 mx-auto mb-4 bg-gray-100 group-hover:shadow-lg transition-shadow">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                    <span className="text-white font-bold text-lg">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {category.productCount} products
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/categories"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Categories
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;