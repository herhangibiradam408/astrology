import React, { useState, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";

interface LoadingType {
  character: string;
  pointerInputPosition: any;
}

function LoadingType({ character, pointerInputPosition }: LoadingType) {
  const [fontSize, setFontSize] = useState("");
  const [inputWidth, setInputWidth] = useState(0);
  const image = { width: 1920, height: 970 };
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

      setInputWidth(350 * scale + yOffset);
    };

    updatePointer();
    window.addEventListener("resize", updatePointer);

    return () => window.removeEventListener("resize", updatePointer);
  }, []);
  useEffect(() => {
    function handleResize() {
      const newFontSize = `${(window.innerHeight * 18) / 930}px`;
      setFontSize(newFontSize);
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        height: "calc(1/6 * 100%)",

        //width: "calc(22/100 * 100%)",
      }}
      className={`absolute md:text-[calc(8/400*100dvh)] w-[calc(30/100*100dvh)] text-[calc(7/400*100dvh)] tracking-tighter md:top-[calc(87/100*100%)] md:left-[calc(85/200*100%)] top-[calc(86/100*100dvh)] left-[calc(7/50*100dvh)] leading-tight -translate-y-2/3 bg-transparent border-none outline-none focus:border-none focus:outline-none text-white z-30 resize-none overflow-hidden`}
    >
      {fontSize ? (
        <TypeAnimation
          sequence={[
            `Stand by - cognitive matrices and mechanical components are synchronizing. Indulge in the short film especially for your enjoyment. Your patience is greatly appreciated.`,
            1000,
          ]}
          cursor={false}
          wrapper="span"
          speed={50}
          style={{
            lineHeight: 1.5,
            display: "inline-block",
          }}
          repeat={Infinity}
        />
      ) : (
        ""
      )}
    </div>
  );
}

export default LoadingType;
