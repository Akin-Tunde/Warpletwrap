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

  // Data Extraction (Wallet Only)
  const netWorth = metrics.currentNetWorth || 0;
  const pnl = metrics.totalProfitLoss || 0;
  const vol = metrics.totalTradeVolume || 0;
  const tradeCount = metrics.totalTrades || 0;
  const archetype = metrics.archetype || "Explorer";
  
  // Calculate Tenure
  const daysActive = metrics.firstTransactionDate 
    ? Math.floor((Date.now() - new Date(metrics.firstTransactionDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Formatters
  const fmtUSD = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact" }).format(n);

  const handleMint = async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const node = cardRef.current;
      if (!node) throw new Error("Card not found");
      
      const blob = await toBlob(node, { cacheBust: true, pixelRatio: 2, backgroundColor: "#000" });

      if (!blob) throw new Error("Failed to generate image blob");

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
      
      {/* --- THE SPACE PORTHOLE CARD --- */}
      <div
        ref={cardRef}
        style={{
          width: "100%",
          maxWidth: "340px",
          aspectRatio: "9/16",
          background: "#050505",
          backgroundImage: "radial-gradient(circle at 50% 0%, #1a1a2e 0%, #000 70%)",
          borderRadius: "40px",
          border: "4px solid #333",
          padding: "24px",
          position: "relative",
          color: "white",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.8), 0 20px 50px rgba(0,0,0,0.5)",
          overflow: "hidden",
          fontFamily: "Inter, system-ui, sans-serif"
        }}
      >
        {/* Stars Background Effect */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: `radial-gradient(white 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

        {/* HEADER: Identity */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, marginTop: "10px" }}>
          <img src={userImage} style={{ width: 70, height: 70, borderRadius: "50%", border: "2px solid #fbbf24", boxShadow: "0 0 15px rgba(251, 191, 36, 0.3)" }} />
          <div style={{ fontSize: "1.2rem", fontWeight: "800", marginTop: "10px" }}>{displayName}</div>
          <div style={{ 
            fontSize: "0.7rem", 
            background: "rgba(255,255,255,0.1)", 
            padding: "4px 12px", 
            borderRadius: "20px",
            marginTop: "5px",
            color: "#fbbf24"
          }}>
            2025 TRADING RECAP
          </div>
        </div>

        {/* STATS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px", zIndex: 2 }}>
          
          {/* Row 1: Net Worth */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
            <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>Current Equity</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{fmtUSD(netWorth)}</div>
          </div>

          {/* Row 2: PnL */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
            <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>Total PnL</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: pnl >= 0 ? "#4ade80" : "#ef4444" }}>
              {pnl >= 0 ? "+" : ""}{fmtUSD(pnl)}
            </div>
          </div>

          {/* Row 3: Volume */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
            <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>Trading Volume</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{fmtUSD(vol)}</div>
          </div>

           {/* Row 4: Stats Grid */}
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "5px" }}>
             <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#fbbf24" }}>{daysActive}</div>
                <div style={{ fontSize: "0.6rem", opacity: 0.6 }}>DAYS ACTIVE</div>
             </div>
             <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#fbbf24" }}>{tradeCount}</div>
                <div style={{ fontSize: "0.6rem", opacity: 0.6 }}>TOTAL TRADES</div>
             </div>
           </div>
        </div>

        {/* FOOTER: ARCHETYPE */}
        <div style={{ 
          marginTop: "auto", 
          textAlign: "center",
          zIndex: 2,
          padding: "15px",
          background: "linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, rgba(0,0,0,0) 100%)",
          borderRadius: "20px 20px 0 0",
          borderTop: "1px solid rgba(251, 191, 36, 0.3)"
        }}>
          <div style={{ fontSize: "0.7rem", opacity: 0.7, textTransform: "uppercase" }}>Trader Archetype</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>
            {archetype}
          </div>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div style={{ marginTop: '20px', width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        {successHash && <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center' }}>🎉 Minted!</div>}

        <button
          onClick={handleMint}
          disabled={isLoading || !address}
          style={{
            width: '100%',
            background: "#fbbf24",
            color: "black",
            border: 'none',
            padding: '16px',
            borderRadius: '30px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: `0 4px 20px rgba(251, 191, 36, 0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          {isLoading ? "Minting..." : "Mint Recap (0.0003 ETH)"}
        </button>
      </div>
    </div>
  );
}