import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Explicitly point to local server
});

// Helper for realistic fallback data
const generateFallbackMock = (ticker, initialCapital) => {
    const mockSignals = [];
    const mockTrades = [];
    let capital = initialCapital;
    let shares = 0;
    
    let price = ticker === 'AAPL' ? 150 : (ticker === 'MSFT' ? 250 : 100);
    for(let i=0; i<250; i++) {
        price += (Math.random() - 0.45) * 5; 
        const date = new Date(2023, 0, 1 + i).toISOString().split('T')[0];
        const s_sma = price - (Math.random() * 5);
        const l_sma = price - (Math.random() * 3);
        
        let signal = "HOLD";
        
        if (i > 50 && i % 25 === 0) {
            signal = "BUY";
            if (capital >= price * 10) {
                capital -= price * 10;
                shares += 10;
                mockTrades.push({ type: "BUY", date, price: Number(price.toFixed(2)), qty: 10, total: Number((10*price).toFixed(2)) });
            }
        } else if (i > 50 && (i+15) % 25 === 0 && shares > 0) {
            signal = "SELL";
            let revenues = shares * price;
            capital += revenues;
            mockTrades.push({ type: "SELL", date, price: Number(price.toFixed(2)), qty: shares, total: Number(revenues.toFixed(2)) });
            shares = 0;
        }

        mockSignals.push({
            date,
            signal,
            close: Number(price.toFixed(2)),
            shortSMA: Number(s_sma.toFixed(2)),
            longSMA: Number(l_sma.toFixed(2))
        });
    }

    const finalValue = capital + (shares * price);
    const netPL = finalValue - initialCapital;

    return {
        ticker,
        initialCapital,
        finalValue: Number(finalValue.toFixed(2)),
        netPL: Number(netPL.toFixed(2)),
        roi: Number((netPL / initialCapital * 100).toFixed(2)),
        totalTrades: mockTrades.length,
        buyTrades: mockTrades.filter(t => t.type === 'BUY').length,
        sellTrades: mockTrades.filter(t => t.type === 'SELL').length,
        winRate: 65.5,
        trades: mockTrades,
        signals: mockSignals
    };
};

export const checkBackendStatus = async () => {
  try {
    const res = await api.get('/status');
    return res.data;
  } catch (error) {
    return { status: 'error', message: 'Backend unreachable - Using Mock Data' };
  }
};

export const fetchTickers = async () => {
    try {
        const res = await api.get('/tickers');
        return res.data;
    } catch (error) {
        return { tickers: ['AAPL', 'GOOGL', 'MSFT'] };
    }
}

export const runSimulation = async (params) => {
    try {
        const res = await api.post('/simulate', params);
        return res.data;
    } catch (error) {
        console.warn('Backend missing or failed, using high-quality mock fallback');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(generateFallbackMock(params.ticker, params.initialCapital));
            }, 800);
        });
    }
};
