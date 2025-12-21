import { useState, useEffect } from "react";
import type { WarpletMetrics } from "../hooks/useWarpletData";
import SummaryWarpCard from "./SummaryWarpCard";

interface StoryProps {
  displayName: string;
  metrics: WarpletMetrics;
  theme: any;
  userImage: string;
}

export default function WrappedStory({ displayName, metrics, userImage, theme }: StoryProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinting, setIsMinting] = useState(false); 

  // --- DATA PREP ---
  const daysActive = metrics.firstTransactionDate 
    ? Math.floor((Date.now() - new Date(metrics.firstTransactionDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const currentEquity = metrics.currentNetWorth || 0;
  const totalVolume = metrics.totalTradeVolume || 0;
  const biggestWin = metrics.biggestWin ? metrics.biggestWin.profitUsd : 0;
  
  const fmtUSD = (n: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 // Clean look for story slides
  }).format(n);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (slideIndex === slides.length - 1) return;
    if (isPaused || isMinting) return; 

    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          setSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
          return 0;
        }
        return old + 1.5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [slideIndex, isPaused, isMinting]); 

  useEffect(() => {
    setProgress(0);
  }, [slideIndex]);

  // --- DESIGN COMPONENTS ---
  const FloatingIcons = () => (
    <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, height: '100px', pointerEvents: 'none', zIndex: 5 }}>
       <div className={isMinting ? "" : "float-slow"} style={{ position: 'absolute', left: '50%', bottom: '10px', transform: 'translateX(-50%)', fontSize: '3rem', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}>💎</div>
       <div className={isMinting ? "" : "float-medium"} style={{ position: 'absolute', left: '20%', bottom: '40px', fontSize: '1.5rem', opacity: 0.7, filter: 'blur(1px)' }}>💰</div>
       <div className={isMinting ? "" : "float-fast"} style={{ position: 'absolute', right: '20%', bottom: '30px', fontSize: '1.8rem', opacity: 0.8 }}>🚀</div>
    </div>
  );

  const SpaceWindow = ({ children, tag }: { children: React.ReactNode, tag?: string }) => (
    <div style={{
      width: "100%", maxWidth: "380px", height: "75vh", maxHeight: "800px",
      position: "relative", borderRadius: "60px",
      background: "linear-gradient(145deg, #505050 0%, #2a2a2a 100%)",
      padding: "8px", boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        flex: 1, borderRadius: "54px", background: "#000",
        backgroundImage: "linear-gradient(to bottom, #050510 0%, #0a0a25 100%)",
        position: "relative", overflow: "hidden",
        boxShadow: "inset 0 0 40px rgba(0,0,0,0.9)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: `radial-gradient(white 1px, transparent 1px)`, backgroundSize: '50px 50px', zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: "-150px", left: "-50%", right: "-50%", height: "300px", background: "radial-gradient(50% 50% at 50% 50%, #4f46e5 0%, transparent 100%)", opacity: 0.6, filter: "blur(40px)", zIndex: 2, borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-80px", width: "140%", left: "-20%", height: "160px", background: "linear-gradient(to bottom, #1e1b4b, #000)", borderRadius: "50% 50% 0 0", boxShadow: "0 -10px 40px rgba(59, 130, 246, 0.4)", zIndex: 3 }} />
        <FloatingIcons />
        {tag && (
          <div style={{ position: "absolute", top: "40px", left: "30px", background: "rgba(255, 255, 255, 0.15)", padding: "6px 16px", borderRadius: "20px", fontSize: "0.8rem", color: "#e5e7eb", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", zIndex: 10 }}>
            {tag}
          </div>
        )}
        <div style={{ zIndex: 10, width: "100%", padding: "0 30px", textAlign: "left", color: "white" }}>
          {children}
        </div>
      </div>
    </div>
  );

  const slides = [
    {
      id: "intro",
      content: (
        <SpaceWindow>
          <div className="animate-fade-in" style={{ textAlign: "center", marginTop: "-40px" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>WARPLET</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "normal", opacity: 0.9 }}>Hey there!</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", lineHeight: 1.3, marginTop: "10px" }}>Ready to dive into<br />your 2025 recap?</div>
            <div style={{ marginTop: "40px" }}>
              <img src={userImage} style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid white", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }} />
            </div>
          </div>
        </SpaceWindow>
      )
    },
    {
      id: "tenure",
      content: (
        <SpaceWindow tag="Growing With Us">
          <div className="animate-slide-up">
            <div style={{ fontSize: "1.1rem", marginBottom: "20px" }}>You've been trading for</div>
            <div style={{ fontSize: "4.5rem", fontWeight: "400", lineHeight: 1, letterSpacing: "-2px" }}>{daysActive} <span style={{ fontSize: "1.5rem" }}>day(s),</span></div>
            <div style={{ fontSize: "1.1rem", marginTop: "30px", lineHeight: 1.5 }}>And Warplet has just turned<br/>one year old!</div>
          </div>
        </SpaceWindow>
      )
    },
    {
      id: "finance",
      content: (
        <SpaceWindow tag="Diamond Hands">
          <div className="animate-slide-up">
            <div style={{ fontSize: "1.1rem", marginBottom: "10px" }}>Your peak account equity:</div>
            <div style={{ fontSize: "2.8rem", fontWeight: "bold", marginBottom: "40px" }}>{fmtUSD(currentEquity)}</div>
            <div style={{ fontSize: "1.1rem", marginBottom: "10px" }}>Your total PnL (Realized):</div>
            <div style={{ fontSize: "2.8rem", fontWeight: "bold" }}>{fmtUSD(metrics.totalProfitLoss)}</div>
          </div>
        </SpaceWindow>
      )
    },
    {
      id: "volume", // NEW SLIDE: Uses the missing variables
      content: (
        <SpaceWindow tag="Trading Milestones">
          <div className="animate-slide-up">
            <div style={{ fontSize: "1.1rem", marginBottom: "10px" }}>You moved a total of</div>
            <div style={{ fontSize: "3.5rem", fontWeight: "bold", marginBottom: "30px" }}>{fmtUSD(totalVolume)}</div>
            
            <div style={{ fontSize: "1.1rem", marginBottom: "10px" }}>Your biggest single win:</div>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#4ade80" }}>{fmtUSD(biggestWin)}</div>
          </div>
        </SpaceWindow>
      )
    },
    {
      id: "reveal",
      content: (
        <div style={{ 
          width: "100%", height: "100%", 
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }}>
           <h2 style={{ marginBottom: 15, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', opacity: 0.7 }}>
            Your 2025 Card
          </h2>
          <SummaryWarpCard 
            displayName={displayName} 
            userImage={userImage}
            metrics={metrics} 
            theme={theme} 
            onMintStateChange={setIsMinting} 
          />
        </div>
      )
    }
  ];

  const handleTap = (e: any) => {
    if (isMinting) return; 
    if (e.target.tagName === 'BUTTON') return;

    const width = window.innerWidth;
    const x = e.clientX;
    if (x < width / 3) {
      setSlideIndex((p) => Math.max(0, p - 1));
    } else {
      setSlideIndex((p) => Math.min(slides.length - 1, p + 1));
    }
  };

  return (
    <div 
      onClick={handleTap}
      onPointerDown={() => !isMinting && setIsPaused(true)}
      onPointerUp={() => setIsPaused(false)}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: "80px",
        background: "#000",
        color: "white",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif"
      }}
    >
      <style>{`
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .float-slow { animation: float 6s ease-in-out infinite; }
        .float-medium { animation: float 5s ease-in-out infinite; animation-delay: 1s; }
        .float-fast { animation: float 4s ease-in-out infinite; animation-delay: 2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>

      <div style={{ position: "absolute", top: 15, left: 15, right: 15, display: "flex", gap: 6, zIndex: 10 }}>
        {slides.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "white",
              width: i < slideIndex ? "100%" : i === slideIndex ? `${progress}%` : "0%",
              transition: "width 0.1s linear"
            }} />
          </div>
        ))}
      </div>

      {slides[slideIndex].content}
    </div>
  );
}