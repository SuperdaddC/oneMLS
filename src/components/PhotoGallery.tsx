"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

interface PhotoGalleryProps {
  photos: string[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailRef.current) {
      const thumb = thumbnailRef.current.children[activeIndex] as HTMLElement;
      if (thumb) {
        thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeIndex]);

  if (photos.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-[#2a2a3a] bg-[#161620] md:h-[500px]">
        <div className="text-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2a2a3a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-3"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <p className="text-sm text-[#94a3b8]">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Grid */}
      <div className="overflow-hidden rounded-2xl">
        {photos.length === 1 ? (
          <button
            onClick={() => openLightbox(0)}
            className="relative block h-[400px] w-full cursor-pointer overflow-hidden md:h-[500px]"
          >
            <Image
              src={photos[0]}
              alt="Property photo"
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="100vw"
              priority
            />
          </button>
        ) : (
          <div className="grid h-[400px] grid-cols-1 gap-1.5 md:h-[500px] md:grid-cols-5">
            {/* Main photo */}
            <button
              onClick={() => openLightbox(0)}
              className="relative col-span-1 cursor-pointer overflow-hidden md:col-span-3"
            >
              <Image
                src={photos[0]}
                alt="Property photo 1"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="60vw"
                priority
              />
            </button>

            {/* Side photos */}
            <div className="hidden gap-1.5 md:col-span-2 md:grid md:grid-rows-2">
              {photos[1] && (
                <button
                  onClick={() => openLightbox(1)}
                  className="relative cursor-pointer overflow-hidden"
                >
                  <Image
                    src={photos[1]}
                    alt="Property photo 2"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="40vw"
                  />
                </button>
              )}
              {photos[2] ? (
                <button
                  onClick={() => openLightbox(2)}
                  className="relative cursor-pointer overflow-hidden"
                >
                  <Image
                    src={photos[2]}
                    alt="Property photo 3"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="40vw"
                  />
                  {photos.length > 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-colors hover:bg-black/40">
                      <span className="text-lg font-semibold text-white">
                        View all {photos.length} photos
                      </span>
                    </div>
                  )}
                </button>
              ) : (
                <div className="bg-[#161620]" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div
          ref={thumbnailRef}
          className="mt-3 flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => openLightbox(i)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                activeIndex === i
                  ? "ring-2 ring-[#c9a962] ring-offset-2 ring-offset-[#0a0a0f]"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={photo}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white">
            {activeIndex + 1} / {photos.length}
          </div>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative h-[80vh] w-[90vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[activeIndex]}
              alt={`Photo ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Lightbox Thumbnails */}
          <div className="absolute bottom-4 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl bg-black/60 p-2">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(i);
                }}
                className={`relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md transition-all ${
                  i === activeIndex
                    ? "ring-2 ring-[#c9a962]"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <Image
                  src={photo}
                  alt={`Thumb ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
