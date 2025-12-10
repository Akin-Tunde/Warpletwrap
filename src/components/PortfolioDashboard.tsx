import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import type { WarpletMetrics } from "../hooks/useWarpletData";
// 1. IMPORT THE CARD
import DeFiWrappedCard from "./DeFiWrappedCard";

interface DashboardProps {
  metrics: WarpletMetrics;
  theme: any;
  view: "allocation" | "income" | "history";
  chainName?: string;
  displayName?: string; // Added prop
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const formatUSD = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatBalance = (val: string, decimals: number) => {
  const num = Number(val) / (10 ** decimals);
  return num > 1 ? num.toLocaleString(undefined, { maximumFractionDigits: 2 }) : num.toPrecision(4);
};

const getChainIcon = (chain: string) => {
  switch(chain) {
    case 'eth': return '💎';
    case 'base': return '🔵';
    case 'arbitrum': return '💙';
    case 'optimism': return '🔴';
    case 'polygon': return '💜';
    default: return '⛓️';
  }
};

export default function PortfolioDashboard({
  metrics,
  theme,
  view,
  chainName = "base",
  displayName = "Trader",
}: DashboardProps) {
  
  // --- STATE ---
  const [currentPage, setCurrentPage] = useState(0);
  const [incomeTab, setIncomeTab] = useState<'stats' | 'card'>('stats'); // 2. NEW TAB STATE
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(0);
    setIncomeTab('stats'); // Reset tab when view changes
  }, [chainName, metrics, view]);

  const holdings = metrics.holdings || [];
  //const income = metrics.income || { airdrops: 0, staking: 0 };
  const roi = metrics.roi || { bestAsset: null, worstAsset: null, averageRoi: 0 };

  const sortedHoldings = [...holdings].sort((a, b) => b.usd_value - a.usd_value);
  const totalPages = Math.ceil(sortedHoldings.length / ITEMS_PER_PAGE);
  const paginatedHoldings = sortedHoldings.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  
  const topHoldings = sortedHoldings.slice(0, 5);
  const otherValue = sortedHoldings.slice(5).reduce((acc, curr) => acc + curr.usd_value, 0);

  const allocationData = [
    ...topHoldings.map((h) => ({ name: h.symbol, value: h.usd_value })),
    { name: "Others", value: otherValue },
  ].filter((d) => d.value > 0);

  const historyData = [
    { name: "Jan", value: metrics.currentNetWorth * 0.8 },
    { name: "Feb", value: metrics.currentNetWorth * 0.7 },
    { name: "Mar", value: metrics.currentNetWorth * 0.9 },
    { name: "Apr", value: metrics.currentNetWorth * 1.1 },
    { name: "May", value: metrics.currentNetWorth },
  ];

  const ContainerStyle = {
    width: "100%", maxWidth: "800px", margin: "0 auto", color: theme.textColor,
    padding: "1rem", boxSizing: "border-box" as const, paddingBottom: "120px",
  };

  const CardStyle = {
    background: theme.secondaryBg, borderRadius: "1.25rem", padding: "1.5rem",
    marginBottom: "1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: `1px solid ${theme.accentColor}20`,
  };

  // --- VIEW 1: ASSET ALLOCATION ---
  if (view === "allocation") {
    return (
      <div style={ContainerStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: theme.cardBg, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', marginBottom: '8px', border: `1px solid ${theme.accentColor}40` }}>
            <span>{getChainIcon(chainName)}</span>
            <span style={{ textTransform: 'capitalize' }}>{chainName} Balance</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>{formatUSD(metrics.currentNetWorth)}</div>
          <div style={{ color: metrics.totalProfitLoss >= 0 ? theme.positiveColor : theme.negativeColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
            <span>{metrics.totalProfitLoss >= 0 ? '▲' : '▼'}</span>
            <span>{formatUSD(Math.abs(metrics.totalProfitLoss))}</span>
            <span style={{ opacity: 0.6, fontWeight: 'normal' }}>(All Time)</span>
          </div>
        </div>

        <div style={{ ...CardStyle, height: "320px", position: 'relative' }}>
          <h3 style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', margin: 0, fontSize: '1rem', fontWeight: '600' }}>Allocation</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={allocationData} cx="50%" cy="55%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                {allocationData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={theme.cardBg} strokeWidth={2} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: theme.cardBg, borderRadius: "12px", border: "none", color: theme.textColor }} formatter={(value: number) => formatUSD(value)} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...CardStyle, padding: "0" }}>
          <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: `1px solid ${theme.accentColor}10`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Assets ({sortedHoldings.length})</h3>
            {totalPages > 1 && <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Page {currentPage + 1}/{totalPages}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {paginatedHoldings.length > 0 ? (
              paginatedHoldings.map((token, index) => {
                 const tokenRoi = (token as any).roi || 0;
                 const isProfitable = tokenRoi >= 0;
                 return (
                    <div key={`${token.token_address}-${index}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.accentColor}10` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                             {token.thumbnail || token.logo ? <img src={token.thumbnail || token.logo || ""} alt={token.symbol} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('hidden'); }} /> : null}
                             <div hidden={!!(token.thumbnail || token.logo)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#444", display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem' }}>{token.symbol.substring(0,2)}</div>
                             <div>
                                <div style={{ fontWeight: "700" }}>{token.symbol}</div>
                                <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>{formatBalance(token.balance, token.decimals)}</div>
                             </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                           <div style={{ fontWeight: "700" }}>{formatUSD(token.usd_value)}</div>
                           {Math.abs(tokenRoi) > 0.01 ? <div style={{ fontSize: "0.8rem", color: isProfitable ? theme.positiveColor : theme.negativeColor }}>{isProfitable ? '+' : ''}{tokenRoi.toFixed(1)}%</div> : <div style={{ fontSize: "0.8rem", opacity: 0.4 }}>${token.usd_price.toFixed(2)}</div>}
                        </div>
                    </div>
                 );
              })
            ) : <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>No assets found on {chainName}</div>}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem', background: theme.cardBg + "80", borderBottomLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}>
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} style={{ background: currentPage === 0 ? 'transparent' : theme.accentColor, color: currentPage === 0 ? theme.textColor : theme.bg, border: `1px solid ${currentPage === 0 ? theme.textColor + '40' : 'transparent'}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === 0 ? 0.3 : 1 }}>←</button>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Page {currentPage + 1}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} style={{ background: currentPage >= totalPages - 1 ? 'transparent' : theme.accentColor, color: currentPage >= totalPages - 1 ? theme.textColor : theme.bg, border: `1px solid ${currentPage >= totalPages - 1 ? theme.textColor + '40' : 'transparent'}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages - 1 ? 0.3 : 1 }}>→</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 2: INCOME (UPDATED WITH TABS) ---
  if (view === "income") {
    // @ts-ignore
    const breakdown = metrics.income as any; 
    
    return (
      <div style={ContainerStyle}>
        
        {/* 3. TOGGLE SWITCH */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
          <div style={{ background: theme.secondaryBg, padding: '4px', borderRadius: '30px', display: 'flex', gap: '4px', border: `1px solid ${theme.accentColor}40` }}>
            <button 
              onClick={() => setIncomeTab('stats')}
              style={{
                background: incomeTab === 'stats' ? theme.accentColor : 'transparent',
                color: incomeTab === 'stats' ? theme.bg : theme.textColor,
                border: 'none', padding: '8px 24px', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              📊 Stats
            </button>
            <button 
              onClick={() => setIncomeTab('card')}
              style={{
                background: incomeTab === 'card' ? theme.accentColor : 'transparent',
                color: incomeTab === 'card' ? theme.bg : theme.textColor,
                border: 'none', padding: '8px 24px', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              🆔 ID Card
            </button>
          </div>
        </div>

        {/* TAB CONTENT: CARD */}
        {incomeTab === 'card' ? (
          <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <DeFiWrappedCard displayName={displayName} metrics={metrics} theme={theme} />
            <p style={{ opacity: 0.6, fontSize: '0.8rem', textAlign: 'center', maxWidth: '300px' }}>
              Take a screenshot to share your DeFi archetype! Minting for this card coming soon.
            </p>
          </div>
        ) : (
          /* TAB CONTENT: STATS (The original grid) */
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: theme.cardBg, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', marginBottom: '8px', border: `1px solid ${theme.accentColor}40` }}>
                 <span>⚡</span><span>DeFi Activity</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', color: theme.accentColor }}>{formatUSD(breakdown.total)}</div>
              <div style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.25rem' }}>Active Capital in Strategies</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { title: "Airdrops", icon: "🪂", value: breakdown.airdrop, color: "#8b5cf6" },
                { title: "Staking", icon: "🥩", value: breakdown.staking, color: "#10b981" },
                { title: "Yield", icon: "🚜", value: breakdown.liquidity, color: "#f59e0b" },
                { title: "Lending", icon: "🏦", value: breakdown.lending, color: "#3b82f6" },
              ].map((card) => (
                <div key={card.title} style={{ ...CardStyle, marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '4rem', opacity: 0.1 }}>{card.icon}</div>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{card.icon}</div>
                  <h3 style={{ fontSize: "0.8rem", opacity: 0.7, margin: 0 }}>{card.title}</h3>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: card.value > 0 ? card.color : theme.textColor }}>{formatUSD(card.value)}</div>
                </div>
              ))}
            </div>

            <div style={{ ...CardStyle, padding: "0" }}>
              <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: `1px solid ${theme.accentColor}10` }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Active Positions</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {breakdown.details.length > 0 ? (
                  breakdown.details.sort((a: any, b: any) => b.value - a.value).map((item: any, index: number) => (
                    <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: index !== breakdown.details.length - 1 ? `1px solid ${theme.accentColor}10` : 'none' }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {item.logo ? <img src={item.logo} alt={item.symbol} style={{ width: "32px", height: "32px", borderRadius: "50%" }} /> : <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: theme.accentColor + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>💰</div>}
                        <div>
                          <div style={{ fontWeight: "700" }}>{item.symbol}</div>
                          <div style={{ fontSize: "0.75rem", opacity: 0.8, color: theme.accentColor, background: theme.bg, padding: "2px 8px", borderRadius: "10px", display: "inline-block" }}>{item.category}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontWeight: "bold" }}>{formatUSD(item.value)}</div>
                    </div>
                  ))
                ) : <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>No active DeFi positions found on {chainName}.</div>}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- VIEW 3: HISTORY ---
  if (view === "history") {
    // ... (Keep existing history logic)
    return (
      <div style={ContainerStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Performance</h2>
        <div style={{ ...CardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <div>
             <h3 style={{ fontSize: "0.9rem", opacity: 0.8, margin: 0 }}>Portfolio ROI</h3>
             <div style={{ fontSize: "2.5rem", fontWeight: "800", color: roi.averageRoi >= 0 ? theme.positiveColor : theme.negativeColor }}>
                {roi.averageRoi > 0 ? '+' : ''}{roi.averageRoi.toFixed(2)}%
             </div>
           </div>
           <div style={{ fontSize: "3rem" }}>📈</div>
        </div>
        <div style={{ ...CardStyle, height: "350px", padding: "1.5rem 0.5rem 0 0" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.accentColor} stopOpacity={0.8} /><stop offset="95%" stopColor={theme.accentColor} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis dataKey="name" stroke={theme.textColor} opacity={0.5} tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
              <YAxis stroke={theme.textColor} opacity={0.5} tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`}/>
              <Tooltip contentStyle={{ backgroundColor: theme.cardBg, borderRadius: "12px", border: "none", color: theme.textColor }} formatter={(val: number) => formatUSD(val)}/>
              <Area type="monotone" dataKey="value" stroke={theme.accentColor} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
}