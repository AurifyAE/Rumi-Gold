import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useSpotRate } from "../context/SpotRateContext";

const SpotRate = () => {
  const { goldData, silverData } = useSpotRate();

  const [goldBidDir, setGoldBidDir] = useState("neutral");
  const [goldAskDir, setGoldAskDir] = useState("neutral");
  const [silverBidDir, setSilverBidDir] = useState("neutral");
  const [silverAskDir, setSilverAskDir] = useState("neutral");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.screen.width <= 768); // 🔥 screen.width ignores zoom
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const prev = useRef({
    goldBid: null,
    goldAsk: null,
    silverBid: null,
    silverAsk: null,
    platinumBid: null,
    platinumAsk: null,
  });

  const detectChange = (prevVal, currVal, setDir) => {
    if (prevVal === null) return currVal;

    if (currVal > prevVal) {
      setDir("rise");
      setTimeout(() => setDir("neutral"), 800);
    } else if (currVal < prevVal) {
      setDir("fall");
      setTimeout(() => setDir("neutral"), 800);
    }

    return currVal;
  };

  useEffect(() => {
    prev.current.goldBid = detectChange(
      prev.current.goldBid,
      goldData.bid,
      setGoldBidDir,
    );
  }, [goldData.bid]);

  useEffect(() => {
    prev.current.goldAsk = detectChange(
      prev.current.goldAsk,
      goldData.ask,
      setGoldAskDir,
    );
  }, [goldData.ask]);

  useEffect(() => {
    prev.current.silverBid = detectChange(
      prev.current.silverBid,
      silverData.bid,
      setSilverBidDir,
    );
  }, [silverData.bid]);

  useEffect(() => {
    prev.current.silverAsk = detectChange(
      prev.current.silverAsk,
      silverData.ask,
      setSilverAskDir,
    );
  }, [silverData.ask]);

  const getColors = (dir) => {
    if (dir === "rise")
      return {
        bgColor: "#008f0c",
        border: "1px solid #008f0c",
        color: "white",
      };
    if (dir === "fall")
      return {
        bgColor: "#FF0040",
        border: " 1px solid #ff3366",
        color: "white",
      };
    return {
      bgColor: "#F0F8FF00",
      border: " 1px solid #FFFFFF",
      color: "#fff",
    };
  };

  const PricePulse = ({ label, value, dir }) => {
    const { bgColor, border, color } = getColors(dir);
    const hasPulse = dir !== "neutral";

    return (
      <Box
        sx={{
          position: "relative",
          flex: 1,
          mb: ".5vw",

          overflow: "hidden",
          ...(hasPulse && {
            animation:
              dir === "rise"
                ? "pulseRise 0.8s ease-out"
                : "pulseFall 0.8s ease-out",
            bgcolor:
              dir === "rise"
                ? "0 0 0 0 rgba(0,255,157,0.6)"
                : "0 0 0 0 rgba(255,51,102,0.6)",
          }),
        }}
      >
        <Typography
          sx={{
            // fontSize: "1vw",

            fontSize: {
              xs: "15px", // mobile
              sm: "2.5vw", // small tablets
              md: "1.5vw", // laptops
            },
            letterSpacing: "0.25vw",
            color: "#fff",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            // fontSize: "2.4vw",
            fontSize: {
              xs: "18px", // mobile
              sm: "2.5vw", // small tablets
              md: "1.8vw", // laptops
              lg: "2.4vw", // desktop
              xl: "2.4vw", // large screens
            },
            fontWeight: 800,
            letterSpacing: "0.18vw",
            textAlign: "center",
            bgcolor: bgColor,
            color: color,
            border: border,
            borderRadius: "1vw",
            fontVariantNumeric: "tabular-nums",
            transition: "all 0.4s ease",
          }}
        >
          {value}
        </Typography>
      </Box>
    );
  };

  const MetalPanel = ({ data, bidDir, askDir, theme }) => {
    const isSilver = theme === "silver";

    let title = "GOLD";
    let gradient = "linear-gradient(90deg, #FFF098)";
    let shadow = "0 0 3vw rgba(255 217 0 / 0.11) inset";

    if (isSilver) {
      title = "SILVER";
      gradient = "linear-gradient(90deg, #FFFFFF )";
      shadow = "0 0 3vw rgba(160,180,255,0.15) inset";
    }

    return (
      <Box
        sx={{
          border: "0.1vw solid #ffffff4a",
          borderRadius: "1vw",
          backdropFilter: "blur(0.2vw)",
          background: "#f7e4d300",
          padding: { xs: " 2vw 3vw", sm: " 0.5vw 2vw", md: "1vw 1vw" },
          display: "grid",
          alignItems: "center",
          gap: "1vw",
          gridTemplateColumns: " .7fr 1fr 1fr ",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              width: "4.5vw",
              height: "4.5vw",
              objectFit: "contain", 
            }}
            component='img'
            src={isSilver ? '/images/silver-bar.png' : '/images/gold-bar.png'}
            alt={title}
          />
            
          <Box
            sx={{
              fontSize: { xs: "14px", md: "1.7vw" },
              fontWeight: 700,
               
              letterSpacing: "0.1em",
              background:isSilver?'linear-gradient(90deg, #CCFBFF,#9AC6FF)':'linear-gradient(90deg, #FFF7CC,#FFCD9A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight:'1'

            }}
          >
            {title}
          </Box>
        </Box>

        <Box
          sx={{
            fontSize: {
              xs: "15px", // mobile
              sm: "2.5vw", // small tablets
              md: "1.8vw", // laptops
              lg: "1.5vw", // desktop
              xl: "1.2vw", // large screens
            },
            color: "#fff",

            fontWeight: "700",
          }}
        >
          <PricePulse label="BID" value={data.bid} dir={bidDir} />
          LOW <span className="hl-value-low text-[#bf0000]">{data.low}</span>
        </Box>

        {/* Price Boxes */}
        <Box
          sx={{
            fontSize: {
              xs: "15px", // mobile
              sm: "2.5vw", // small tablets
              md: "1.8vw", // laptops
              lg: "1.5vw", // desktop
              xl: "1.2vw", // large screens
            },
            color: "#fff",
            fontWeight: "700",
          }}
        >
          <PricePulse label="ASK" value={data.ask} dir={askDir} />
          HIGH{" "}
          <span className="hl-value-high text-[#4dbf00]">{data.high}</span>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: "1vw",
        width: "100%",
        alignItems: "end",
        marginTop: {
          xs: "20px", // mobile
          sm: "0vw", // small tablets
        },
        gridTemplateColumns: { xs: "1fr" },
      }}
    >
      <MetalPanel
        data={goldData}
        bidDir={goldBidDir}
        askDir={goldAskDir}
        theme="gold"
      />

      <MetalPanel
        data={silverData}
        bidDir={silverBidDir}
        askDir={silverAskDir}
        theme="silver"
      />
    </Box>
  );
};

export default SpotRate;
