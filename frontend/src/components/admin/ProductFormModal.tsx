import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { productAPI, categoryAPI } from '../../lib/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  price: number;
  discount_price?: number;
  category_id: string;
  stock_quantity: number;
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProductFormData>();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (product) {
        reset({
          name: product.name,
          sku: product.sku,
          description: product.description,
          price: product.price,
          discount_price: product.discount_price,
          category_id: product.category_id._id || product.category_id,
          stock_quantity: product.stock_quantity,
          featured: product.featured,
          meta_title: product.meta_title,
          meta_description: product.meta_description
        });
      } else {
        reset();
      }
    }
  }, [isOpen, product, reset]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add images if selected
      if (selectedImages) {
        Array.from(selectedImages).forEach((file) => {
          formData.append('images', file);
        });
      }

      if (product) {
        await productAPI.updateProduct(product._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.createProduct(formData);
        toast.success('Product created successfully');
      }

      onSuccess();
      onClose();
      reset();
      setSelectedImages(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedImages(e.target.files);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Product Name"
            {...register('name', { required: 'Product name is required' })}
            error={errors.name?.message}
          />
          
          <Input
            label="SKU"
            {...register('sku', { required: 'SKU is required' })}
            error={errors.sku?.message}
            placeholder="PROD001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Product description..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Price (₹)"
            type="number"
            step="0.01"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' }
            })}
            error={errors.price?.message}
          />
          
          <Input
            label="Discount Price (₹) - Optional"
            type="number"
            step="0.01"
            {...register('discount_price', {
              min: { value: 0, message: 'Discount price must be positive' }
            })}
            error={errors.discount_price?.message}
          />
          
          <Input
            label="Stock Quantity"
            type="number"
            {...register('stock_quantity', { 
              required: 'Stock quantity is required',
              min: { value: 0, message: 'Stock cannot be negative' }
            })}
            error={errors.stock_quantity?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            {...register('category_id', { required: 'Category is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Select up to 5 images. Supported formats: JPG, PNG, WebP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Meta Title (SEO)"
            {...register('meta_title')}
            error={errors.meta_title?.message}
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              {...register('featured')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Featured Product
            </label>
          </div>
        </div>

        <Input
          label="Meta Description (SEO)"
          {...register('meta_description')}
          error={errors.meta_description?.message}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;