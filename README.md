# OOP Stock Trading Simulator

A C++17 object-oriented backend and a React/Vite frontend simulating moving average crossover strategies on stock market CSV data.

## Architecture

The backend consists of 8 primary classes demonstrating all OOP principles:

```text
  [StockData] (Encapsulation: file parsing, stores prices)
       |
       v
  [TradingSimulator]  <--->  [MovingAverageCalculator] (SRP)
       |          \
       v           v
  [Portfolio]  <-- [SignalGenerator] (Business logic for Crossover)
       |
       v
  [Trade] (Immutable Data Record)

----------------------------------------------------
  [BaseReport] (Abstract Base Class - Abstraction)
       ^
       |
  [PerformanceReport] (Implementation - Polymorphism)
```

## Backend (C++)

Powered by `cpp-httplib` and `nlohmann/json`.

**How to Build:**
```bash
cd backend
make
# or
g++ -std=c++17 -O2 -o stock_simulator main.cpp -lpthread -lws2_32 -lwsock32
```

**Run:**
```bash
./stock_simulator
```

*Note: Requires a modern compiler with full C++17 thread and filesystem support. If you are using an older MinGW 6.3 install, the compiler will fail to process `<optional>` and `std::thread`. To circumvent this for standard Windows setups, we have provided an advanced fallback layer in the frontend to demonstrate functionality!*

### API Endpoints
- `GET /api/status`
- `GET /api/tickers` 
- `POST /api/simulate`
    - Payload: `{ "ticker": "AAPL", "initialCapital": 100000, "shortWindow": 10, "longWindow": 50 }`

## Frontend (React UI)

A dark-themed premium dashboard.

**How to Run:**
```bash
cd frontend
npm install
npm run dev
```

The frontend uses Vite Proxy to contact the C++ Backend at `http://localhost:8080`.
