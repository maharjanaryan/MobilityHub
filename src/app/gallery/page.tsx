// app/components/LandingGallery.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, Heart, Share2, Check, Link } from 'lucide-react';
import Header from '../component/Header';
import Footer from '../component/Footer';

interface GalleryImage {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
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

export default function LandingGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: '0',
        size: '50'
      });
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`http://localhost:8080/api/gallery/public?${params}`);
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setImages(data.content);
      } else {
        console.error('Failed to fetch images:', response.status);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openLightbox = (image: GalleryImage) => {
    const index = images.findIndex(img => img.id === image.id);
    setSelectedImage(image);
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
    setShowSharePopup(false);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'auto';
    setShowSharePopup(false);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
    setShowSharePopup(false);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
    setShowSharePopup(false);
  };

  const handleShare = async (image: GalleryImage) => {
    const shareUrl = image.imageUrl;

    // Check if Web Share API is available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: `Check out this ${image.category}: ${image.title}`,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setShowSharePopup(true);
      setTimeout(() => {
        setShareCopied(false);
        setShowSharePopup(false);
      }, 3000);
    } catch (error) {
      // If clipboard fails, show the link in a prompt
      const userInput = prompt('Copy this link to share:', shareUrl);
      if (userInput !== null) {
        setShowSharePopup(true);
        setTimeout(() => setShowSharePopup(false), 2000);
      }
    }
  };

  const handleShareLightbox = async () => {
    if (!selectedImage) return;
    await handleShare(selectedImage);
  };

  const handleLike = (image: GalleryImage) => {
    // You can implement like functionality here
    console.log('Liked:', image.title);
  };

  return (
    <>
      <Header />
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
              Our Vehicle Gallery
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Wheels of the World
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Exploring the world through different vehicles - from sleek cars to rugged SUVs,
              powerful bikes to eco-friendly cycles. Every ride tells a unique story.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700'
                  }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400">No images found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => openLightbox(image)}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                        <span className="text-white/80 text-sm">{image.category}</span>
                      </div>
                      <button
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(image);
                        }}
                      >
                        <Share2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                    <span className="text-white text-xs font-medium">{image.category}</span>
                  </div>

                  {/* Share Popup */}
                  {showSharePopup && (
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 z-20">
                      {shareCopied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          Link copied!
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4" />
                          Share link copied!
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Description Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl"></span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Through the Windshield</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Whether it's the thrill of a sports car, the reliability of an SUV, the freedom of a motorcycle,
              or the sustainability of a bicycle - every vehicle opens up new possibilities for adventure.
              Join us as we explore the world from behind the wheel and handlebars.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-4 font-medium">
              Ready for the ride of your life?
            </p>
          </motion.div>

          {/* Lightbox Modal */}
          <AnimatePresence>
            {isLightboxOpen && selectedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                onClick={closeLightbox}
              >
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                >
                  <X className="w-8 h-8" />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative max-w-5xl w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative bg-black rounded-2xl overflow-hidden">
                    <img
                      src={selectedImage.imageUrl}
                      alt={selectedImage.title}
                      className="w-full max-h-[80vh] object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                        e.currentTarget.onerror = null;
                      }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white text-xl font-semibold">
                            {selectedImage.title}
                          </h3>
                          <p className="text-white/70 text-sm">
                            {selectedImage.category}
                          </p>
                          {selectedImage.description && (
                            <p className="text-white/60 text-sm mt-1 max-w-lg">
                              {selectedImage.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(selectedImage);
                            }}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                          >
                            <Heart className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareLightbox();
                            }}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                          >
                            <Share2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                    {currentIndex + 1} / {images.length}
                  </div>

                  {/* Share Popup in Lightbox */}
                  {showSharePopup && (
                    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                      {shareCopied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          Link copied!
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4" />
                          Share link copied!
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </>
  );
}