
interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: any;
}

export default function BottomNav({ activeTab, onTabChange, theme }: BottomNavProps) {
  const tabs = [
    
    { id: 'holdings', label: 'Assets', icon: '🍰' },
    { id: 'income', label: 'Income', icon: '💰' },
    { id: 'wrapped', label: 'Home', icon: '🎁' },
    { id: 'history', label: 'Charts', icon: '📈' },
    { id: 'mint', label: 'Mint', icon: '✨' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '80px', 
      background: theme.bg || '#181818', 
      borderTop: `1px solid ${theme.accentColor}40`, 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start', 
      paddingTop: '10px',
      zIndex: 1000,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
      paddingBottom: 'safe-area-inset-bottom', 
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isActive ? theme.accentColor : theme.textColor,
              opacity: isActive ? 1 : 0.5,
              cursor: 'pointer',
              flex: 1, // Forces all buttons to take equal width
              padding: '0 5px',
              transition: 'all 0.2s ease',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <span style={{ 
              fontSize: '1.5rem',
              filter: isActive ? `drop-shadow(0 0 8px ${theme.accentColor})` : 'none'
            }}>
              {tab.icon}
            </span>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: isActive ? 'bold' : 'normal',
              whiteSpace: 'nowrap' // Prevents text wrapping
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}