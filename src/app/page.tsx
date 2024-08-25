"use client";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import LoadingType from "@/components/LoadingType";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { videos } from "../../videos";
import SignInForm from "@/components/SignInForm";
import { useSession, signIn } from "next-auth/react";
import BuyCredit from "@/components/BuyCredit";
import PaymentComponent from "@/components/PaymentComponent";
import { Button } from "@/components/ui/button";
import ErrorComponent from "@/components/ErrorComponent";

export default function Home() {
  const { data: session } = useSession();

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

  const handleReplay = () => {
    if (generatedVideoRef.current) {
      generatedVideoRef.current.currentTime = 0;
      generatedVideoRef.current.play();
      setIsFirstVideoEnded(false);
    }
    console.log("Replay clicked"); // Kontrol için log ekledik
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
    handleCredit();
    const fetchData = async function () {
      const res = await fetch("/api/videoData", {
        method: "POST",
      });
      const body = await res.json();
      const urls = body.urls;
      setVideoURLs(urls);
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
    if (isLoading) {
      setVideoUrl(videoURLs[Math.floor(Math.random() * 19)]);
      setVideoKey(Date.now());
    }
  }, [isLoading]);

  const handleClick = async function () {
    try {
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
    } catch (error) {
      setIsError(true);
      console.error(error);
    }
  };

  const decrementCredit = async function () {
    setCreditCount(creditCount - 1);
    const res = await fetch("/api/useCredit", {
      method: "POST",
      body: JSON.stringify({ userId: session?.user?.id }),
    });
  };
  const handleSubmit = async () => {
    if (!session) {
      setShowForm(true);
    } else {
      if (creditCount > 0) {
        setCreditCount(creditCount - 1);
        await handleClick();
        setInputText("");
        await decrementCredit();
      } else {
        setShowBuyCredit(true);
      }
    }
  };
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
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
      mainVideoRef.current
        .play()
        .then(() => {
          // Video başladıktan 2 saniye sonra sesi aç
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
  }, [isMainVideoLoaded]);

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
    if (session?.user) {
      console.log(session.user);

      const res = await fetch("/api/getCredit", {
        method: "POST",
        body: JSON.stringify({
          userId: session?.user.id,
        }),
      });
      const resJSON = await res.json();
      const credit = resJSON.credit;
      setCreditCount(credit);
    } else {
      console.log("not logged in");
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

  const handleStartOver = () => {
    // Seçenek 1: Sayfayı tamamen yenile
    window.location.href = "/";

    // Seçenek 2: Router'ı kullan ve sonra sayfayı yenile
    // router.push('/').then(() => {
    //   window.location.reload();
    // });
  };
  return (
    <div className="overflow-y-hidden">
      {isImageLoading && LoadingScreen()}
      <div className="relative bg-black h-[calc(100dvh)] md:w-full w-[calc((672/970)*100dvh)] overflow-y-hidden">
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
          className={`relative md:w-full w-[calc((672/970)*100dvh)] h-[calc(100dvh)] overflow-y-hidden`}
        >
          {!isLoading && !isImageLoading ? (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  height: "calc(1/6 * 100%)",

                  //width: "calc(22/100 * 100%)",
                  width: `${inputWidth}px`,
                }}
                className={`absolute md:text-[calc(8/400*100dvh)] text-[calc(7/400*100dvh)] tracking-tighter md:top-[calc(87/100*100%)] md:left-[calc(85/200*100%)] top-[calc(86/100*100dvh)] left-[calc(7/50*100dvh)] leading-tight -translate-y-2/3 bg-transparent border-none outline-none focus:border-none focus:outline-none text-white z-30 resize-none overflow-hidden`}
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
                    onClick={handleClick}
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
                pointerInputPosition={pointerInputPosition}
              />
            )
          )}
          <div className="md:flex hidden">
            <LazyLoadImage
              className="z-10 absolute hidden md:flex top-0 md:left-0 -left-1/2 md:-translate-x-0 translate-x-1/4 w-full h-full object-cover"
              src="/ASTROLOGY_ROOM_LADY_FORTUNA.png"
              alt="background"
              style={{ objectFit: "cover" }}
              onLoad={() => setIsImageLoading(false)}
            />
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
              <div
                className="z-0 absolute flex md:left-[calc(100/200*100%)] left-[calc(85/200*100%)] justify-center aspect-[16/9]"
                style={{
                  top: "calc(175/800 * 100%)",
                  height: "calc(115/300 * 100%)",
                  transform: "translate(-50%)",
                }}
              >
                {!generatedVideoUrl && (
                  <video
                    ref={loopVideoRef}
                    key={`loop-${videoKey}`}
                    muted
                    className="h-full w-full absolute top-0 left-0"
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                  >
                    <source src="/LadyFortuna_Blinks.mp4" type="video/mp4" />
                  </video>
                )}

                {/* Ana video */}
                {!isFirstVideoEnded && !generatedVideoUrl && (
                  <video
                    ref={mainVideoRef}
                    key={`main-${videoKey}`}
                    muted={videoMuted}
                    className={`h-full w-full absolute top-0 left-0 transition-opacity duration-1000 ${
                      isMainVideoLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    autoPlay
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
                    autoPlay
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
                  top: "calc(110/800 * 100%)",
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
          <p className="z-20 md:top-[calc(123/400*100%)] text-[calc(18/400*100dvh)] top-[calc(123/400*100%)] md:left-[calc(383/600*100%)] left-[calc(485/600*100%)] absolute flex justify-center mb-8 text-red-600">
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
