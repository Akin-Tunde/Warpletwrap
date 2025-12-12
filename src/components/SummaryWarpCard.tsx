import { useState, useRef } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { toBlob } from "html-to-image";
import { parseEther } from "viem";
import type { WarpletMetrics } from "../hooks/useWarpletData";
import { MintContract } from "../lib/Contracts";
import { uploadBlobToIPFS, uploadToIPFS, getIPFSUrl } from "../lib/pinata";

interface SummaryCardProps {
  displayName: string;
  userImage: string;
  metrics: WarpletMetrics;
  theme: any;
}

export default function SummaryWarpCard({ displayName, userImage, metrics, theme }: SummaryCardProps) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successHash, setSuccessHash] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Safe Data Access
  const social = metrics.social || { likesReceived: 0, topFriends: [], topChannels: [], breakdown: { casts: 0, replies: 0 } };
  const netWorth = metrics.currentNetWorth || 0;
  const pnl = metrics.totalProfitLoss || 0;
  const archetype = metrics.archetype || "Explorer";

  // Formatters
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: "compact" }).format(n);
  const fmtUSD = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact" }).format(n);

  // --- MINT LOGIC ---

  const handleMint = async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const node = cardRef.current;
      if (!node) throw new Error("Card not found");
      
      const blob = await toBlob(node, { cacheBust: true, pixelRatio: 2, backgroundColor: "#000" });

      if (!blob) {
        throw new Error("Failed to generate image blob");
      }

      const imageHash = await uploadBlobToIPFS(blob, "summary-card.png");
      const imageUrl = getIPFSUrl(imageHash);

      const metadataHash = await uploadToIPFS({
        username: displayName,
        totalProfitLoss: pnl,
        winRate: metrics.winRate,
        netWorth: netWorth,
        imageUrl: imageUrl,
        timestamp: Date.now(),
      });

      const txHash = await writeContractAsync({
        address: MintContract.address as `0x${string}`,
        abi: MintContract.abi,
        functionName: "mintWithETH",
        args: [
          displayName, 
          BigInt(Math.floor(pnl * 100)), 
          BigInt(Math.floor(metrics.winRate * 100)), 
          BigInt(Math.floor(netWorth * 100)), 
          `ipfs://${metadataHash}`
        ],
        value: parseEther("0.0003"),
      });
      setSuccessHash(txHash);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Mint failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      
      {/* --- THE WARP CARD --- */}
      <div
        ref={cardRef}
        style={{
          width: "100%",
          maxWidth: "360px",
          aspectRatio: "3/5", // Tall format for Stories
          background: "#000",
          backgroundImage: "radial-gradient(circle at 100% 0%, #4c1d95 0%, #000 50%), radial-gradient(circle at 0% 100%, #be185d 0%, #000 50%)",
          borderRadius: "24px",
          padding: "20px",
          position: "relative",
          color: "white",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          fontFamily: "Inter, system-ui, sans-serif"
        }}
      >
        {/* Noise Texture Overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        {/* HEADER: Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", zIndex: 2 }}>
          <img src={userImage} style={{ width: 60, height: 60, borderRadius: "20px", border: "2px solid rgba(255,255,255,0.2)" }} />
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: "800" }}>{displayName}</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px" }}>2025 Wrapped</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: "2rem" }}>🔮</div>
        </div>

        {/* STATS BENTO GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", flex: 1, zIndex: 2 }}>
          
          {/* 1. SOCIAL SCORE */}
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "15px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.7rem", opacity: 0.7, textTransform: "uppercase" }}>Social Score</div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: "900", lineHeight: 1 }}>{fmt(social.likesReceived)}</div>
              <div style={{ fontSize: "0.8rem", color: "#fca5a5" }}>Likes Rcvd</div>
            </div>
            <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
              <div style={{ fontSize: "0.7rem", background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>{fmt(social.breakdown.casts)} Casts</div>
            </div>
          </div>

          {/* 2. NET WORTH */}
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "15px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.7rem", opacity: 0.7, textTransform: "uppercase" }}>The Bag</div>
            <div>
              <div style={{ fontSize: "1.8rem", fontWeight: "900", lineHeight: 1, color: "#86efac" }}>{fmtUSD(netWorth)}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Net Worth</div>
            </div>
            <div style={{ fontSize: "0.8rem", color: pnl >= 0 ? "#86efac" : "#fca5a5", fontWeight: "bold" }}>
              {pnl >= 0 ? "+" : ""}{fmtUSD(pnl)} PnL
            </div>
          </div>

          {/* 3. THE SQUAD (Full Width) */}
          <div style={{ gridColumn: "span 2", background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "15px", display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "0.7rem", opacity: 0.7, writingMode: "vertical-lr", transform: "rotate(180deg)", textTransform: "uppercase" }}>The Squad</div>
            <div style={{ display: "flex", gap: "10px", flex: 1, justifyContent: "space-around" }}>
              {social.topFriends.slice(0, 3).map((f) => (
                <div key={f.fid} style={{ textAlign: "center" }}>
                  <img src={f.pfp} style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #818cf8" }} />
                  <div style={{ fontSize: "0.6rem", marginTop: "4px", maxWidth: "50px", overflow: "hidden", textOverflow: "ellipsis" }}>{f.username}</div>
                </div>
              ))}
              {social.topFriends.length === 0 && <div style={{ opacity: 0.5, fontSize: "0.8rem" }}>No frens found 😔</div>}
            </div>
          </div>

          {/* 4. TOP CHANNEL */}
          <div style={{ background: "rgba(37, 99, 235, 0.2)", borderRadius: "16px", padding: "15px", border: "1px solid rgba(37, 99, 235, 0.4)" }}>
            <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>TOP HABITAT</div>
            {social.topChannels[0] ? (
              <div style={{ marginTop: "5px", display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={social.topChannels[0].imageUrl} style={{ width: 30, height: 30, borderRadius: "6px" }} />
                <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>/{social.topChannels[0].name}</div>
              </div>
            ) : (
              <div style={{ marginTop: "5px" }}>/nomad</div>
            )}
          </div>

          {/* 5. TOP ASSET */}
          <div style={{ background: "rgba(16, 185, 129, 0.2)", borderRadius: "16px", padding: "15px", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
            <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>BIGGEST WIN</div>
            <div style={{ marginTop: "5px", fontWeight: "bold", fontSize: "1.1rem" }}>
              {metrics.biggestWin ? `+${fmtUSD(metrics.biggestWin.profitUsd)}` : "$0"}
            </div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
              {metrics.biggestWin?.token.symbol || "None"}
            </div>
          </div>

        </div>

        {/* FOOTER: ARCHETYPE */}
        <div style={{ 
          background: "linear-gradient(90deg, #facc15 0%, #fbbf24 100%)", 
          borderRadius: "16px", 
          padding: "15px", 
          color: "black", 
          textAlign: "center",
          marginTop: "auto",
          zIndex: 2 
        }}>
          <div style={{ fontSize: "0.7rem", fontWeight: "bold", opacity: 0.7, textTransform: "uppercase" }}>2025 Archetype</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px" }}>
            {archetype}
          </div>
        </div>

      </div>

      {/* --- CONTROLS --- */}
      <div style={{ marginTop: '20px', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        {successHash && <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center' }}>🎉 Minted!</div>}

        <button
          onClick={handleMint}
          disabled={isLoading || !address}
          style={{
            width: '100%',
            background: theme.accentColor,
            color: "black",
            border: 'none',
            padding: '16px',
            borderRadius: '16px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: `0 4px 20px ${theme.accentColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          {isLoading ? "Minting..." : "✨ Mint Your Wrapped Card (0.0003 ETH)"}
        </button>
      </div>
    </div>
  );
}