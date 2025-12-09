import { useState } from "react";

interface ChainSelectorProps {
  currentChain: string;
  onSelect: (chain: string) => void;
  theme: any;
}

const chains = [
  { id: "base", name: "Base", icon: "🔵" },
  { id: "eth", name: "Ethereum", icon: "💎" },
  { id: "arbitrum", name: "Arbitrum", icon: "💙" },
  { id: "optimism", name: "Optimism", icon: "🔴" },
  { id: "polygon", name: "Polygon", icon: "💜" },
];

export default function ChainSelector({ currentChain, onSelect, theme }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeChain = chains.find(c => c.id === currentChain) || chains[0];

  return (
    <div style={{ position: "relative", zIndex: 50 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: theme.secondaryBg,
          border: `1px solid ${theme.accentColor}40`,
          color: theme.textColor,
          padding: "8px 16px",
          borderRadius: "20px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "0.9rem",
        }}
      >
        <span>{activeChain.icon}</span>
        <span>{activeChain.name}</span>
        <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "110%",
          left: 0,
          background: theme.cardBg,
          border: `1px solid ${theme.accentColor}40`,
          borderRadius: "12px",
          overflow: "hidden",
          minWidth: "140px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {chains.map((chain) => (
            <div
              key={chain.id}
              onClick={() => {
                onSelect(chain.id);
                setIsOpen(false);
              }}
              style={{
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                background: currentChain === chain.id ? theme.accentColor + "20" : "transparent",
                color: theme.textColor,
              }}
            >
              <span>{chain.icon}</span>
              {chain.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}