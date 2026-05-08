import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, Typography, Box, useMediaQuery } from "@mui/material";
import SpotRate from "../components/SpotRate";
import CommodityTable from "../components/CommodityTable";
import NewsTicker from "../components/News";

import {
  fetchSpotRates,
  fetchServerURL,
  fetchNews,
  fetchTVScreenData,
} from "../api/api";
import io from "socket.io-client";
import { useSpotRate } from "../context/SpotRateContext";
import mainLogo from "/images/logo.svg";
import WorldClockHorizontal from "../components/WorldClock";
import SystemClock from "../components/SystemClock";
import PoweredByAurify from "../components/PoweredByAurify";
import ImageSlide from "../components/ImageSlide";

function TvScreen() {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [serverURL, setServerURL] = useState("");
  const [news, setNews] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [commodities, setCommodities] = useState([]);
  const [goldBidSpread, setGoldBidSpread] = useState("");
  const [goldAskSpread, setGoldAskSpread] = useState("");
  const [silverBidSpread, setSilverBidSpread] = useState("");
  const [silverAskSpread, setSilverAskSpread] = useState("");
  const [symbols, setSymbols] = useState(["GOLD", "SILVER"]);
  const [error, setError] = useState(null);

  const { updateMarketData } = useSpotRate();

  const adminId = import.meta.env.VITE_APP_ADMIN_ID;

  // updateMarketData(
  //   marketData,
  //   goldBidSpread,
  //   goldAskSpread,
  //   silverBidSpread,
  //   silverAskSpread,
  // );
  useEffect(() => {
    updateMarketData(
      marketData,
      goldBidSpread,
      goldAskSpread,
      silverBidSpread,
      silverAskSpread,
    );
  }, [
    marketData,
    goldBidSpread,
    goldAskSpread,
    silverBidSpread,
    silverAskSpread,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spotRatesRes, serverURLRes, newsRes] = await Promise.all([
          fetchSpotRates(adminId),
          fetchServerURL(),
          fetchNews(adminId),
        ]);

        // Handle Spot Rates
        const {
          commodities,
          goldBidSpread,
          goldAskSpread,
          silverBidSpread,
          silverAskSpread,
        } = spotRatesRes.data.info;
        setCommodities(commodities);
        setGoldBidSpread(goldBidSpread);
        setGoldAskSpread(goldAskSpread);
        setSilverBidSpread(silverBidSpread);
        setSilverAskSpread(silverAskSpread);

        // Handle Server URL
        const { serverURL } = serverURLRes.data.info;
        setServerURL(serverURL);

        // Handle News
        setNews(newsRes.data.news.news);
      } catch (error) {
        setError("An error occurred while fetching data");
      }
    };

    fetchData();

    // Fetch TV screen data (you can leave this as a separate call)
    fetchTVScreenData(adminId)
      .then((response) => {
        if (response.status === 200) {
          // Allow TV screen view
          setShowLimitModal(false);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setShowLimitModal(true); // Show the modal on 403 status
        } else {
          console.error("Error:", error.message);
          alert("An unexpected error occurred.");
        }
      });
  }, [adminId]);

  // Function to Fetch Market Data Using Socket
  useEffect(() => {
    if (serverURL) {
      const socket = io(serverURL, {
        query: { secret: import.meta.env.VITE_APP_SOCKET_SECRET_KEY },
        transports: ["websocket"],
        withCredentials: true,
      });

      socket.on("connect", () => {
        socket.emit("request-data", symbols);
      });

      socket.on("disconnect", () => {});

      // socket.on("market-data", (data) => {
      //   if (data && data.symbol) {
      //     setMarketData((prevData) => ({
      //       ...prevData,
      //       [data.symbol]: {
      //         ...prevData[data.symbol],
      //         ...data,
      //       },
      //     }));
      //   } else {
      //     console.warn("Received malformed market data:", data);
      //   }
      // });

      socket.on("market-data", (data) => {
        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (item.symbol) {
              setMarketData((prev) => ({
                ...prev,
                [item.symbol]: {
                  ...prev[item.symbol],
                  ...item,
                },
              }));
            }
          });
        } else if (data && data.symbol) {
          setMarketData((prev) => ({
            ...prev,
            [data.symbol]: {
              ...prev[data.symbol],
              ...data,
            },
          }));
        } else {
          console.warn("Received malformed market data:", data);
        }
      });

      socket.on("error", (error) => {
        console.error("WebSocket error:", error);
        setError("An error occurred while receiving data");
      });

      // Cleanup function to disconnect the socket
      return () => {
        socket.disconnect();
      };
    }
  }, [serverURL, symbols]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.screen.width <= 768); // 🔥 screen.width ignores zoom
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        color: "white",
        pb: { xs: "0", md: "3vw" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          left: "00%",
          bottom: "0%",
          height: "100%", // better than %
          width: "100%", // better than %
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          // src="/images/background.png"
          src="/images/background.webp"
          alt="background"
          sx={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Grid */}

      <Grid
        container
        spacing={10}
        minHeight="100%"
        // alignItems="flex-start"
        justifyContent="space-between"
        flexWrap="wrap"
        zIndex="1"
        position="relative"
        margin="0"
        padding="0 2vw "
        alignItems="center"
        width="100%"
      >
        <Grid
          xs={12}
          md={6}
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="spaceBetween"
          padding="1vw"
          gap="1vw"
        >
          <Box
            sx={{
              height: "auto",
              width: { xs: "40vw", sm: "20vw" },
              marginBottom: { xs: "20px", sm: "0vw" },
            }}
          >
            <img src={mainLogo} alt="" className="object-contain w-full" />
          </Box>

          <CommodityTable items={commodities} />
        </Grid>

        {/* Side: SpotRate & Date Time */}
        <Grid xs={12} md={6} padding="1vw" gap="1vw" display="grid">
          <WorldClockHorizontal />
          <SystemClock />
          <SpotRate />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <PoweredByAurify />
            <ImageSlide />
          </Box>
        </Grid>

        <Grid
          md={12}
          sx={{
            mt: { xs: "20px", md: "0" },
            position: { xs: "unset", md: "fixed" },
            zIndex: "1",
            bottom: "0",
            width: "100%",
            left: "0",
          }}
        >
          <NewsTicker newsItems={news} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default TvScreen;
