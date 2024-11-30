"use client";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import LoadingType from "@/components/LoadingType";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { videos } from "../../videos";
import SignInForm from "@/components/SignInForm";
import { useSession, signIn } from "next-auth/react";
import BuyCredit from "@/components/BuyCredit";
import PaymentComponent from "@/components/PaymentComponent";
import { Button } from "@/components/ui/button";
import ErrorComponent from "@/components/ErrorComponent";
import InputFormMobile from "@/components/InputFormMobile";

export default function Home() {
  const { data: session } = useSession();
  const containerRef = useRef<any>(null);
  const [pointStyle, setPointStyle] = useState({ top: "0%", left: "0%" });
  const [pointInputStyle, setPointInputStyle] = useState({
    top: "0%",
    left: "0%",
  });
  const [isPlaying, setIsPlaying] = useState(false);
  // Resmin orijinal boyutları
  const originalImageWidth = 1920;
  const originalImageHeight = 970;

  // Noktanın orijinal resim üzerindeki koordinatları
  const pointX = 1248; // X koordinatı (piksel cinsinden)
  const pointY = 330; // Y koordinatı (piksel cinsinden)

  const pointInputX = 965;
  const pointInputY = 800;
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

        const pointInputXInContainer = pointInputX * scale - offsetX;
        const pointInputYInContainer = pointInputY * scale - offsetY;
        // Yüzde değerlerini hesapla
        const newLeft = (pointXInContainer / containerWidth) * 100;
        const newTop = (pointYInContainer / containerHeight) * 100;
        const newInputLeft = (pointInputXInContainer / containerWidth) * 100;
        const newInputTop = (pointInputYInContainer / containerHeight) * 100;

        setPointStyle({
          top: `${newTop}%`,
          left: `${newLeft}%`,
        });

        setPointInputStyle({
          top: `${newInputTop}%`,
          left: `${newInputLeft}%`,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [screenWidth, setScreenWidth] = useState(0);
  const [inputText, setInputText] = useState("");
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>("");
  const [videoKey, setVideoKey] = useState(Date.now());
  const [creditCount, setCreditCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState("");
  const [inputFontSize, setInputFontSize] = useState("");
  const [videoURLs, setVideoURLs] = useState<(string | null)[]>([]);
  const videoRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [showBuyCredit, setShowBuyCredit] = useState(false);
  const [inputWidth, setInputWidth] = useState(0);
  const [videoHeight, setVideoHight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [location, setLocation] = useState("");
  const [character, setCharacter] = useState("");
  const [isError, setIsError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  //https://storage.googleapis.com/childrenstory-bucket/KAI30_small.mp4
  //"https://storage.googleapis.com/childrenstory-bucket/AVA30_GLITCH2.mp4"
  const kaiVideoUrl =
    "https://storage.googleapis.com/childrenstory-bucket/KAI30_small.mp4";
  const avaVideoUrl =
    "https://storage.googleapis.com/childrenstory-bucket/AVA_033124_MOB.mp4";

  const image = { width: 1920, height: 970 };
  const target = { x: 1230, y: 305 };
  const targetCreditMobile = { x: 1270, y: 305 };
  const targetInput = { x: 820, y: 807 };
  const targetInputMobile = { x: 1200, y: 837 };
  const targetForm = { x: 810, y: 830 };
  const targetFormMobile = { x: 860, y: 835 };
  const targetVideo = { x: 500, y: 200 };
  const [pointerCreditPosition, setPointerCreditPosition] = useState({
    top: 0,
    left: 0,
  });
  const [pointerInputPosition, setPointerInputPosition] = useState({
    top: 0,
    left: 0,
  });
  const [pointerFormPosition, setPointerFormPosition] = useState({
    top: 0,
    left: 0,
  });

  const [pointerVideoPosition, setPointerVideoPosition] = useState({
    top: 0,
    left: 0,
  });

  const [isMainVideoLoaded, setIsMainVideoLoaded] = useState(false);
  const [isFirstVideoEnded, setIsFirstVideoEnded] = useState(false);
  const [isVideoGenerated, setIsVideoGenerated] = useState(false);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const loopVideoRef = useRef<HTMLVideoElement>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState("");
  const generatedVideoRef = useRef<HTMLVideoElement>(null);

  const [isGeneratedVideoPlaying, setIsGeneratedVideoPlaying] = useState(false);

  const handleReplay = () => {
    if (generatedVideoRef.current) {
      generatedVideoRef.current.currentTime = 0;
      generatedVideoRef.current.play();
      setIsFirstVideoEnded(false);
    }
    console.log("Replay clicked");
  };
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

      setPointerCreditPosition({
        top:
          windowWidth > 768
            ? target.y * scale + yOffset
            : targetCreditMobile.y * scale + yOffset,
        left:
          windowWidth > 768
            ? target.x * scale + xOffset
            : targetCreditMobile.x * scale + xOffset,
      });

      setPointerInputPosition({
        top:
          windowWidth > 768
            ? targetInput.y * scale + yOffset
            : targetInputMobile.y * scale + yOffset,
        left: targetInput.x * scale + xOffset,
      });
      setPointerFormPosition({
        top:
          windowWidth > 768
            ? targetForm.y * scale + yOffset
            : targetFormMobile.y * scale + yOffset,
        left:
          windowWidth > 768
            ? targetForm.x * scale + xOffset
            : targetFormMobile.x * scale + xOffset,
      });

      setPointerVideoPosition({
        top: targetVideo.y * scale + yOffset,
        left: targetVideo.x * scale + xOffset,
      });
      setInputWidth(320 * scale + yOffset);
    };

    updatePointer();
    window.addEventListener("resize", updatePointer);

    return () => window.removeEventListener("resize", updatePointer);
  }, []);
  useEffect(() => {
    setCharacter(Math.floor(Math.random() * 2) + 1 === 1 ? "AVA" : "KAI");

    function handleResize() {
      const newFontSize = `${(window.innerHeight * 40) / 930}px`;
      const newInputFontSize = `${(window.innerHeight * 18) / 930}px`;
      setFontSize(newFontSize);
      setInputFontSize(newInputFontSize);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setVideoUrl("/LadyFortuna_Full.mp4");
    setVideoKey(Date.now());
  }, []);

  useEffect(() => {
    if (name && !session) {
      setShowForm(true);
    }
  }, [name]);
  useEffect(() => {
    handleCredit();
    const fetchData = async function () {
      const res = await fetch("/api/videoData", {
        method: "POST",
      });
      const body = await res.json();
      const urls = body.urls;
      setVideoURLs(urls);
      console.log("urls:");
      console.log(urls);
    };
    fetchData();
    getCredit();
  }, []);
  useEffect(() => {
    setTimeout(() => {
      setVideoMuted(false);
    }, 2000);
  }, []);

  useEffect(() => {
    if (generatedVideoUrl && isFirstVideoEnded) {
      console.log("first video ended:");

      console.log("generated video url:");
      console.log(generatedVideoUrl);
    }
  }, [generatedVideoUrl, isFirstVideoEnded]);
  useEffect(() => {
    if (isLoading) {
      setVideoUrl(videoURLs[0]);
      setVideoKey(Date.now());
    }
  }, [isLoading]);

  const handleClick = async function () {
    try {
      if (session) {
        setIsLoading(true);
        const res = await fetch("/api/voice", {
          method: "POST",
          body: JSON.stringify({
            inputText: inputText,
            character: character,
            name,
            dateOfBirth,
            timeOfBirth,
            location,
          }),
        });
        const text = await res.text();
        console.log("text:" + text);
        const startGeneration = await fetch("/api/startGeneration", {
          method: "POST",
          body: JSON.stringify({ audioUrl: text }),
        });
        const obj = await startGeneration.json();
        const statusUrl = await obj.status_url;
        while (true) {
          const newRes = await fetch("/api/statusGeneration", {
            method: "POST",
            body: JSON.stringify({ status_url: statusUrl }),
          });
          const newResJson = await newRes.json();
          const curStatus = newResJson.status;
          if (curStatus === "not yet") {
            console.log("not yet");
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } else {
            console.log("succes:");
            console.log(newResJson);
            setGeneratedVideoUrl(newResJson.output.output_video);
            setVideoKey(Date.now());
            setIsLoading(false);
            break;
          }
        }
      }
    } catch (error) {
      setIsError(true);
      console.error(error);
    }
  };

  const decrementCredit = async function () {
    console.log("credit using");

    const res = await fetch("/api/useCredit", {
      method: "POST",
      body: JSON.stringify({ userId: session?.user?.id }),
    });
  };
  const handleSubmit = async (e: any) => {
    if (!session) {
      e.preventDefault();
      setShowForm(true);
    } else {
      if (creditCount > 0) {
        console.log("credit count greater than 0");
        await handleClick();
        await decrementCredit();
        setCreditCount(creditCount - 1);
        setInputText("");
      } else {
        setShowBuyCredit(true);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize(); // Get the initial screen width
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Ana videoyu ön yükleme
    const mainVideo = new Audio("/LadyFortuna_Full.mp4");
    mainVideo.preload = "auto";
    mainVideo.load();
    mainVideo.oncanplaythrough = () => setIsMainVideoLoaded(true);

    // Döngü videosunu ayarlama
    setVideoUrl("/LadyFortuna_Blinks.mp4");
    setVideoKey(Date.now());
  }, []);

  useEffect(() => {
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = true;
      if (isPlaying) {
        mainVideoRef.current
          .play()
          .then(() => {
            setTimeout(() => {
              if (mainVideoRef.current) {
                mainVideoRef.current.muted = false;
                setVideoMuted(false);
              }
            }, 2000);
          })
          .catch((error) => {
            console.error("Video playback failed:", error);
          });
      }
    }
  }, [isPlaying, isMainVideoLoaded]);

  const handleVideoEnd = () => {
    setVideoUrl("/LadyFortuna_Blinks.mp4");
    setVideoKey(Date.now());
  };

  const dbHandle = async function () {
    const res = await fetch("/api/addUser", {
      method: "POST",
      body: JSON.stringify({}),
    });
    console.log("ok");
  };

  const getCredit = async function () {
    console.log("working");
    console.log("currentses:");
    console.log(session);
    if (session?.user?.id) {
      try {
        const res = await fetch("/api/getCredit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session.user.id,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch credit");
        }

        const resJSON = await res.json();
        console.log("curcredit:.");
        console.log(resJSON);
        setCreditCount(resJSON.credit || 0);
      } catch (error) {
        console.error("Error fetching credit:", error);
        setCreditCount(0);
      }
    } else {
      console.log("User not logged in");
      setCreditCount(0);
    }
  };
  const handleCredit = async function () {
    if (session?.user) {
      console.log(session.user);

      const res = await fetch("/api/createCredit", {
        method: "POST",
        body: JSON.stringify({
          userId: session?.user.id,
        }),
      });
    } else {
      console.log("not logged in");
    }
  };
  const handleVoice = async function () {
    const res = await fetch("/api/voice", {
      method: "POST",
    });
  };

  const addCredit = async function () {
    if (session?.user) {
      const res = await fetch("/api/addCredit", {
        method: "POST",
        body: JSON.stringify({ userId: session?.user?.id }),
      });
    }
  };

  const handleAssistant = async function () {
    const res = await fetch("/api/documentRetrieval", {
      method: "POST",
    });
  };

  const LoadingScreen = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-black flex items-center justify-center z-20">
      <div className="text-white text-2xl">Loading...</div>
    </div>
  );

  const handlePlayClick = () => {
    if (mainVideoRef.current) {
      setIsPlaying(true);
    }
  };

  const handleStartOver = () => {
    // Seçenek 1: Sayfayı tamamen yenile
    window.location.href = "/";

    // Seçenek 2: Router'ı kullan ve sonra sayfayı yenile
    // router.push('/').then(() => {
    //   window.location.reload();
    // });
  };

  const handleGeneratedVideoPlay = () => {
    if (generatedVideoRef.current) {
      setIsGeneratedVideoPlaying(true);
      generatedVideoRef.current.play();
    }
  };

  return (
    <div className="overflow-y-hidden">
      {isImageLoading && LoadingScreen()}
      <div className="relative bg-black h-[calc(100dvh)] xl:w-full md:w-[calc((1400/970)*100dvh)] w-[calc((672/970)*100dvh)] overflow-y-hidden">
        {isError && <ErrorComponent />}
        <button
          className="absolute z-30 top-0 bg-transparent text-transparent"
          style={{
            width: "calc(1/25 * 100%)",
            top: "calc(180/400 * 100%)",
            right: "calc(132/400 * 100%)",
          }}
          onClick={() => {
            //addCredit();
            //setCreditCount(creditCount + 1);

            if (session) {
              setShowBuyCredit(true);
            } else {
              setShowForm(true);
            }
          }}
        >
          token
        </button>
        <div
          className={`relative xl:w-full md:w-[calc((1400/970)*100dvh)] w-[calc((672/970)*100dvh)] h-[calc(100dvh)] overflow-y-hidden`}
        >
          {!isLoading && !isImageLoading ? (
            <div className="md:hidden flex">
              <InputFormMobile
                handleSubmit={handleSubmit}
                inputWidth={inputWidth}
                name={name}
                setName={setName}
                dateOfBirth={dateOfBirth}
                setDateOfBirth={setDateOfBirth}
                timeOfBirth={timeOfBirth}
                setTimeOfBirth={setTimeOfBirth}
                location={location}
                setLocation={setLocation}
                handleClick={handleClick}
              />
            </div>
          ) : (
            ""
          )}
          {!isLoading && !isImageLoading ? (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  height: "calc(1/6 * 100%)",
                  top: pointInputStyle.top,
                  left: pointInputStyle.left,
                  transform: "translate(-50%, -50%)",
                  //width: "calc(22/100 * 100%)",
                  width: `${inputWidth}px`,
                }}
                className={`absolute md:block hidden md:text-[calc(8/400*100dvh)] text-[calc(7/400*100dvh)] tracking-tighter md:top-[${pointInputStyle.top}px] md:left-[${pointInputStyle.left}px] top-[calc(86/100*100dvh)] left-[calc(7/50*100dvh)] leading-tight -translate-y-2/3 bg-transparent border-none outline-none focus:border-none focus:outline-none text-white z-30 resize-none overflow-hidden`}
              >
                <div className="flex items-center gap-2">
                  <p>YOUR NAME:</p>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    className="bg-transparent border-b mb-1.5 border-white focus:border-b focus:border-white focus:outline-none h-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p>DATE OF BIRTH:</p>
                  <input
                    value={dateOfBirth}
                    onChange={(e) => {
                      setDateOfBirth(e.target.value);
                    }}
                    className="bg-transparent border-b mb-1.5 border-white focus:border-b focus:border-white focus:outline-none h-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p>TIME OF BIRTH:</p>
                  <input
                    value={timeOfBirth}
                    onChange={(e) => {
                      setTimeOfBirth(e.target.value);
                    }}
                    className="bg-transparent border-b mb-1.5 border-white focus:border-b focus:border-white focus:outline-none h-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p>LOCATION:</p>
                  <input
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                    }}
                    className="bg-transparent border-b mb-1.5 border-white focus:border-b focus:border-white focus:outline-none h-full"
                  />
                  <Button
                    onClick={handleSubmit}
                    className="bg-transparent h-[10px]"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            !isImageLoading && (
              <LoadingType
                character={character}
                pointerInputPosition={pointInputStyle}
              />
            )
          )}

          <div
            ref={containerRef}
            className="relative z-20 sm:block hidden h-screen overflow-hidden"
          >
            <LazyLoadImage
              className="z-20 w-full h-full object-cover"
              src="/ASTROLOGY_ROOM_LADY_FORTUNA.png"
              alt="Büyük Resim"
              onLoad={() => setIsImageLoading(false)}
            />

            <div
              className="z-20 absolute text-red-600"
              style={{
                top: pointStyle.top,
                left: pointStyle.left,
                transform: "translate(-50%, -50%)",
              }}
            >
              {fontSize && !isImageLoading ? (
                <p
                  className="text-xl sm:flex hidden"
                  style={{ fontSize: fontSize }}
                >
                  {creditCount > 9 ? creditCount : `0${creditCount}`}
                </p>
              ) : (
                ""
              )}
            </div>
          </div>

          <div className="md:hidden flex">
            <LazyLoadImage
              className="z-10 absolute md:hidden flex top-0 left-0 w-full h-full object-cover"
              src="/room.png"
              alt="background"
              style={{ objectFit: "cover" }}
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
          <div className="xl:hidden md:flex hidden">
            <LazyLoadImage
              className="z-10 absolute top-0 left-0 w-[calc((1400/970)*100dvh)] h-full"
              src="/1024.png"
              alt="background"
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
          {isFirstVideoEnded && (
            <div
              className={`h-full w-full absolute -top-[70px] md:left-0 -left-10 flex items-center justify-center z-50`}
            >
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleReplay}
                  className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded cursor-pointer"
                >
                  Replay
                </Button>
                <Button
                  onClick={handleStartOver}
                  className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded cursor-pointer"
                >
                  Try again
                </Button>
              </div>
            </div>
          )}
          {videoUrl && !videoURLs.includes(videoUrl) ? (
            <div>
              {!isPlaying && isImageLoading === false && (
                <button
                  onClick={handlePlayClick}
                  className="absolute top-[calc(16/40*100%)] sm:left-1/2 left-[calc(85/200*100%)] transform -translate-x-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-4 z-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}

              <div
                className="z-0 absolute flex md:left-[calc(100/200*100%)] left-[calc(85/200*100%)] justify-center aspect-[16/9]"
                style={{
                  top: "calc(175/800 * 100%)",
                  height: "calc(115/300 * 100%)",
                  transform: "translate(-50%)",
                }}
              >
                {/* Ana video */}
                {!isFirstVideoEnded && !generatedVideoUrl && (
                  <video
                    ref={mainVideoRef}
                    key={`main-${videoKey}`}
                    muted={videoMuted}
                    className={`h-full w-full absolute top-0 left-0 transition-opacity duration-1000 ${
                      isMainVideoLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    playsInline
                    preload="auto"
                    onEnded={handleVideoEnd}
                  >
                    <source src="/LadyFortuna_Full.mp4" type="video/mp4" />
                  </video>
                )}
              </div>
            </div>
          ) : (
            <div>
              {generatedVideoUrl && !isGeneratedVideoPlaying && (
                <button
                  onClick={handleGeneratedVideoPlay}
                  className="absolute top-[calc(16/40*100%)] sm:left-1/2 left-[calc(85/200*100%)] transform -translate-x-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-4 z-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
              <div
                className="z-100 md:left-[calc(100/200*100%)] left-[calc(85/200*100%)] absolute flex justify-center aspect-[16/9]"
                style={{
                  top: "calc(175/800 * 100%)",
                  height: "calc(115/300 * 100%)",
                  transform: "translate(-50%)",
                }}
              >
                {generatedVideoUrl && (
                  <video
                    ref={generatedVideoRef}
                    className={`h-full w-full absolute top-0 left-0 transition-opacity duration-1000`}
                    playsInline
                    preload="auto"
                    onEnded={() => {
                      setIsFirstVideoEnded(true);
                    }}
                  >
                    <source src={generatedVideoUrl} type="video/mp4" />
                  </video>
                )}
              </div>
            </div>
          )}
          {videoUrl && videoURLs.includes(videoUrl) && !generatedVideoUrl ? (
            <div>
              <div
                className="z-0 absolute -translate-x-1/2 flex md:left-[calc(100/200*100%)] left-[calc(86/200*100%)] justify-center aspect-[16/9]"
                style={{
                  top: "calc(140/800 * 100%)",
                  height: "calc(115/300 * 100%)",
                  left: "calc(102/200 * 100%)",
                  transform: "translate(-50%)",
                }}
              >
                <video
                  ref={videoRef}
                  key={videoKey}
                  muted={videoMuted}
                  className={`h-full w-full`}
                  autoPlay
                  playsInline
                  loop={videoUrl === "/LadyFortuna_Blinks.mp4"}
                  preload="none"
                  onEnded={handleVideoEnd}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        {fontSize && !isImageLoading ? (
          <p className="z-20 md:hidden flex text-[calc(18/400*100dvh)] top-[calc(123/400*100%)] xl:left-[calc(383/600*100%)] md:left-[calc(412/600*100%)] left-[calc(485/600*100%)] absolute justify-center mb-8 text-red-600">
            {creditCount > 9 ? creditCount : `0${creditCount}`}
          </p>
        ) : (
          ""
        )}
        {showForm && (
          <SignInForm showForm={showForm} setShowForm={setShowForm} />
        )}
        {showBuyCredit && (
          <BuyCredit
            showBuyCredit={showBuyCredit}
            setShowBuyCredit={setShowBuyCredit}
            creditCount={creditCount}
            setCreditCount={setCreditCount}
          />
        )}
      </div>
    </div>
  );
}

/*
<textarea
              placeholder={`${session ? "ASK A QUESTION" : "ASK A QUESTION"}`}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              style={{
                height: "calc(1/6 * 100%)",
                top: `${pointerInputPosition.top}px`,
                left: `${pointerInputPosition.left}px`,
                //width: "calc(22/100 * 100%)",
                width: `${inputWidth}px`,
                fontSize: `${inputFontSize}`,
              }}
              className="absolute top-3/4 -translate-y-2/3 tracking-widest bg-transparent border-none outline-none focus:border-none focus:outline-none text-white z-30 resize-none overflow-hidden"
              />
*/
