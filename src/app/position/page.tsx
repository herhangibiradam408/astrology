"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const ImageWithPoint = () => {
  const containerRef = useRef<any>(null);
  const [pointStyle, setPointStyle] = useState({ top: "0%", left: "0%" });

  // Resmin orijinal boyutları
  const originalImageWidth = 1920;
  const originalImageHeight = 970;

  // Noktanın orijinal resim üzerindeki koordinatları
  const pointX = 1230; // X koordinatı (piksel cinsinden)
  const pointY = 305; // Y koordinatı (piksel cinsinden)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Ölçek faktörünü hesapla (objectFit: 'cover' için)
        const scale = Math.max(
          containerWidth / originalImageWidth,
          containerHeight / originalImageHeight
        );

        // Ölçeklenmiş resmin boyutları
        const displayedImageWidth = originalImageWidth * scale;
        const displayedImageHeight = originalImageHeight * scale;

        // Kırpılan kısımların offset değerleri
        const offsetX = (displayedImageWidth - containerWidth) / 2;
        const offsetY = (displayedImageHeight - containerHeight) / 2;

        // Noktanın kapsayıcı içindeki pozisyonu
        const pointXInContainer = pointX * scale - offsetX;
        const pointYInContainer = pointY * scale - offsetY;

        // Yüzde değerlerini hesapla
        const newLeft = (pointXInContainer / containerWidth) * 100;
        const newTop = (pointYInContainer / containerHeight) * 100;

        setPointStyle({
          top: `${newTop}%`,
          left: `${newLeft}%`,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      <Image
        src="/ASTROLOGY_ROOM_LADY_FORTUNA.png"
        alt="Büyük Resim"
        layout="fill"
        objectFit="cover"
      />
      <div
        className="absolute w-5 h-5 bg-red-500 rounded-full"
        style={{
          top: pointStyle.top,
          left: pointStyle.left,
          transform: "translate(-50%, -50%)",
        }}
      ></div>
    </div>
  );
};

export default ImageWithPoint;
