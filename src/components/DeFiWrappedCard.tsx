import { useMemo, useRef, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { toBlob } from "html-to-image";
import { parseEther } from "viem";
import type { WarpletMetrics } from "../hooks/useWarpletData";
import { MintContract } from "../lib/Contracts";
import { uploadBlobToIPFS, uploadToIPFS, getIPFSUrl } from "../lib/pinata";

interface DeFiCardProps {
  displayName: string;
  metrics: WarpletMetrics;
  theme: any;
}

export default function DeFiWrappedCard({ displayName, metrics, theme }: DeFiCardProps) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  // 1. Ref to capture the DOM element
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 2. Local State for UI feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successHash, setSuccessHash] = useState<string | null>(null);

  const income = metrics.income;

  // Determine Archetype
  const archetype = useMemo(() => {
    const { staking, lending, liquidity, airdrop } = income;
    const max = Math.max(staking, lending, liquidity, airdrop);

    if (max === 0) return "Cash Holder 🏦";
    if (max === staking) return "Yield Validator 🥩";
    if (max === liquidity) return "Liquidity Lord 🚜";
    if (max === lending) return "Money Market Mogul 🎩";
    if (max === airdrop) return "Airdrop Hunter 🪂";
    return "DeFi Explorer 🧭";
  }, [income]);

  // Format currency
  const formatCompact = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(val);

  // 3. MINT FUNCTION
  const handleMint = async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    setSuccessHash(null);

    try {
      // A. Snapshot the card
      const node = cardRef.current;
      if (!node) throw new Error("Card element not found");
      
      // Force dimensions to ensure high quality capture
      const blob = await toBlob(node, { 
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: theme.bg // Ensure background isn't transparent
      });
      
      if (!blob) throw new Error("Failed to generate image");

      // B. Upload Image to Pinata
      const imageHash = await uploadBlobToIPFS(blob, "defi-card.png");
      const imageUrl = getIPFSUrl(imageHash);

      // C. Upload Metadata to Pinata
      // We explicitly save "DeFi Report" attributes here
      const metadataHash = await uploadToIPFS({
        username: displayName,
        totalProfitLoss: metrics.totalProfitLoss, // Required by type, but we add custom attr below
        winRate: metrics.winRate,
        netWorth: metrics.currentNetWorth,
        imageUrl: imageUrl,
        timestamp: Date.now(),
      });

      // D. Call Smart Contract
      // Note: We use the generic mintWithETH function, but pass our specific DeFi Metadata URI
      const txHash = await writeContractAsync({
        address: MintContract.address as `0x${string}`,
        abi: MintContract.abi,
        functionName: "mintWithETH",
        args: [
          displayName,
          BigInt(Math.floor(metrics.totalProfitLoss * 100)),
          BigInt(Math.floor(metrics.winRate * 100)),
          BigInt(Math.floor(metrics.currentNetWorth * 100)),
          `ipfs://${metadataHash}` // <--- This points to the DeFi Card image
        ],
        value: parseEther("0.0003"), // Price: 0.0003 ETH
      });

      setSuccessHash(txHash);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Minting failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/* 4. WRAP CARD IN REF */}
      <div
        ref={cardRef}
        style={{
          width: "100%",
          maxWidth: "380px",
          margin: "0 auto 2rem",
          aspectRatio: "3/4",
          background: `linear-gradient(145deg, ${theme.cardBg} 0%, #111 100%)`,
          borderRadius: "20px",
          padding: "20px",
          position: "relative",
          overflow: "hidden",
          border: `2px solid ${theme.accentColor}`,
          boxShadow: `0 0 20px ${theme.accentColor}40`,
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        {/* Background Decor */}
        <div style={{ position: "absolute", top: -50, right: -50, fontSize: "15rem", opacity: 0.05, pointerEvents: "none" }}>
          ⚡
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", zIndex: 2 }}>
          <div style={{ 
            background: theme.accentColor, 
            color: theme.bg, 
            display: "inline-block", 
            padding: "4px 12px", 
            borderRadius: "12px", 
            fontWeight: "bold", 
            fontSize: "0.8rem",
            marginBottom: "10px",
            textTransform: "uppercase"
          }}>
            2025 DeFi Report
          </div>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{displayName}</h2>
          <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: theme.accentColor, marginTop: "5px" }}>
            {archetype}
          </div>
        </div>

        {/* Central Visual: Active Capital */}
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px" }}>
            Total Active Capital
          </div>
          <div style={{ fontSize: "3rem", fontWeight: "800", textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
            {formatCompact(income.total)}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "10px", 
          background: "rgba(255,255,255,0.05)", 
          padding: "15px", 
          borderRadius: "15px",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          {/* Staking */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "1.5rem" }}>🥩</div>
            <div>
              <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>STAKING</div>
              <div style={{ fontWeight: "bold" }}>{formatCompact(income.staking)}</div>
            </div>
          </div>

          {/* Liquidity */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "1.5rem" }}>🚜</div>
            <div>
              <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>LIQUIDITY</div>
              <div style={{ fontWeight: "bold" }}>{formatCompact(income.liquidity)}</div>
            </div>
          </div>

          {/* Lending */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "1.5rem" }}>🏦</div>
            <div>
              <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>LENDING</div>
              <div style={{ fontWeight: "bold" }}>{formatCompact(income.lending)}</div>
            </div>
          </div>

          {/* Airdrops */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "1.5rem" }}>🪂</div>
            <div>
              <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>AIRDROPS</div>
              <div style={{ fontWeight: "bold" }}>{formatCompact(income.airdrop)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "0.7rem", opacity: 0.5, marginTop: "10px" }}>
          Verified on Warplet • {new Date().getFullYear()}
        </div>
      </div>

      {/* 5. MINT CONTROLS */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Error Message */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {successHash && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center' }}>
            🎉 Minted! Check wallet for confirmation.
          </div>
        )}

        <button
          onClick={handleMint}
          disabled={isLoading || !address}
          style={{
            background: theme.accentColor,
            color: theme.bg,
            border: 'none',
            padding: '12px 24px',
            borderRadius: '16px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: `0 4px 12px ${theme.accentColor}40`,
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isLoading ? (
            <>Processing...</>
          ) : (
            <>
              <span>✨</span> Mint DeFi Card (0.0003 ETH)
            </>
          )}
        </button>
      </div>
    </div>
  );
}