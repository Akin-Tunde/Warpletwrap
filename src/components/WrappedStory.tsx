import { useState, useEffect } from "react";
import type { WarpletMetrics } from "../hooks/useWarpletData";
import DeFiWrappedCard from "./DeFiWrappedCard";
import SummaryWarpCard from "./SummaryWarpCard";

interface StoryProps {
  displayName: string;
  metrics: WarpletMetrics;
  theme: any;
  userImage: string;
}

export default function WrappedStory({ displayName, metrics, theme, userImage }: StoryProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const social = metrics.social || { 
    totalCasts: 0, breakdown: { casts: 0, replies: 0, recasts: 0 }, 
    topFriends: [], topChannels: [], likesReceived: 0, percentile: 50 
  };

  const slides = [
    // --- SLIDE 1: INTRO ---
    {
      id: "intro",
      bg: "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)", // Deep Purple
      content: (
        <div className="animate-pop">
          <img src={userImage} style={{ width: 120, height: 120, borderRadius: "50%", border: "4px solid #facc15", boxShadow: "0 0 20px rgba(250, 204, 21, 0.5)" }} />
          <h1 style={{ fontSize: "2.5rem", marginTop: 20, marginBottom: 10 }}>{displayName}</h1>
          <div style={{ fontSize: "1.2rem", opacity: 0.8 }}>2025 On-Chain Wrapped</div>
          <div style={{ fontSize: "4rem", marginTop: 40 }}>🔮</div>
        </div>
      )
    },
    
    // --- SLIDE 2: THE YAPPER (Activity) ---
    {
      id: "activity",
      bg: "#be185d", // Pink
      content: (
        <div className="animate-slide-up" style={{ width: "100%" }}>
          <h2 style={{ textTransform: "uppercase", letterSpacing: 2, opacity: 0.8 }}>The Yapper Stats</h2>
          
          <div style={{ margin: "40px 0" }}>
            <div style={{ fontSize: "5rem", fontWeight: "900", lineHeight: 1 }}>{social.likesReceived}</div>
            <div style={{ fontSize: "1.5rem" }}>Likes Received</div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 30 }}>
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "15px 25px", borderRadius: 15 }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{social.breakdown.casts}</div>
              <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>CASTS</div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "15px 25px", borderRadius: 15 }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{social.breakdown.replies}</div>
              <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>REPLIES</div>
            </div>
          </div>

          <div style={{ marginTop: 40, background: "white", color: "#be185d", padding: "10px 20px", borderRadius: 20, display: "inline-block", fontWeight: "bold" }}>
            Top {social.percentile}% Active User 🏆
          </div>
        </div>
      )
    },

    // --- SLIDE 3: THE SQUAD (Engagement) ---
    {
      id: "squad",
      bg: "#059669", // Emerald
      content: (
        <div className="animate-slide-up" style={{ width: "100%" }}>
          <h2>Your Squad</h2>
          <p style={{ opacity: 0.8, marginBottom: 30 }}>You couldn't stop talking to them.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
            {social.topFriends.map((friend, i) => (
              <div key={friend.fid} style={{ 
                display: "flex", alignItems: "center", gap: 15, 
                background: "rgba(0,0,0,0.2)", padding: 15, borderRadius: 50, 
                width: "90%", maxWidth: 300,
                transform: `scale(${1 - (i * 0.05)})` // Slight size step down
              }}>
                <div style={{ fontWeight: "bold", opacity: 0.5, width: 20 }}>#{i + 1}</div>
                <img src={friend.pfp} style={{ width: 50, height: 50, borderRadius: "50%" }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: "bold" }}>{friend.username}</div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Bestie</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },

    // --- SLIDE 4: THE HABITAT (Channels) ---
    {
      id: "channels",
      bg: "#2563eb", // Blue
      content: (
        <div className="animate-slide-up" style={{ width: "100%" }}>
          <h2>Your Habitats</h2>
          <p style={{ marginBottom: 40 }}>Where you touched grass (digitally).</p>
          
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20 }}>
            {social.topChannels.map((c, i) => (
              <div key={c.name} style={{ 
                background: "white", color: "#2563eb", 
                padding: 20, borderRadius: 20, 
                display: "flex", flexDirection: "column", alignItems: "center",
                width: i === 0 ? "160px" : "120px", // First one is bigger
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
              }}>
                <img src={c.imageUrl} style={{ width: i === 0 ? 60 : 40, height: i === 0 ? 60 : 40, borderRadius: 10, marginBottom: 10 }} />
                <div style={{ fontWeight: "bold", fontSize: i === 0 ? "1.2rem" : "1rem" }}>/{c.name}</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>{c.count} casts</div>
              </div>
            ))}
          </div>
        </div>
      )
    },

    // --- SLIDE 5: THE BAG (Wallet) ---
    {
      id: "finance",
      bg: "#111", 
      content: (
        <div className="animate-slide-up">
          <h2 style={{ color: metrics.totalProfitLoss >= 0 ? "#4ade80" : "#ef4444" }}>
            Wallet Check
          </h2>
          
          <div style={{ margin: "40px 0" }}>
            <div style={{ fontSize: "1rem", opacity: 0.7 }}>NET WORTH</div>
            <div style={{ fontSize: "3.5rem", fontWeight: "900" }}>
               ${(metrics.currentNetWorth / 1000).toFixed(1)}k
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#222", padding: 20, borderRadius: 20, border: "1px solid #333" }}>
              <div style={{ fontSize: "2rem" }}>💸</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: 5 }}>GAS GUZZLED</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{metrics.totalTrades * 2} txn</div>
            </div>
            <div style={{ background: "#222", padding: 20, borderRadius: 20, border: "1px solid #333" }}>
              <div style={{ fontSize: "2rem" }}>🎯</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: 5 }}>WIN RATE</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{metrics.winRate.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )
    },

    // --- SLIDE 6: THE REVEAL ---
    {
      id: "reveal",
      bg: "#000",
      content: (
        <div className="animate-in" style={{ width: "100%" }}>
          <h2 style={{ marginBottom: 10, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.9rem' }}>The Final Result</h2>
          
          {/* Reuse the Premium Metal Card */}
          <DeFiWrappedCard displayName={displayName} metrics={metrics} theme={theme} />
          
        </div>
      )
    },
  {
      id: "reveal",
      bg: "#000",
      content: (
        <div className="animate-in" style={{ width: "100%" }}>
          <h2 style={{ marginBottom: 15, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', opacity: 0.7 }}>
            The Result
          </h2>
          
          {/* RENDER THE NEW SUMMARY CARD */}
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
        return old + 1.5; // Speed
      });
    }, 100);

    return () => clearInterval(timer);
  }, [slideIndex, isPaused]);

  // Reset progress on slide change
  useEffect(() => {
    setProgress(0);
  }, [slideIndex]);

  const handleTap = (e: any) => {
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
        background: slides[slideIndex].bg,
        color: "white",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "20px", textAlign: "center",
        transition: "background 0.5s ease",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      <style>{`
        .animate-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-slide-up { animation: slideUp 0.6s ease-out; }
        @keyframes popIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Progress Bars */}
      <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", gap: 5, zIndex: 10 }}>
        {slides.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "white",
              width: i < slideIndex ? "100%" : i === slideIndex ? `${progress}%` : "0%",
              transition: "width 0.1s linear"
            }} />
          </div>
        ))}
      </div>

      {slides[slideIndex].content}

      {slideIndex < slides.length - 1 && (
        <div style={{ position: "absolute", bottom: 20, opacity: 0.5, fontSize: "0.7rem", animation: "pulse 2s infinite" }}>
          Tap to advance • Hold to pause
        </div>
      )}
    </div>
  );
}