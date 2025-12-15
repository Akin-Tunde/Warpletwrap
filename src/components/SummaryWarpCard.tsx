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
  const fmtNum = (n: number) => new Intl.NumberFormat('en-US').format(n);

  // --- REUSABLE SPACE WINDOW COMPONENT ---
  const SpaceWindow = ({ children, tag }: { children: React.ReactNode, tag?: string }) => (
    <div style={{
      width: "100%",
      height: "100%",
      maxWidth: "400px",
      maxHeight: "750px", // Limit height to keep aspect ratio on tall screens
      aspectRatio: "9/18",
      background: "#000",
      backgroundImage: "radial-gradient(circle at 50% 100%, #1e1b4b 0%, #000 60%)",
      borderRadius: "45px",
      border: "6px solid #2d2d2d",
      boxShadow: "inset 0 0 60px rgba(0,0,0,0.9), 0 0 0 2px #000",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center", // Center content vertically
      padding: "20px",
      overflow: "hidden",
      boxSizing: "border-box"
    }}>
      {/* Star Field Background */}
      <div style={{ 
        position: 'absolute', inset: 0, opacity: 0.6, 
        backgroundImage: `radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)`, 
        backgroundSize: '40px 40px',
        zIndex: 0
      }} />

      {/* Optional Tag at Top */}
      {tag && (
        <div style={{
          position: "absolute",
          top: "80px",
          background: "rgba(255, 255, 255, 0.1)",
          padding: "8px 16px",
          borderRadius: "20px",
          fontSize: "0.8rem",
          color: "#fbbf24", // Gold text
          backdropFilter: "blur(4px)",
          zIndex: 2
        }}>
          {tag}
        </div>
      )}

      {/* Content Container */}
      <div style={{ zIndex: 2, width: "100%", textAlign: "center" }}>
        {children}
      </div>

      {/* Bottom Planet Effect */}
      <div style={{
        position: "absolute",
        bottom: "-100px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle at 50% 0%, #3b82f6 0%, transparent 70%)",
        opacity: 0.3,
        borderRadius: "50%",
        filter: "blur(40px)",
        zIndex: 1
      }} />
    </div>
  );

  const slides = [
    // --- SLIDE 1: INTRO ---
    {
      id: "intro",
      content: (
        <SpaceWindow>
          <div className="animate-fade-in">
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>Warplet</h1>
            <div style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Hey there!</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", lineHeight: 1.4 }}>
              Ready to dive into<br />your 2025 Trading Recap?
            </div>
            <div style={{ fontSize: "4rem", marginTop: "40px" }}>👨‍🚀</div>
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
            <div style={{ fontSize: "1.1rem", marginBottom: "20px" }}>You've been active for</div>
            
            <div style={{ fontSize: "4rem", fontWeight: "900", lineHeight: 1 }}>
              {daysActive}
            </div>
            <div style={{ fontSize: "1.2rem", marginBottom: "40px", opacity: 0.8 }}>day(s)</div>

            <div style={{ fontSize: "1rem", lineHeight: 1.6, maxWidth: "280px", margin: "0 auto", opacity: 0.9 }}>
              Navigating the markets through the volatility of 2025.
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
          <div className="animate-slide-up" style={{ textAlign: "left", padding: "0 20px" }}>
            
            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontSize: "1rem", opacity: 0.7, marginBottom: "5px" }}>Current Account Equity:</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                 {fmtUSD(currentEquity)}
              </div>
            </div>

            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontSize: "1rem", opacity: 0.7, marginBottom: "5px" }}>Total PnL (Realized):</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: metrics.totalProfitLoss >= 0 ? "#4ade80" : "#ef4444" }}>
                 {metrics.totalProfitLoss >= 0 ? "+" : ""}{fmtUSD(metrics.totalProfitLoss)}
              </div>
            </div>

          </div>
        </SpaceWindow>
      )
    },

    // --- SLIDE 4: VOLUME ---
    {
      id: "volume",
      content: (
        <SpaceWindow tag="2025 Milestones">
          <div className="animate-slide-up" style={{ textAlign: "left", padding: "0 20px" }}>
             <div style={{ fontSize: "1.2rem", marginBottom: "10px" }}>In 2025, you completed</div>
             <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#fbbf24" }}>
                {metrics.totalTrades} <span style={{ fontSize: "1.5rem", color: "white" }}>trades,</span>
             </div>
             
             <div style={{ fontSize: "1.2rem", marginTop: "10px" }}>totalling</div>
             <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{fmtUSD(totalVolume)}</div>
             <div style={{ fontSize: "1rem", opacity: 0.6, marginBottom: "40px" }}>in volume.</div>

             <div style={{ fontSize: "1rem", opacity: 0.8 }}>
                Your best single trade profit hit <br/>
                <span style={{ fontWeight: "bold", color: "#4ade80", fontSize: "1.2rem" }}>{fmtUSD(biggestWin)}</span>
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
    if (slideIndex === slides.length - 1) return; // Stop at end
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          setSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
          return 0;
        }
        return old + 1.2; // Speed
      });
    }, 100);

    return () => clearInterval(timer);
  }, [slideIndex, isPaused]);

  useEffect(() => {
    setProgress(0);
  }, [slideIndex]);

  const handleTap = (e: any) => {
    // Prevent tap if clicking a button (like Mint)
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
        position: "fixed", top: 0, left: 0, right: 0, bottom: "80px", // Leave room for bottom nav
        background: "#000",
        color: "white",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif"
      }}
    >
      <style>{`
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
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

      {/* Main Content Area */}
      {slides[slideIndex].content}

      {/* Tap hint only on first slide */}
      {slideIndex === 0 && (
        <div style={{ position: "absolute", bottom: 20, opacity: 0.5, fontSize: "0.8rem", animation: "pulse 2s infinite" }}>
          Tap to start
        </div>
      )}
    </div>
  );
}