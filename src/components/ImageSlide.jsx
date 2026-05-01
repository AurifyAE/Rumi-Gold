import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

const rotatingImages = [
  "/images/gold-bars.jpg",
  "/images/silver-bars.jpg",
  "/images/gold-coin.avif",
  "/images/silver-coin.jpg",
];

const ImageSlide = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    let imageIndex = 0;

    rotatingImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
 

    // 🔹 Image rotation (NO React state)
    const imageInterval = setInterval(() => {
      imageIndex = (imageIndex + 1) % rotatingImages.length;

      if (imageRef.current) {
        imageRef.current.src = rotatingImages[imageIndex];
      }
    }, 8000); // slow for TV

    // 🔹 Auto refresh every 6 hours (TV safety)
    const refreshInterval = setInterval(
      () => {
        window.location.reload();
      },
      6 * 60 * 60 * 1000,
    );

    return () => {
      clearInterval(dateInterval);
      clearInterval(imageInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <Box
      sx={{
        width: { xs: "25vw", md: "16vw" },
        height: { xs: "14vw", md: "7vw" },
        borderRadius: "0.45vw",
        overflow: "hidden",
        boxShadow: "0 0.22vw 0.65vw rgba(0,0,0,0.3)",
      }}
    >
      <img
        ref={imageRef}
        src={rotatingImages[0]}
        alt="Rotating"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </Box>
  );
};

export default ImageSlide;
