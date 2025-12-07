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

// FIX: Added 'view' to the interface
interface DashboardProps {
  metrics: WarpletMetrics;
  theme: any;
  view: "allocation" | "income" | "history";
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function PortfolioDashboard({
  metrics,
  theme,
  view,
}: DashboardProps) {
  // Helper to safely access new metric fields (in case hook isn't fully updated yet)
  const holdings = metrics.holdings || [];
  const income = metrics.income || { airdrops: 0, staking: 0 };
  const roi = metrics.roi || { bestAsset: null, worstAsset: null, averageRoi: 0 };

  // Prepare data for Pie Chart (Top 5 Assets + Others)
  const sortedHoldings = [...holdings].sort((a, b) => b.usd_value - a.usd_value);
  const topHoldings = sortedHoldings.slice(0, 5);
  const otherValue = sortedHoldings
    .slice(5)
    .reduce((acc, curr) => acc + curr.usd_value, 0);

  const allocationData = [
    ...topHoldings.map((h) => ({ name: h.symbol, value: h.usd_value })),
    { name: "Others", value: otherValue },
  ].filter((d) => d.value > 0);

  // Mock History Data (Placeholders until history API is integrated)
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
    margin: "1rem auto",
    color: theme.textColor,
    padding: "0 1rem",
    boxSizing: "border-box" as const,
  };

  const CardStyle = {
    background: theme.secondaryBg,
    borderRadius: "1rem",
    padding: "1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  };

  // --- VIEW 1: ASSET ALLOCATION ---
  if (view === "allocation") {
    return (
      <div style={ContainerStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Asset Holdings
        </h2>
        
        {/* Pie Chart */}
        <div style={{ ...CardStyle, height: "350px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "1rem", opacity: 0.8 }}>Distribution</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocationData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.cardBg,
                      border: `1px solid ${theme.accentColor}`,
                      borderRadius: "8px",
                      color: theme.textColor
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                No holdings data available
              </div>
            )}
          </div>
        </div>

        {/* Holdings List */}
        <div style={{ ...CardStyle, padding: "1rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Top Assets</h3>
          {sortedHoldings.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {sortedHoldings.map((token) => (
                <div
                  key={token.token_address}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {token.thumbnail ? (
                      <img src={token.thumbnail} alt={token.symbol} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                    ) : (
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#444" }} />
                    )}
                    <div>
                      <div style={{ fontWeight: "bold" }}>{token.symbol}</div>
                      <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>{(Number(token.balance) / 10 ** token.decimals).toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "bold" }}>${token.usd_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div style={{ fontSize: "0.8rem", color: theme.accentColor }}>{((token.usd_value / metrics.currentNetWorth) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No assets found</div>
          )}
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
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🪂</div>
            <h3 style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "0.25rem" }}>Airdrops</h3>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.positiveColor }}>
              ${income.airdrops.toLocaleString()}
            </div>
          </div>
          <div style={CardStyle}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🥩</div>
            <h3 style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "0.25rem" }}>Staking</h3>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.positiveColor }}>
              ${income.staking.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={CardStyle}>
          <h3 style={{ marginBottom: "0.5rem" }}>Total Estimated Income</h3>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: theme.positiveColor }}>
            ${(income.airdrops + income.staking).toLocaleString()}
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
             <h3 style={{ fontSize: "0.9rem", opacity: 0.8 }}>Portfolio ROI</h3>
             <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: roi.averageRoi >= 0 ? theme.positiveColor : theme.negativeColor }}>
                {roi.averageRoi > 0 ? '+' : ''}{roi.averageRoi.toFixed(2)}%
             </div>
           </div>
           <div style={{ fontSize: "2.5rem" }}>📈</div>
        </div>

        {/* Chart */}
        <div style={{ ...CardStyle, height: "300px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "1rem", opacity: 0.8 }}>Net Worth Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={theme.accentColor}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.accentColor}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" stroke={theme.textColor} opacity={0.5} tick={{fontSize: 12}} />
              <YAxis stroke={theme.textColor} opacity={0.5} tick={{fontSize: 12}} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.accentColor}`,
                  color: theme.textColor
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={theme.accentColor}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5, marginTop: '1rem' }}>
          Historical data is simulated for demo purposes.
        </p>
      </div>
    );
  }

  return null;
}