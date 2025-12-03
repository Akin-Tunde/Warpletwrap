import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import WarpletWrapped from "./components/WarpletWrapped";
import { useWarpletData } from "./hooks/useWarpletData";

function App() {
  const [context, setContext] = useState<Awaited<typeof sdk.context> | null>(
    null
  );
  const [devFid, setDevFid] = useState<string>("");
  const [useDevMode, setUseDevMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      const ctx = await sdk.context;
      setContext(ctx);
      sdk.actions.ready();
    };
    init();
  }, []);

  // Use dev FID if in dev mode, otherwise use context FID
  const fid =
    useDevMode && devFid
      ? Number.parseInt(devFid)
      : (context?.user?.fid ?? null);
  const { user, metrics, isLoading, error } = useWarpletData(fid);

  // Show dev mode input if no FID from context
  if (!fid && !useDevMode) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{ textAlign: "center", maxWidth: "400px", padding: "2rem" }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>Development Mode</h2>
          <p style={{ opacity: 0.7, marginBottom: "2rem" }}>
            Enter a Farcaster FID to view their Warplet Wrapped
          </p>
          <input
            type="text"
            value={devFid}
            onChange={(e) => setDevFid(e.target.value)}
            placeholder="Enter FID"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "2px solid #667eea",
              background: "#1a1a1a",
              color: "white",
              fontSize: "1rem",
              marginBottom: "1rem",
            }}
          />
          <button
            type="button"
            onClick={() => setUseDevMode(true)}
            disabled={!devFid}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              background: devFid ? "#667eea" : "#333",
              color: "white",
              fontSize: "1rem",
              cursor: devFid ? "pointer" : "not-allowed",
            }}
          >
            View Wrapped
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Loading your Warplet Wrapped...</h2>
          <div style={{ marginTop: "1rem", opacity: 0.6 }}>
            Fetching your trading data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Error loading data</h2>
          <div style={{ marginTop: "1rem", color: "#f87171" }}>
            {(error as Error).message}
          </div>
          {useDevMode && (
            <button
              type="button"
              onClick={() => {
                setUseDevMode(false);
                setDevFid("");
              }}
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "2px solid #667eea",
                background: "transparent",
                color: "white",
                cursor: "pointer",
              }}
            >
              Try Another FID
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!metrics || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>No trading data found</h2>
          <div style={{ marginTop: "1rem", opacity: 0.6 }}>
            Make sure you have a verified wallet with trading history on Base
          </div>
          {useDevMode && (
            <button
              type="button"
              onClick={() => {
                setUseDevMode(false);
                setDevFid("");
              }}
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "2px solid #667eea",
                background: "transparent",
                color: "white",
                cursor: "pointer",
              }}
            >
              Try Another FID
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <WarpletWrapped
      displayName={user.display_name || user.username}
      metrics={metrics}
    />
  );
}

export default App;
