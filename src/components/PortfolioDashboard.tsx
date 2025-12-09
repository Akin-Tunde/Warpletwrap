
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { WarpletMetrics } from "../hooks/useWarpletData";

interface DashboardProps {
  metrics: WarpletMetrics;
  theme: any;
  view: "allocation" | "income" | "history";
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// Helper to format currency
const formatUSD = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// Helper to format crypto balance
const formatBalance = (val: string, decimals: number) => {
  const num = Number(val) / (10 ** decimals);
  return num > 1 ? num.toLocaleString(undefined, { maximumFractionDigits: 2 }) : num.toPrecision(4);
};

export default function PortfolioDashboard({
  metrics,
  theme,
  view,
}: DashboardProps) {
  const holdings = metrics.holdings || [];
  const income = metrics.income || { airdrops: 0, staking: 0 };
  const roi = metrics.roi || { bestAsset: null, worstAsset: null, averageRoi: 0 };

  // Sort by value
  const sortedHoldings = [...holdings].sort((a, b) => b.usd_value - a.usd_value);
  
  // Data for Pie Chart
  const topHoldings = sortedHoldings.slice(0, 5);
  const otherValue = sortedHoldings
    .slice(5)
    .reduce((acc, curr) => acc + curr.usd_value, 0);

  const allocationData = [
    ...topHoldings.map((h) => ({ name: h.symbol, value: h.usd_value })),
    { name: "Others", value: otherValue },
  ].filter((d) => d.value > 0);

  // Mock History Data
  const historyData = [
    { name: "Jan", value: metrics.currentNetWorth * 0.8 },
    { name: "Feb", value: metrics.currentNetWorth * 0.7 },
    { name: "Mar", value: metrics.currentNetWorth * 0.9 },
    { name: "Apr", value: metrics.currentNetWorth * 1.1 },
    { name: "May", value: metrics.currentNetWorth },
  ];

  const ContainerStyle = {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    color: theme.textColor,
    padding: "1rem",
    boxSizing: "border-box" as const,
    paddingBottom: "120px", // Space for bottom nav
  };

  const CardStyle = {
    background: theme.secondaryBg,
    borderRadius: "1.25rem",
    padding: "1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: `1px solid ${theme.accentColor}20`,
  };

  // --- VIEW 1: ASSET ALLOCATION (The Assets Page) ---
  if (view === "allocation") {
    return (
      <div style={ContainerStyle}>
        
        {/* 1. Header Summary */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.25rem' }}>Total Balance</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>
            {formatUSD(metrics.currentNetWorth)}
          </div>
          <div style={{ 
            color: metrics.totalProfitLoss >= 0 ? theme.positiveColor : theme.negativeColor,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            marginTop: '0.25rem'
          }}>
            <span>{metrics.totalProfitLoss >= 0 ? '▲' : '▼'}</span>
            <span>{formatUSD(Math.abs(metrics.totalProfitLoss))}</span>
            <span style={{ opacity: 0.6, fontWeight: 'normal' }}>(All Time)</span>
          </div>
        </div>

        {/* 2. Visual Allocation (Pie Chart) */}
        <div style={{ ...CardStyle, height: "320px", position: 'relative' }}>
          <h3 style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
            Allocation
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="55%" // Moved down slightly
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {allocationData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke={theme.cardBg}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.cardBg,
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  color: theme.textColor,
                  fontWeight: 'bold'
                }}
                formatter={(value: number) => formatUSD(value)}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => <span style={{ color: theme.textColor, opacity: 0.8, fontSize: '0.85rem' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Holdings List (Zerion Style) */}
        <div style={{ ...CardStyle, padding: "0" }}>
          <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: `1px solid ${theme.accentColor}10` }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Assets ({sortedHoldings.length})</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sortedHoldings.length > 0 ? (
              sortedHoldings.map((token, index) => {
                // Determine ROI styling
                // @ts-ignore - roi comes from our custom hook logic
                const tokenRoi = token.roi || 0;
                const isProfitable = tokenRoi >= 0;

                return (
                  <div
                    key={`${token.token_address}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 1.5rem",
                      borderBottom: index !== sortedHoldings.length - 1 ? `1px solid ${theme.accentColor}10` : 'none',
                    }}
                  >
                    {/* Left: Logo & Name */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ position: 'relative' }}>
                        {token.thumbnail || token.logo ? (
                          <img 
                            src={token.thumbnail || token.logo || ""} 
                            alt={token.symbol} 
                            style={{ 
                              width: "40px", 
                              height: "40px", 
                              borderRadius: "50%",
                              background: theme.bg,
                              objectFit: 'cover',
                              border: `1px solid ${theme.accentColor}20`
                            }} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('hidden');
                            }}
                          />
                        ) : null}
                        {/* Fallback for image error or missing image */}
                        <div 
                          hidden={!!(token.thumbnail || token.logo)}
                          style={{ 
                            width: "40px", 
                            height: "40px", 
                            borderRadius: "50%", 
                            background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]} 20%, ${theme.bg})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            color: '#fff'
                          }}
                        >
                          {token.symbol.substring(0, 2)}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "1rem" }}>{token.symbol}</div>
                        <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                           {formatBalance(token.balance, token.decimals)}
                        </div>
                      </div>
                    </div>

                    {/* Right: Value & ROI */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "700", fontSize: "1rem" }}>
                        {formatUSD(token.usd_value)}
                      </div>
                      {/* Show ROI if available (non-zero) */}
                      {Math.abs(tokenRoi) > 0.01 ? (
                        <div style={{ 
                          fontSize: "0.8rem", 
                          color: isProfitable ? theme.positiveColor : theme.negativeColor,
                          fontWeight: '500' 
                        }}>
                          {isProfitable ? '+' : ''}{tokenRoi.toFixed(1)}%
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.8rem", opacity: 0.4 }}>
                          ${token.usd_price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
               <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                 No assets found on Base
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: INCOME ---
  if (view === "income") {
    return (
      <div style={ContainerStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Income & Rewards
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div style={CardStyle}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🪂</div>
            <h3 style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "0.25rem", marginTop: 0 }}>Airdrops</h3>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.positiveColor }}>
              {formatUSD(income.airdrops)}
            </div>
          </div>
          <div style={CardStyle}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🥩</div>
            <h3 style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "0.25rem", marginTop: 0 }}>Staking</h3>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.positiveColor }}>
              {formatUSD(income.staking)}
            </div>
          </div>
        </div>

        <div style={CardStyle}>
          <h3 style={{ marginBottom: "0.5rem", marginTop: 0 }}>Total Realized Income</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "800", color: theme.positiveColor }}>
             {formatUSD(income.airdrops + income.staking)}
          </div>
          <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.5rem" }}>
            *Estimated based on token inflows with zero cost basis.
          </p>
        </div>
      </div>
    );
  }

  // --- VIEW 3: HISTORY & ROI ---
  if (view === "history") {
    return (
      <div style={ContainerStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Performance
        </h2>

        {/* ROI Stats */}
        <div style={{ ...CardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <div>
             <h3 style={{ fontSize: "0.9rem", opacity: 0.8, margin: 0 }}>Portfolio ROI</h3>
             <div style={{ fontSize: "2.5rem", fontWeight: "800", color: roi.averageRoi >= 0 ? theme.positiveColor : theme.negativeColor }}>
                {roi.averageRoi > 0 ? '+' : ''}{roi.averageRoi.toFixed(2)}%
             </div>
           </div>
           <div style={{ fontSize: "3rem" }}>📈</div>
        </div>

        {/* Chart */}
        <div style={{ ...CardStyle, height: "350px", padding: "1.5rem 0.5rem 0 0" }}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "1rem", opacity: 0.8, marginTop: 0 }}>Net Worth Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.accentColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={theme.accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke={theme.textColor} 
                opacity={0.5} 
                tick={{fontSize: 12}} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke={theme.textColor} 
                opacity={0.5} 
                tick={{fontSize: 12}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val/1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.cardBg,
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  color: theme.textColor
                }}
                formatter={(val: number) => formatUSD(val)}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={theme.accentColor}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
}