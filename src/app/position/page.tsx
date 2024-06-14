"use client";
import React, { useState, useEffect } from "react";

const ImagePointer = () => {
  const image = { width: 1920, height: 970 };
  const target = { x: 900, y: 88 };
  const [pointerPosition, setPointerPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePointer = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let xScale = windowWidth / image.width;
      let yScale = windowHeight / image.height;
      let scale,
        yOffset = 0,
        xOffset = 0;

      if (xScale > yScale) {
        scale = xScale;
        yOffset = (windowHeight - image.height * scale) / 2;
      } else {
        scale = yScale;
        xOffset = (windowWidth - image.width * scale) / 2;
      }

      setPointerPosition({
        top: target.y * scale + yOffset,
        left: target.x * scale + xOffset,
      });
    };

    updatePointer();
    window.addEventListener("resize", updatePointer);

    return () => window.removeEventListener("resize", updatePointer);
  }, []);

  return (
    <div className="relative bg-custom-background bg-no-repeat bg-center bg-cover h-screen w-screen">
      <div
        id="pointer"
        className="absolute w-5 h-5 bg-red-500"
        style={{
          top: `${pointerPosition.top}px`,
          left: `${pointerPosition.left}px`,
        }}
      />
    </div>
  );
};

export default ImagePointer;
