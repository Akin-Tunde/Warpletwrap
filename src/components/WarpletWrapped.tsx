import type { WarpletMetrics } from "../hooks/useWarpletData";

interface WarpletWrappedProps {
  displayName: string;
  metrics: WarpletMetrics;
}

export default function WarpletWrapped({
  displayName,
  metrics,
}: WarpletWrappedProps) {
  const formatUSD = (amount: number) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui",
        background: "#0f0f0f",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "3rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "1.5rem",
          color: "white",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          {displayName}'s Warplet Wrapped
        </h1>
        {metrics.firstTransactionDate && (
          <div
            style={{
              textAlign: "center",
              opacity: 0.8,
              fontSize: "1rem",
              marginBottom: "2rem",
            }}
          >
            Trading since{" "}
            {new Date(metrics.firstTransactionDate).toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric", year: "numeric" }
            )}
          </div>
        )}

        {/* Total Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginBottom: "2rem",
            padding: "1.5rem",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "1rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Total P/L
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: metrics.totalProfitLoss >= 0 ? "#4ade80" : "#f87171",
              }}
            >
              {formatUSD(metrics.totalProfitLoss)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Win Rate
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
              {formatPercent(metrics.winRate)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Current Net Worth
            </div>
            <div
              style={{ fontSize: "2rem", fontWeight: "bold", color: "#fbbf24" }}
            >
              ${metrics.currentNetWorth.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Token Transfers
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
              {metrics.totalTokenTransfers.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              NFT Collections
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
              {metrics.totalNFTCollections}
            </div>
          </div>
        </div>

        {/* Biggest Win */}
        {metrics.biggestWin && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1.5rem",
              background: "rgba(16, 185, 129, 0.2)",
              borderRadius: "1rem",
              border: "2px solid rgba(16, 185, 129, 0.4)",
            }}
          >
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              🚀 Biggest Win
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              {metrics.biggestWin.token.logo && (
                <img
                  src={metrics.biggestWin.token.logo}
                  alt={metrics.biggestWin.token.symbol}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                  }}
                />
              )}
              <div>
                <div style={{ fontWeight: "bold" }}>
                  {metrics.biggestWin.token.name}
                </div>
                <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                  ${metrics.biggestWin.token.symbol}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#4ade80",
              }}
            >
              {formatUSD(metrics.biggestWin.profitUsd)}
            </div>
            <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>
              {formatPercent(
                metrics.biggestWin.token.realized_profit_percentage
              )}{" "}
              gain
            </div>
          </div>
        )}

        {/* Biggest Loss */}
        {metrics.biggestLoss && metrics.biggestLoss.profitUsd < 0 && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1.5rem",
              background: "rgba(239, 68, 68, 0.2)",
              borderRadius: "1rem",
              border: "2px solid rgba(239, 68, 68, 0.4)",
            }}
          >
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              💀 Biggest Loss
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              {metrics.biggestLoss.token.logo && (
                <img
                  src={metrics.biggestLoss.token.logo}
                  alt={metrics.biggestLoss.token.symbol}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                  }}
                />
              )}
              <div>
                <div style={{ fontWeight: "bold" }}>
                  {metrics.biggestLoss.token.name}
                </div>
                <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                  ${metrics.biggestLoss.token.symbol}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#f87171",
              }}
            >
              {formatUSD(metrics.biggestLoss.profitUsd)}
            </div>
            <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>
              {formatPercent(
                Math.abs(metrics.biggestLoss.token.realized_profit_percentage)
              )}{" "}
              loss
            </div>
          </div>
        )}

        {/* Trading Activity Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginBottom: "1.5rem",
            padding: "1.5rem",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "1rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Total Buys
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {metrics.totalBuys}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Total Sells
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {metrics.totalSells}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Bought Volume
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#4ade80",
              }}
            >
              ${metrics.totalBoughtVolume.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Sold Volume
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#f87171",
              }}
            >
              ${metrics.totalSoldVolume.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
