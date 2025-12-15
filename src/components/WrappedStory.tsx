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

  // --- DATA PREP (Wallet Only) ---
  const daysActive = metrics.firstTransactionDate 
    ? Math.floor((Date.now() - new Date(metrics.firstTransactionDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const currentEquity = metrics.currentNetWorth || 0;
  const totalVolume = metrics.totalTradeVolume || 0;
  const biggestWin = metrics.biggestWin ? metrics.biggestWin.profitUsd : 0;
  
  // Formatters
  const fmtUSD = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

  // --- DESIGN COMPONENTS ---

  // The 3D Floating Icons seen in the screenshot (%, Coins, Logo)
  const FloatingIcons = () => (
    <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, height: '100px', pointerEvents: 'none', zIndex: 5 }}>
       {/* Center Icon */}
       <div className="float-slow" style={{ 
         position: 'absolute', left: '50%', bottom: '10px', transform: 'translateX(-50%)',
         fontSize: '3rem', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' 
       }}>
         💎
       </div>
       {/* Left Icon */}
       <div className="float-medium" style={{ 
         position: 'absolute', left: '20%', bottom: '40px',
         fontSize: '1.5rem', opacity: 0.7, filter: 'blur(1px)' 
       }}>
         💰
       </div>
       {/* Right Icon */}
       <div className="float-fast" style={{ 
         position: 'absolute', right: '20%', bottom: '30px',
         fontSize: '1.8rem', opacity: 0.8 
       }}>
         🚀
       </div>
    </div>
  );

  // The "Space Porthole" Container
  const SpaceWindow = ({ children, tag }: { children: React.ReactNode, tag?: string }) => (
    <div style={{
      width: "100%",
      maxWidth: "380px", // Match phone width in screenshot
      height: "75vh",    // Tall aspect ratio
      maxHeight: "800px",
      position: "relative",
      borderRadius: "60px", // Extremely round corners like screenshot
      // Metallic Bezel Gradient
      background: "linear-gradient(145deg, #505050 0%, #2a2a2a 100%)",
      padding: "8px", // Thickness of the outer bezel
      boxShadow: "0 20px 50px rgba(0,0,0,0.8)", // External shadow
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Inner Screen (The actual view) */}
      <div style={{
        flex: 1,
        borderRadius: "54px", // Slightly less than outer
        background: "#000",
        backgroundImage: "linear-gradient(to bottom, #050510 0%, #0a0a25 100%)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "inset 0 0 40px rgba(0,0,0,0.9), inset 0 0 10px rgba(0,0,0,1)", // Inner depth
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        
        {/* Star Field */}
        <div style={{ 
          position: 'absolute', inset: 0, opacity: 0.5, 
          backgroundImage: `radial-gradient(white 1px, transparent 1px)`, 
          backgroundSize: '50px 50px',
          zIndex: 1
        }} />

        {/* Planet Horizon Effect (Bottom Glow) */}
        <div style={{
          position: "absolute",
          bottom: "-150px",
          left: "-50%",
          right: "-50%",
          height: "300px",
          background: "radial-gradient(50% 50% at 50% 50%, #4f46e5 0%, transparent 100%)", // Blue/Earth glow
          opacity: 0.6,
          filter: "blur(40px)",
          zIndex: 2,
          borderRadius: "50%"
        }} />

        {/* Planet Surface (Physical semi-circle at bottom) */}
        <div style={{
          position: "absolute",
          bottom: "-80px",
          width: "140%",
          left: "-20%",
          height: "160px",
          background: "linear-gradient(to bottom, #1e1b4b, #000)",
          borderRadius: "50% 50% 0 0",
          boxShadow: "0 -10px 40px rgba(59, 130, 246, 0.4)", // Rim light
          zIndex: 3
        }} />

        {/* Floating 3D Elements */}
        <FloatingIcons />

        {/* Pill Tag (Top Left) */}
        {tag && (
          <div style={{
            position: "absolute",
            top: "40px",
            left: "30px",
            background: "rgba(255, 255, 255, 0.15)",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "0.8rem",
            color: "#e5e7eb",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 10
          }}>
            {tag}
          </div>
        )}

        {/* Main Content */}
        <div style={{ 
          zIndex: 10, 
          width: "100%", 
          padding: "0 30px",
          textAlign: "left", // Default alignment based on screenshots
          color: "white"
        }}>
          {children}
        </div>

      </div>
    </div>
  );

  const slides = [
    // --- SLIDE 1: INTRO ---
    {
      id: "intro",
      content: (
        <SpaceWindow>
          <div className="animate-fade-in" style={{ textAlign: "center", marginTop: "-40px" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>WARPLET</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "normal", opacity: 0.9 }}>
              Hey there!
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", lineHeight: 1.3, marginTop: "10px" }}>
              Ready to dive into<br />your 2025 recap?
            </div>
            <div style={{ marginTop: "40px" }}>
              <img src={userImage} style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid white", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }} />
            </div>
          </div>
        </SpaceWindow>
      )
    },
    
    // --- SLIDE 2: TENURE ---
    {
      id: "tenure",
      content: (
        <SpaceWindow tag="Growing With Us">
          <div className="animate-slide-up">
            <div style={{ fontSize: "1.1rem", marginBottom: "20px" }}>You've been trading for</div>
            
            <div style={{ fontSize: "4.5rem", fontWeight: "400", lineHeight: 1, letterSpacing: "-2px" }}>
              {daysActive} <span style={{ fontSize: "1.5rem" }}>day(s),</span>
            </div>
            
            <div style={{ fontSize: "1.1rem", marginTop: "30px", lineHeight: 1.5 }}>
              And Warplet has just turned<br/>one year old!
            </div>

            <div style={{ fontSize: "0.9rem", marginTop: "30px", opacity: 0.7, lineHeight: 1.5 }}>
              With over 150k registered users, we've grown into one of the leading analytics platforms.
            </div>
          </div>
        </SpaceWindow>
      )
    },

    // --- SLIDE 3: PNL & EQUITY ---
    {
      id: "finance",
      content: (
        <SpaceWindow tag="Diamond Hands">
          <div className="animate-slide-up">
            <div style={{ fontSize: "1.1rem", marginBottom: "10px" }}>Your peak account equity:</div>
            <div style={{ fontSize: "2.8rem", fontWeight: "bold", marginBottom: "40px" }}>
               {fmtUSD(currentEquity)}
            </div>

            <div style={{ fontSize: "1.1rem", marginBottom: "10px" }}>Your total PnL (Realized):</div>
            <div style={{ fontSize: "2.8rem", fontWeight: "bold", color: metrics.totalProfitLoss >= 0 ? "#ffffff" : "#ffffff" }}>
               {fmtUSD(metrics.totalProfitLoss)}
            </div>
          </div>
        </SpaceWindow>
      )
    },

    // --- SLIDE 4: VOLUME ---
    {
      id: "volume",
      content: (
        <SpaceWindow tag="2025 Trading Milestones">
          <div className="animate-slide-up">
             <div style={{ fontSize: "1.2rem", marginBottom: "15px" }}>In 2025, you completed</div>
             
             <div style={{ marginBottom: "10px" }}>
               <span style={{ fontSize: "3.5rem", fontWeight: "bold" }}>{metrics.totalTrades}</span>
               <span style={{ fontSize: "1.5rem", marginLeft: "10px" }}>trades,</span>
             </div>
             
             <div style={{ fontSize: "1.2rem", marginBottom: "5px" }}>totalling</div>
             <div style={{ fontSize: "3rem", fontWeight: "bold" }}>{fmtUSD(totalVolume)}</div>
             <div style={{ fontSize: "1rem", marginTop: "5px" }}>in volume.</div>

             <div style={{ height: "1px", background: "rgba(255,255,255,0.2)", margin: "30px 0" }} />

             <div style={{ fontSize: "1rem" }}>
                Your highest single-trade profit hit <br/>
                <span style={{ fontWeight: "bold", fontSize: "1.4rem" }}>{fmtUSD(biggestWin)}</span>
             </div>
          </div>
        </SpaceWindow>
      )
    },

    // --- SLIDE 5: REVEAL / MINT ---
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
          {/* Render the updated Summary Card for Minting */}
          <SummaryWarpCard 
            displayName={displayName} 
            userImage={userImage}
            metrics={metrics} 
            theme={theme} 
          />
        </div>
      )
    }
  ];

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (slideIndex === slides.length - 1) return;
    if (isPaused) return;

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
  }, [slideIndex, isPaused]);

  useEffect(() => {
    setProgress(0);
  }, [slideIndex]);

  const handleTap = (e: any) => {
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
      onPointerDown={() => setIsPaused(true)}
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

      {/* Progress Bars (Top) */}
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