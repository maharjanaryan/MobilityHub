// app/admin/gallery/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Pencil,
  Search
} from 'lucide-react';

interface GalleryImage {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  uploadedBy: {
    id: number;
    username: string;
    fullName: string;
  };
  fileName: string;
  createdAt: string;
}

interface PaginatedResponse {
  content: GalleryImage[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const categories = ['All', 'Car', 'SUV', 'Bike', 'Cycle'];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Car',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchImages();
  }, [currentPage, selectedCategory, searchTerm]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: '50'
      });
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`http://localhost:8080/api/admin/gallery?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setImages(data.content);
      } else {
        console.error('Failed to fetch images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!selectedFile && !editingImage) {
      setError('Please upload an image');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      let imageUrl = '';
      let fileName = '';

      // Upload image first
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedFile);

        const uploadResponse = await fetch('http://localhost:8080/api/admin/gallery/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
          fileName = uploadData.filename;
        } else {
          throw new Error('Failed to upload image');
        }
      } else if (editingImage) {
        // Keep existing image for edit
        imageUrl = editingImage.imageUrl;
        fileName = editingImage.fileName;
      }

      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        imageUrl: imageUrl,
        fileName: fileName
      };

      const url = editingImage
        ? `http://localhost:8080/api/admin/gallery/${editingImage.id}`
        : 'http://localhost:8080/api/admin/gallery';

      const method = editingImage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(editingImage ? 'Image updated successfully!' : 'Image added to gallery successfully!');
        await fetchImages();
        closeModal();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save image');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error saving image:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image from the gallery?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Image deleted successfully!');
        await fetchImages();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete image');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('An error occurred. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openModal = (image?: GalleryImage) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        title: image.title,
        category: image.category,
        description: image.description || '',
      });
      setPreviewUrl(image.imageUrl);
    } else {
      setEditingImage(null);
      setFormData({
        title: '',
        category: 'Car',
        description: '',
      });
      setPreviewUrl('');
      setSelectedFile(null);
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingImage(null);
    setFormData({
      title: '',
      category: 'Car',
      description: '',
    });
    setPreviewUrl('');
    setSelectedFile(null);
    setError('');
    setSuccess('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gallery Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Add and manage images for the public gallery</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
        >
          <Plus className="w-5 h-5" />
          Add New Image
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Gallery Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Images</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{images.length}</p>
        </div>
        {categories.filter(c => c !== 'All').map(cat => (
          <div key={cat} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{cat}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {images.filter(img => img.category === cat).length}
            </p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Image List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No images found</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {searchTerm || selectedCategory !== 'All'
              ? 'Try adjusting your filters'
              : 'Click "Add New Image" to upload your first image'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {images.map((image, index) => (
                  <motion.tr
                    key={image.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{image.title}</p>
                        {image.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {image.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        {image.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {image.uploadedBy?.fullName || 'Admin'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={image.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          title="View image"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openModal(image)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit image"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingImage ? 'Edit Image' : 'Add New Image'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {editingImage ? 'Change Image (Optional)' : 'Upload Image *'}
                  </label>
                  <div
                    className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Upload className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">Click to upload image</p>
                        <p className="text-xs mt-1">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  {editingImage && !selectedFile && (
                    <p className="text-xs text-gray-500 mt-2">Leave empty to keep current image</p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter image title (e.g., Luxury Sports Car)"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  >
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Bike">Bike</option>
                    <option value="Cycle">Cycle</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Add a brief description of the image..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {editingImage ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        {editingImage ? 'Update Image' : 'Add to Gallery'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}