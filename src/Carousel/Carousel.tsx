import { useEffect, useRef, useState } from "react";
import "./Carousel.css";

const slides = [
  {
    id: 1,
    image: "https://picsum.photos/id/1018/1200/500",
  },
  {
    id: 2,
    image: "https://picsum.photos/id/1015/1200/500",
  },
  {
    id: 3,
    image: "https://picsum.photos/id/1019/1200/500",
  },
  {
    id: 4,
    image: "https://picsum.photos/id/1020/1200/500",
  },
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    const diff =
      touchStartX.current - e.changedTouches[0].clientX;

    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
  };

  return (
    <div
      className="carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <div className="slide" key={slide.id}>
            <img
              src={slide.image}
              alt={`Slide ${slide.id}`}
            />
          </div>
        ))}
      </div>

      <button
        className="carousel-btn prev"
        onClick={prevSlide}
      >
        ❮
      </button>

      <button
        className="carousel-btn next"
        onClick={nextSlide}
      >
        ❯
      </button>

      <div className="dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${
              currentIndex === index ? "active" : ""
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;