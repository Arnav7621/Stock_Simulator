import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Clock, BarChart3, TrendingUp, TrendingDown, DollarSign, ActivityIcon } from 'lucide-react';
import { fetchTickers, runSimulation } from '../api/api';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceDot, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const [tickers, setTickers] = useState(['AAPL', 'MSFT', 'GOOGL']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');

  // Form State
  const [ticker, setTicker] = useState('AAPL');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [shortWindow, setShortWindow] = useState(10);
  const [longWindow, setLongWindow] = useState(50);

  useEffect(() => {
    fetchTickers().then(data => setTickers(data.tickers));
  }, []);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await runSimulation({ ticker, initialCapital, shortWindow, longWindow });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col gap-8 fade-in">
      {/* HEADER */}
      <header className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="p-3 bg-accent/10 rounded-xl rounded-tr-none text-accent border border-accent/20">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">StockOp</h1>
          <p className="text-sm text-muted">Algorithmic Trading Simulator</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL - CONTROLS (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
             {/* decorative blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl rounded-none -translate-y-1/2 translate-x-1/2"></div>
            
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <ActivityIcon size={18} className="text-accent" />
              Configure Simulation
            </h2>
            
            <form onSubmit={handleSimulate} className="flex flex-col gap-5 relative z-10">
              
              <div className="space-y-1.5">
                <label className="text-sm text-muted font-medium">Asset Ticker</label>
                <select 
                  value={ticker} onChange={e=>setTicker(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white appearance-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                >
                  {tickers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-muted font-medium">Initial Capital (₹)</label>
                <input 
                  type="number" value={initialCapital} onChange={e=>setInitialCapital(Number(e.target.value))}
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="text-muted font-medium">Short SMA Window</label>
                  <span className="bg-white/5 px-2 py-0.5 rounded text-white font-mono">{shortWindow}</span>
                </div>
                <input 
                  type="range" min="5" max="20" value={shortWindow} onChange={e=>setShortWindow(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="text-muted font-medium">Long SMA Window</label>
                  <span className="bg-white/5 px-2 py-0.5 rounded text-white font-mono">{longWindow}</span>
                </div>
                <input 
                  type="range" min="20" max="100" value={longWindow} onChange={e=>setLongWindow(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <button 
                type="submit" disabled={loading}
                className={`mt-4 w-full py-3.5 rounded-lg font-medium text-white transition-all shadow-lg flex justify-center items-center gap-2
                  ${loading ? 'bg-accent/50 cursor-wait' : 'bg-accent hover:bg-accentHover shadow-accent/20 hover:shadow-accent/40'}`}
              >
                {loading ? <Clock size={18} className="animate-spin" /> : <Activity size={18} />}
                {loading ? 'Simulating...' : 'Run Simulation'}
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT PANEL - RESULTS (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {loading && (
            <div className="flex-1 bg-card rounded-2xl border border-white/5 animate-pulse flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4 text-muted">
                <Clock className="animate-spin text-accent" size={32} />
                <p>Computing SMA Crossovers...</p>
              </div>
            </div>
          )}

          {!loading && !result && (
             <div className="flex-1 bg-card/50 rounded-2xl border border-white/5 border-dashed flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3 text-muted/70 text-center max-w-sm">
                  <BarChart3 size={48} className="opacity-20" />
                  <p>Configure your parameters and run a simulation to see performance metrics and trade history.</p>
                </div>
             </div>
          )}

          {!loading && result && (
            <div className="fade-in space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-2xl border border-white/5 flex flex-col gap-1 card-hover">
                   <p className="text-muted text-xs font-semibold uppercase tracking-wider">Final Value</p>
                   <p className="text-2xl font-bold text-white font-mono mt-1">{formatINR(result.finalValue)}</p>
                </div>
                
                <div className="bg-card p-5 rounded-2xl border border-white/5 flex flex-col gap-1 card-hover">
                   <p className="text-muted text-xs font-semibold uppercase tracking-wider">Net P&L</p>
                   <div className={`flex items-center gap-2 mt-1 ${result.netPL >= 0 ? 'text-success' : 'text-danger'}`}>
                      {result.netPL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      <p className="text-2xl font-bold font-mono">{formatINR(Math.abs(result.netPL))}</p>
                   </div>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-white/5 flex flex-col gap-1 card-hover">
                   <p className="text-muted text-xs font-semibold uppercase tracking-wider">ROI</p>
                   <div className="mt-1 flex">
                      <span className={`px-2.5 py-1 rounded-md text-sm font-bold font-mono ${result.roi >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {result.roi > 0 ? '+' : ''}{result.roi}%
                      </span>
                   </div>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-white/5 flex flex-col gap-1 card-hover">
                   <p className="text-muted text-xs font-semibold uppercase tracking-wider">Win Rate</p>
                   <p className="text-2xl font-bold text-white font-mono mt-1">{result.winRate}%</p>
                   <p className="text-xs text-muted mt-1">{result.totalTrades} total trades</p>
                </div>
              </div>

              {/* TABS */}
              <div className="bg-card rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                <div className="flex border-b border-white/5 bg-white/[0.02]">
                  {['chart', 'trades', 'signals'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'chart' && <ChartTab data={result.signals} ticker={result.ticker} />}
                  {activeTab === 'trades' && <TradesTab trades={result.trades} />}
                  {activeTab === 'signals' && <SignalsTab signals={result.signals} />}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function ChartTab({ data, ticker }) {
  // Add some spacing around chart wrapper
  return (
    <div className="h-[400px] w-full fade-in flex flex-col">
      <h3 className="text-sm font-medium text-white mb-6">{ticker} — Price & Moving Averages</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val, i) => i % 30 === 0 ? val : ''} />
            <YAxis domain={['auto', 'auto']} stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `₹${v}`} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1a1f2e', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Line type="monotone" dataKey="close" stroke="#e2e8f0" strokeWidth={2} dot={false} name="Close Price" />
            <Line type="monotone" dataKey="shortSMA" stroke="#3b82f6" strokeWidth={2} dot={false} name="Short SMA" />
            <Line type="monotone" dataKey="longSMA" stroke="#f97316" strokeWidth={2} dot={false} name="Long SMA" />
            
            {/* Custom dots for BUY / SELL signals can be very complex in standard Recharts, a trick is mapping another invisible line throwing custom dots */}
            <Line type="monotone" dataKey="close" stroke="transparent" dot={<CustomSignalDot />} isAnimationActive={false} />
            
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-4 justify-center text-xs">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white"></div> Close</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Short SMA</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Long SMA</div>
        <div className="flex items-center gap-1.5"><div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-success"></div> Buy</div>
        <div className="flex items-center gap-1.5"><div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-danger"></div> Sell</div>
      </div>
    </div>
  )
}

