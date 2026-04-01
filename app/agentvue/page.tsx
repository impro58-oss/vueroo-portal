export default function AgentVuePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🤖 AgentVue Swarm</h1>
          <p className="text-slate-400">Multi-Agent Consensus Trading System</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatusCard 
            title="Swarm Status" 
            value="Online" 
            color="green"
            icon="fa-circle"
          />
          <StatusCard 
            title="Symbols Monitored" 
            value="50" 
            color="blue"
            icon="fa-coins"
          />
          <StatusCard 
            title="Active Agents" 
            value="5" 
            color="purple"
            icon="fa-robot"
          />
          <StatusCard 
            title="Cycle Interval" 
            value="15 min" 
            color="amber"
            icon="fa-clock"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Agent Consensus */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-brain text-blue-400"></i>
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
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-history text-green-400"></i>
                Recent Decisions
              </h2>
              <div className="text-center text-slate-500 py-12">
                <i className="fas fa-spinner fa-spin text-3xl mb-4"></i>
                <p>Connect to local swarm to see decisions</p>
                <p className="text-sm mt-2">Run <code className="bg-slate-800 px-2 py-1 rounded">start-swarm-monitor.bat</code></p>
              </div>
            </div>
          </div>

          {/* Right: Quick Info */}
          <div className="space-y-6">
            {/* Monitored Symbols */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold mb-4">Top 50 Symbols</h2>
              <div className="flex flex-wrap gap-2">
                {SYMBOLS.slice(0, 20).map((sym) => (
                  <span key={sym} className="px-2 py-1 bg-slate-800 rounded text-xs">
                    {sym.replace('USDT', '')}
                  </span>
                ))}
                <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">+30 more</span>
              </div>
            </div>

            {/* Decision Threshold */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold mb-4">Trade Threshold</h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Confidence Required</span>
                <span className="text-xl font-bold text-green-400">75%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-sm text-slate-500 mt-2">Only execute if 4+ agents agree above threshold</p>
            </div>

            {/* Links */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              <div className="space-y-2">
                <a 
                  href="http://localhost:8765" 
                  target="_blank"
                  className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <i className="fas fa-external-link-alt text-blue-400"></i>
                  <div>
                    <div className="font-medium">Local Dashboard</div>
                    <div className="text-xs text-slate-400">localhost:8765</div>
                  </div>
                </a>
                <a 
                  href="/crypto/index.html"
                  className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <i className="fas fa-chart-line text-cyan-400"></i>
                  <div>
                    <div className="font-medium">CryptoVue</div>
                    <div className="text-xs text-slate-400">194 assets</div>
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
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm opacity-80">{title}</span>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="text-2xl font-bold">{value}</div>
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
    <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
      <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          <span className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">{weight}</span>
        </div>
        <div className="text-sm text-slate-400">{role}</div>
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