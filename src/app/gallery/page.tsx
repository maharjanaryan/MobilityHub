// app/components/LandingGallery.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, Heart, Share2 } from 'lucide-react';
import Header from '../component/Header';
import Footer from '../component/Footer';

// Static gallery images - Vehicle themed
const GALLERY_IMAGES = [
  {
    id: 1,
    title: 'Luxury Sports Car',
    category: 'Car',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
    description: 'Sleek sports car on the open road'
  },
  {
    id: 2,
    title: 'Off-Road SUV',
    category: 'SUV',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
    description: 'Powerful SUV conquering rough terrain'
  },
  {
    id: 3,
    title: 'Classic Motorcycle',
    category: 'Bike',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop',
    description: 'Vintage motorcycle in all its glory'
  },
  {
    id: 4,
    title: 'Mountain Bike Adventure',
    category: 'Cycle',
    imageUrl: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&h=600&fit=crop',
    description: 'Mountain bike on a scenic trail'
  },
  {
    id: 5,
    title: 'Electric SUV',
    category: 'SUV',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop',
    description: 'Modern electric SUV with sleek design'
  },
  {
    id: 6,
    title: 'Sport Bike',
    category: 'Bike',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop',
    description: 'High-performance sport bike on the track'
  },
  {
    id: 7,
    title: 'Urban Commuter Cycle',
    category: 'Cycle',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=600&fit=crop',
    description: 'City cycle perfect for commuting'
  },
  {
    id: 8,
    title: 'Luxury Sedan',
    category: 'Car',
    imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
    description: 'Premium sedan with elegance'
  },
  {
    id: 9,
    title: 'Adventure SUV',
    category: 'SUV',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop',
    description: 'SUV ready for off-road adventures'
  },
  {
    id: 10,
    title: 'Cruiser Motorcycle',
    category: 'Bike',
    imageUrl: 'https://images.unsplash.com/photo-1583484875421-a8f44ccb1a76?w=800&h=600&fit=crop',
    description: 'Classic cruiser on the highway'
  },
  {
    id: 11,
    title: 'Road Bike',
    category: 'Cycle',
    imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&h=600&fit=crop',
    description: 'Aerodynamic road bike in action'
  },
  {
    id: 12,
    title: 'Supercar Performance',
    category: 'Car',
    imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
    description: 'Supercar pushing performance limits'
  },
  {
    id: 13,
    title: 'Family SUV',
    category: 'SUV',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
    description: 'Spacious SUV for family adventures'
  },
  {
    id: 14,
    title: 'Dirt Bike',
    category: 'Bike',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop',
    description: 'Dirt bike tackling rough trails'
  },
  {
    id: 15,
    title: 'Electric Cycle',
    category: 'Cycle',
    imageUrl: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&h=600&fit=crop',
    description: 'E-bike for effortless riding'
  },
  {
    id: 16,
    title: 'Vintage Car',
    category: 'Car',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
    description: 'Classic vintage car restoration'
  }
];

const categories = ['All', 'Car', 'SUV', 'Bike', 'Cycle'];

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<typeof GALLERY_IMAGES[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Filter images based on selected category
  const filteredImages = selectedCategory === 'All'
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter(img => img.category === selectedCategory);

  // Lightbox navigation
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  const openLightbox = (image: typeof GALLERY_IMAGES[0]) => {
    const index = filteredImages.findIndex(img => img.id === image.id);
    setSelectedImage(image);
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

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
            <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              🚗 Our Vehicle Gallery
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
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700'
                  }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
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
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                      <span className="text-white/80 text-sm">{image.category}</span>
                    </div>
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                  <span className="text-white text-xs font-medium">{image.category}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Description Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">🚙</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Through the Windshield</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Whether it's the thrill of a sports car, the reliability of an SUV, the freedom of a motorcycle,
              or the sustainability of a bicycle - every vehicle opens up new possibilities for adventure.
              Join us as we explore the world from behind the wheel and handlebars.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-4 font-medium">
              Ready for the ride of your life? 🏍️
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
                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                >
                  <X className="w-8 h-8" />
                </button>

                {/* Navigation Buttons */}
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

                {/* Image */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative max-w-5xl w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative bg-black rounded-2xl overflow-hidden">
                    <img
                      src={filteredImages[currentIndex].imageUrl}
                      alt={filteredImages[currentIndex].title}
                      className="w-full max-h-[80vh] object-contain"
                    />

                    {/* Image Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white text-xl font-semibold">
                            {filteredImages[currentIndex].title}
                          </h3>
                          <p className="text-white/70 text-sm">
                            {filteredImages[currentIndex].category}
                          </p>
                          {filteredImages[currentIndex].description && (
                            <p className="text-white/60 text-sm mt-1 max-w-lg">
                              {filteredImages[currentIndex].description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all">
                            <Heart className="w-5 h-5 text-white" />
                          </button>
                          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all">
                            <Share2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Counter */}
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                    {currentIndex + 1} / {filteredImages.length}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Gallery;