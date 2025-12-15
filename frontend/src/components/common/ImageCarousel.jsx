import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const BrushStrokeCarousel = ({ images = [], autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Sample images if none provided
  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1578499494554-ff2b9c6b37cd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549887534-7e9e1a7d3f8f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552993603-5ddf2797ef1f?w=800&h=600&fit=crop',
  ];

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
        <p className="text-slate-600">Không có hình ảnh</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden group py-8">
      <style>{`
        @keyframes brushStrokeTop {
          0% { clip-path: polygon(0% 0%, 100% 0%, 100% 5%, 0% 0%); }
          50% { clip-path: polygon(0% 0%, 100% 2%, 100% 8%, 0% 3%); }
          100% { clip-path: polygon(0% 0%, 100% 1%, 100% 6%, 0% 2%); }
        }
        
        @keyframes brushStrokeBottom {
          0% { clip-path: polygon(0% 95%, 100% 100%, 100% 100%, 0% 100%); }
          50% { clip-path: polygon(0% 92%, 100% 98%, 100% 100%, 0% 100%); }
          100% { clip-path: polygon(0% 94%, 100% 97%, 100% 100%, 0% 100%); }
        }
        
        @keyframes brushStrokeLeft {
          0% { clip-path: polygon(0% 0%, 6% 0%, 5% 100%, 0% 100%); }
          50% { clip-path: polygon(0% 0%, 8% 2%, 6% 98%, 0% 100%); }
          100% { clip-path: polygon(0% 0%, 7% 1%, 5% 99%, 0% 100%); }
        }
        
        @keyframes brushStrokeRight {
          0% { clip-path: polygon(94% 0%, 100% 0%, 100% 100%, 95% 100%); }
          50% { clip-path: polygon(92% 2%, 100% 0%, 100% 100%, 98% 98%); }
          100% { clip-path: polygon(93% 1%, 100% 0%, 100% 100%, 97% 99%); }
        }
        
        .brush-stroke-frame {
          position: relative;
        }
        
        .brush-top, .brush-bottom, .brush-left, .brush-right {
          position: absolute;
          background: linear-gradient(90deg, #1a1a1a, #2d2d2d, #1a1a1a);
          opacity: 0.9;
        }
        
        .brush-top {
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          animation: brushStrokeTop 3s ease-in-out infinite;
        }
        
        .brush-bottom {
          bottom: 0;
          left: 0;
          right: 0;
          height: 8px;
          animation: brushStrokeBottom 3s ease-in-out infinite;
        }
        
        .brush-left {
          top: 0;
          left: 0;
          bottom: 0;
          width: 8px;
          animation: brushStrokeLeft 3s ease-in-out infinite;
        }
        
        .brush-right {
          top: 0;
          right: 0;
          bottom: 0;
          width: 8px;
          animation: brushStrokeRight 3s ease-in-out infinite;
        }
      `}</style>

      {/* Main carousel container */}
      <div className="relative w-full max-w-4xl mx-auto px-4 md:px-8">
        <div className="brush-stroke-frame relative w-full h-96 md:h-[500px] rounded-sm overflow-hidden shadow-2xl">
          {/* Brush stroke borders */}
          <div className="brush-top" />
          <div className="brush-bottom" />
          <div className="brush-left" />
          <div className="brush-right" />

          {/* Images */}
          {displayImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Artistic overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />
            </div>
          ))}

          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/40 hover:bg-white/60 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg hover:shadow-xl"
            aria-label="Previous slide"
          >
            <FiChevronLeft size={24} />
          </button>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/40 hover:bg-white/60 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg hover:shadow-xl"
            aria-label="Next slide"
          >
            <FiChevronRight size={24} />
          </button>

          {/* Slide counter */}
          <div className="absolute bottom-6 right-6 z-20 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20">
            {currentIndex + 1} / {displayImages.length}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-3 mt-8">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-slate-800 w-8 h-3'
                  : 'bg-slate-400 hover:bg-slate-600 w-3 h-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrushStrokeCarousel;