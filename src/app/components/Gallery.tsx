import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  filename: string | null;
  sort_order: number;
}

const DEFAULT_IMAGES: GalleryImage[] = [
  { id: "d1", url: "https://images.unsplash.com/photo-1770364292936-1800aa621b3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", caption: "Annual Business Summit 2025", filename: null, sort_order: 0 },
  { id: "d2", url: "https://images.unsplash.com/photo-1747674148491-51f8a5c723db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", caption: "Leadership Seminar", filename: null, sort_order: 1 },
  { id: "d3", url: "https://images.unsplash.com/photo-1768796370407-6d36619e7d6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", caption: "Workshop on Entrepreneurship", filename: null, sort_order: 2 },
  { id: "d4", url: "https://images.unsplash.com/photo-1696798559340-ad395e783816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", caption: "Networking Event", filename: null, sort_order: 3 },
  { id: "d5", url: "https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", caption: "Guest Speaker Session", filename: null, sort_order: 4 },
  { id: "d6", url: "https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", caption: "Team Discussion", filename: null, sort_order: 5 },
];

function getFullUrl(url: string) {
  return url.startsWith("/uploads/") ? `http://localhost:3001${url}` : url;
}

export function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(DEFAULT_IMAGES);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/images")
      .then((r) => r.json())
      .then((data: GalleryImage[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setGalleryImages(data);
        }
      })
      .catch(() => {
        // Backend offline — keep default images
      });
  }, []);

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImage === null) return;
    if (direction === "prev") {
      setSelectedImage((selectedImage - 1 + galleryImages.length) % galleryImages.length);
    } else {
      setSelectedImage((selectedImage + 1) % galleryImages.length);
    }
  };

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#063970] mb-4">
            Event Gallery
          </h2>
          <p className="text-lg text-[#919ea7] max-w-2xl mx-auto">
            Relive the moments from our past events and activities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg aspect-video bg-gray-200"
              onClick={() => openLightbox(index)}
            >
              <img
                src={getFullUrl(image.url)}
                alt={image.caption}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23e2e8f0' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%2394a3b8' dy='.3em' font-size='18'%3EImage not found%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 text-center">
                  {image.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateImage("prev"); }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronLeft size={48} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateImage("next"); }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronRight size={48} />
            </button>

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-5xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getFullUrl(galleryImages[selectedImage].url)}
                alt={galleryImages[selectedImage].caption}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <p className="text-white mt-4 text-center text-lg">
                {galleryImages[selectedImage].caption}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
