import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';

const HeroBanner = ({ slides = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto play effect
  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-primary-800 to-primary-600">
      {/* Slides container */}
      <div className="relative w-full min-h-[500px] md:min-h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600" />

            {/* Content wrapper */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                  {/* Left side - Text content */}
                  <div className="flex flex-col justify-center py-12 md:py-0 text-white z-10">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed max-w-lg">
                      {slide.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {slide.buttons?.map((button, idx) => (
                        <Link
                          key={idx}
                          to={button.link}
                          className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            button.variant === 'primary'
                              ? 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg'
                              : 'bg-white text-primary-800 hover:bg-primary-50 shadow-md'
                          }`}
                        >
                          {button.label}
                          <FiArrowRight className="ml-2" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right side - Image with brush stroke effect (overlapping) */}
                  <div className="hidden md:flex items-center justify-center relative h-full">
                    <div className="relative w-96 h-96">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover brush-stroke-image"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-primary-800 p-3 rounded-full transition-all duration-200 shadow-lg"
        aria-label="Previous slide"
      >
        <FiChevronLeft size={24} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-primary-800 p-3 rounded-full transition-all duration-200 shadow-lg"
        aria-label="Next slide"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'bg-accent-500 w-8 h-3'
                : 'bg-white/50 hover:bg-white/75 w-3 h-3'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 z-20 bg-primary-800/80 text-white px-4 py-2 rounded-full text-sm font-semibold">
        {currentIndex + 1} / {slides.length}
      </div>
    </div>
  );
};

export default HeroBanner;
