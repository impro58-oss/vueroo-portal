export default function AgentVuePage() {
  return (
    <div className="min-h-screen p-8" style={{ background: '#0a0a0f', color: '#f8fafc' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #00a8cc)' }}>
              <i className="fas fa-robot text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#f8fafc' }}>AgentVue Swarm</h1>
              <p style={{ color: '#94a3b8' }}>Multi-Agent Consensus Trading System</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatusCard 
            title="Swarm Status" 
            value="Online" 
            color="cyan"
            icon="fa-circle"
          />
          <StatusCard 
            title="Symbols Monitored" 
            value="50" 
            color="cyan"
            icon="fa-coins"
          />
          <StatusCard 
            title="Active Agents" 
            value="5" 
            color="cyan"
            icon="fa-robot"
          />
          <StatusCard 
            title="Cycle Interval" 
            value="15 min" 
            color="cyan"
            icon="fa-clock"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Agent Consensus */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl p-6 border" style={{ 
              background: '#15151f', 
              borderColor: 'rgba(0, 212, 255, 0.1)'
            }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#f8fafc' }}>
                <i className="fas fa-brain" style={{ color: '#00d4ff' }}></i>
                Agent Consensus
              </h2>
              
              {/* 5 Agents */}
              <div className="space-y-4">
                <AgentRow 
                  name="Strategy Agent" 
                  weight="35%"
                  role="AdaptiveRtoM Signal Analysis"
                  status="active"
                />
                <AgentRow 
                  name="Risk Agent" 
                  weight="25%"
                  role="Position Sizing & Drawdown"
                  status="active"
                />
                <AgentRow 
                  name="Sentiment Agent" 
                  weight="20%"
                  role="External Data & Context"
                  status="active"
                />
                <AgentRow 
                  name="Execution Agent" 
                  weight="15%"
                  role="Market Conditions & Slippage"
                  status="active"
                />
                <AgentRow 
                  name="Meta Agent" 
                  weight="5%"
                  role="Consensus & Final Decision"
                  status="active"
                />
              </div>
            </div>

            {/* Recent Decisions */}
            <div className="rounded-xl p-6 border" style={{ 
              background: '#15151f', 
              borderColor: 'rgba(0, 212, 255, 0.1)'
            }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#f8fafc' }}>
                <i className="fas fa-history" style={{ color: '#10b981' }}></i>
                Recent Decisions
              </h2>
              <div className="text-center py-12" style={{ color: '#64748b' }}>
                <i className="fas fa-spinner fa-spin text-3xl mb-4" style={{ color: '#00d4ff' }}></i>
                <p>Connect to local swarm to see decisions</p>
                <p className="text-sm mt-2">Run <code style={{ background: '#1e1e2e', padding: '4px 8px', borderRadius: '4px' }}>start-swarm-monitor.bat</code></p>
              </div>
            </div>
          </div>

          {/* Right: Quick Info */}
          <div className="space-y-6">
            {/* Monitored Symbols */}
            <div className="rounded-xl p-6 border" style={{ background: '#15151f', borderColor: 'rgba(0, 212, 255, 0.1)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>Top 50 Symbols</h2>
              <div className="flex flex-wrap gap-2">
                {SYMBOLS.slice(0, 20).map((sym) => (
                  <span key={sym} className="px-2 py-1 rounded text-xs font-mono" 
                    style={{ background: '#1e1e2e', color: '#00d4ff' }}>
                    {sym.replace('USDT', '')}
                  </span>
                ))}
                <span className="px-2 py-1 rounded text-xs" style={{ background: '#1e1e2e', color: '#64748b' }}>+30 more</span>
              </div>
            </div>

            {/* Decision Threshold */}
            <div className="rounded-xl p-6 border" style={{ background: '#15151f', borderColor: 'rgba(0, 212, 255, 0.1)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>Trade Threshold</h2>
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: '#94a3b8' }}>Confidence Required</span>
                <span className="text-xl font-bold font-mono" style={{ color: '#00d4ff' }}>75%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e1e2e' }}>
                <div className="h-full rounded-full" style={{ width: '75%', background: 'linear-gradient(90deg, #00d4ff, #00a8cc)' }}></div>
              </div>
              <p className="text-sm mt-2" style={{ color: '#64748b' }}>Only execute if 4+ agents agree above threshold</p>
            </div>

            {/* Links */}
            <div className="rounded-xl p-6 border" style={{ background: '#15151f', borderColor: 'rgba(0, 212, 255, 0.1)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>Quick Links</h2>
              <div className="space-y-2">
                <a 
                  href="http://localhost:8765" 
                  target="_blank"
                  className="flex items-center gap-3 p-3 rounded-lg transition-all"
                  style={{ background: '#1e1e2e', minHeight: '44px' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#252535'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1e1e2e'}
                >
                  <i className="fas fa-external-link-alt" style={{ color: '#00d4ff' }}></i>
                  <div>
                    <div className="font-medium" style={{ color: '#f8fafc' }}>Local Dashboard</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>localhost:8765</div>
                  </div>
                </a>
                <a 
                  href="/crypto/index.html"
                  className="flex items-center gap-3 p-3 rounded-lg transition-all"
                  style={{ background: '#1e1e2e', minHeight: '44px' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#252535'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1e1e2e'}
                >
                  <i className="fas fa-chart-line" style={{ color: '#00d4ff' }}></i>
                  <div>
                    <div className="font-medium" style={{ color: '#f8fafc' }}>CryptoVue</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>194 assets</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, color, icon }: { 
  title: string; 
  value: string; 
  color: string; 
  icon: string;
}) {
  const colors: Record<string, string> = {
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors.cyan}`} style={{ 
      background: 'rgba(0, 212, 255, 0.05)', 
      borderColor: 'rgba(0, 212, 255, 0.2)',
      minHeight: '100px'
    }}>
      <div className="flex items-center justify-between mb-2" style={{ color: '#94a3b8' }}>
        <span className="text-sm">{title}</span>
        <i className={`fas ${icon}`} style={{ color: '#00d4ff' }}></i>
      </div>
      <div className="text-2xl font-bold font-mono" style={{ color: '#00d4ff' }}>{value}</div>
    </div>
  );
}

function AgentRow({ name, weight, role, status }: {
  name: string;
  weight: string;
  role: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg" style={{ background: '#1e1e2e', minHeight: '60px' }}>
      <div className="w-3 h-3 rounded-full" style={{ 
        background: status === 'active' ? '#10b981' : '#64748b',
        boxShadow: status === 'active' ? '0 0 8px #10b981' : 'none',
        animation: status === 'active' ? 'pulse 2s infinite' : 'none'
      }}></div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium" style={{ color: '#f8fafc' }}>{name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: '#252535', color: '#00d4ff' }}>{weight}</span>
        </div>
        <div className="text-sm" style={{ color: '#94a3b8' }}>{role}</div>
      </div>
    </div>
  );
}

// Top 50 symbols
const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'NIGHTUSDT', 'SOLUSDT', 'XRPUSDT', 'ZECUSDT', 'USD1USDT',
  'BNBUSDT', 'DOGEUSDT', 'PAXGUSDT', 'TRXUSDT', 'TAOUSDT', 'ADAUSDT', 'KATUSDT',
  'STOUSDT', 'PEPEUSDT', 'XAUTUSDT', 'EURUSDT', 'RLUSDUSDT', 'LINKUSDT', 'BCHUSDT',
  'NOMUSDT', 'SUIUSDT', 'LTCUSDT', 'KERNELUSDT', 'AVAXUSDT', 'ZBTUSDT', 'FETUSDT',
  'HBARUSDT', 'NEARUSDT', 'TRUMPUSDT', 'SEIUSDT', 'ALGOUSDT', 'ENAUSDT', 'UUSDT',
  'KITEUSDT', 'TWTUSDT', 'ONTUSDT', 'WLDUSDT', 'UNIUSDT', 'SKLUSDT', 'DOTUSDT',
  'SKYUSDT', 'DASHUSDT', 'XPLUSDT', 'RENDERUSDT', 'GUSDT', 'XUSDUSDT', 'ASTERUSDT', 'RAYUSDT'
];