const CustomSignalDot = (props) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  
  if (payload.signal === 'BUY') {
    return (
      <svg x={cx - 6} y={cy + 6} width="12" height="12" viewBox="0 0 12 12" className="overflow-visible">
        <polygon points="6,0 12,10 0,10" fill="#10b981" />
      </svg>
    )
  }
  if (payload.signal === 'SELL') {
    return (
      <svg x={cx - 6} y={cy - 18} width="12" height="12" viewBox="0 0 12 12" className="overflow-visible">
        <polygon points="0,2 12,2 6,12" fill="#ef4444" />
      </svg>
    )
  }
  return null;
}

function TradesTab({ trades }) {
  if (trades.length === 0) return (
    <div className="py-20 text-center text-muted fade-in flex flex-col items-center gap-2">
      <DollarSign size={32} className="opacity-20" />
      <p>No trades executed in this period.</p>
    </div>
  );

  return (
    <div className="fade-in space-y-6">
      <div className="h-32 mb-6 w-full opacity-70">
        {/* Miniature portfolio curve visualization */}
         <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trades} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis domain={['auto', 'auto']} hide />
            <Area type="stepAfter" dataKey="total" stroke="#2563eb" fillOpacity={1} fill="url(#colorTotal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 pb-4">
        {trades.map((t, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-background border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-4">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wide ${t.type === 'BUY' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {t.type}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{t.date}</p>
                <p className="text-xs text-muted mt-0.5">{t.qty} shares @ ₹{t.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-medium text-white">₹{t.total.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SignalsTab({ signals }) {
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  
  const filtered = useMemo(() => {
    return signals.filter(s => filter === 'ALL' || s.signal === filter);
  }, [signals, filter]);

  const pagedData = filtered.slice(page * 20, (page + 1) * 20);

  return (
    <div className="fade-in flex flex-col h-[500px]">
      <div className="flex gap-2 mb-4">
        {['ALL', 'BUY', 'SELL', 'HOLD'].map(f => (
          <button 
            key={f} onClick={() => { setFilter(f); setPage(0); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border
              ${filter === f ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-muted border-transparent hover:bg-white/5 hover:text-white'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-white/5 border-b-0 hidden-scrollbar bg-background">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-card border-b border-white/5 text-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-center">Signal</th>
              <th className="p-4 font-medium text-right">Close (₹)</th>
              <th className="p-4 font-medium text-right text-blue-400">Short SMA</th>
              <th className="p-4 font-medium text-right text-orange-400">Long SMA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pagedData.map((s, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                <td className="p-4 font-mono text-white/90">{s.date}</td>
                <td className="p-4 text-center">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase 
                    ${s.signal==='BUY' ? 'bg-success/15 text-success' : s.signal==='SELL' ? 'bg-danger/15 text-danger' : 'bg-white/5 text-muted'}`}>
                    {s.signal}
                  </span>
                </td>
                <td className="p-4 text-right font-mono">{s.close.toFixed(2)}</td>
                <td className="p-4 text-right font-mono">{s.shortSMA.toFixed(2)}</td>
                <td className="p-4 text-right font-mono">{s.longSMA.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagedData.length === 0 && (
           <p className="p-8 text-center text-muted text-sm">No signals match filter.</p>
        )}
      </div>

      {filtered.length > 20 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
          <button 
            disabled={page === 0} onClick={() => setPage(p=>p-1)}
            className="px-4 py-2 text-sm bg-white/5 rounded hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-muted">Page {page + 1} of {Math.ceil(filtered.length / 20)}</span>
          <button 
            disabled={(page+1)*20 >= filtered.length} onClick={() => setPage(p=>p+1)}
            className="px-4 py-2 text-sm bg-white/5 rounded hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
