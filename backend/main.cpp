#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <cmath>
#include <map>
#include <algorithm>

using namespace std;

// ==========================================
// 1. StockData (Encapsulation)
// ==========================================
class StockData {
private:
    vector<double> closePrices;
    vector<string> dates;
    string ticker;
    string csvPath;

public:
    StockData(const string& t, const string& path) : ticker(t), csvPath(path) {}

    bool loadFromCSV() {
        ifstream file(csvPath);
        if (!file.is_open()) return false;

        string line, word;
        getline(file, line); // Skip header

        while (getline(file, line)) {
            stringstream ss(line);
            string date, open, high, low, close, volume;
            
            getline(ss, date, ',');
            getline(ss, open, ',');
            getline(ss, high, ',');
            getline(ss, low, ',');
            getline(ss, close, ',');
            getline(ss, volume, '\n');

            try {
                // simple string to double conversion
                double price = std::stod(close);
                closePrices.push_back(price);
                dates.push_back(date);
            } catch (...) {
                continue; // Skip malformed rows
            }
        }
        return !closePrices.empty();
    }

    double getPrice(int index) const {
        if (index >= 0 && index < closePrices.size()) {
            return closePrices[index];
        }
        return 0.0;
    }
    
    string getDate(int index) const {
        if (index >= 0 && index < dates.size()) {
            return dates[index];
        }
        return "";
    }

    vector<double> getHistory() const { return closePrices; }
    vector<string> getDates() const { return dates; }
    int size() const { return closePrices.size(); }
    string getTicker() const { return ticker; }
};


class MovingAverageCalculator {
private:
    int shortWindow;
    int longWindow;

public:
    MovingAverageCalculator(int shortW = 10, int longW = 50) 
        : shortWindow(shortW), longWindow(longW) {}

    vector<double> computeSMA(const vector<double>& prices, int window) const {
        vector<double> sma;
        double sum = 0.0;
        
        for (int i = 0; i < prices.size(); ++i) {
            sum += prices[i];
            if (i >= window) {
                sum -= prices[i - window];
            }
            if (i >= window - 1) {
                sma.push_back(sum / window);
            } else {
                sma.push_back(0.0); // Not yet filled
            }
        }
        return sma;
    }

    vector<double> getShortSMA(const StockData& sd) const {
        return computeSMA(sd.getHistory(), shortWindow);
    }

    vector<double> getLongSMA(const StockData& sd) const {
        return computeSMA(sd.getHistory(), longWindow);
    }
};

// ==========================================
// 3. SignalGenerator
// ==========================================
enum class SignalType { BUY, SELL, HOLD };

class SignalGenerator {
private:
    vector<SignalType> signals;

public:
    void generate(const vector<double>& shortSMA, const vector<double>& longSMA) {
        signals.clear();
        for (int i = 0; i < shortSMA.size(); ++i) {
            if (i == 0 || shortSMA[i] == 0.0 || longSMA[i] == 0.0) {
                signals.push_back(SignalType::HOLD);
                continue;
            }

            double prevShort = shortSMA[i - 1];
            double prevLong = longSMA[i - 1];
            double currShort = shortSMA[i];
            double currLong = longSMA[i];

            // Crossover detection
            if (prevShort <= prevLong && currShort > currLong) {
                signals.push_back(SignalType::BUY);
            } else if (prevShort >= prevLong && currShort < currLong) {
                signals.push_back(SignalType::SELL);
            } else {
                signals.push_back(SignalType::HOLD);
            }
        }
    }

    SignalType getSignal(int index) const {
        if (index >= 0 && index < signals.size()) return signals[index];
        return SignalType::HOLD;
    }
};

// ==========================================
// 4. Trade (Immutable Data Class)
// ==========================================
class Trade {
private:
    string type;
    double price;
    int quantity;
    string date;
    double totalValue;

public:
    Trade(string t, double p, int q, string d, double tv) 
        : type(t), price(p), quantity(q), date(d), totalValue(tv) {}

    string getType() const { return type; }
    double getPrice() const { return price; }
    int getQty() const { return quantity; }
    string getDate() const { return date; }
    double getTotalValue() const { return totalValue; }
};

// ==========================================
// 5. Portfolio
// ==========================================
class Portfolio {
private:
    double cashBalance;
    int sharesHeld;
    vector<Trade> tradeHistory;

public:
    Portfolio(double initialCash) : cashBalance(initialCash), sharesHeld(0) {}

    bool buyShares(int qty, double price, const string& date) {
        double cost = qty * price;
        if (cashBalance >= cost) {
            cashBalance -= cost;
            sharesHeld += qty;
            tradeHistory.push_back(Trade("BUY", price, qty, date, cost));
            return true;
        }
        return false;
    }

    bool sellShares(int qty, double price, const string& date) {
        if (sharesHeld >= qty) {
            double revenue = qty * price;
            cashBalance += revenue;
            sharesHeld -= qty;
            tradeHistory.push_back(Trade("SELL", price, qty, date, revenue));
            return true;
        }
        return false;
    }

    double getCash() const { return cashBalance; }
    int getShares() const { return sharesHeld; }
    double getPortfolioValue(double currentPrice) const {
        return cashBalance + (sharesHeld * currentPrice);
    }
    vector<Trade> getHistory() const { return tradeHistory; }
};

// ==========================================
// 6. BaseReport (Abstraction & Inheritance)
// ==========================================
class BaseReport {
protected:
    string reportTitle;
public:
    virtual void generate() = 0;
    virtual string getSummary() = 0;
    virtual ~BaseReport() {}
};

// ==========================================
// 7. PerformanceReport (Polymorphism)
// ==========================================
class PerformanceReport : public BaseReport {
private:
    Portfolio& portfolio;
    double initialCapital;
    double lastPrice;
    
    double finalValue;
    int totalTrades;
    int winTrades;
    int sellTrades;

public:
    PerformanceReport(Portfolio& p, double initial, double currPrice)
        : portfolio(p), initialCapital(initial), lastPrice(currPrice), 
          finalValue(0.0), totalTrades(0), winTrades(0), sellTrades(0) {
        reportTitle = "Performance Report";
    }

    void generate() override {
        finalValue = portfolio.getPortfolioValue(lastPrice);
        
        auto history = portfolio.getHistory();
        totalTrades = history.size();
        
        double avgBuyPrice = 0.0;
        int totalBought = 0;

        for (const auto& trade : history) {
            if (trade.getType() == "BUY") {
                double totalCost = avgBuyPrice * totalBought + trade.getPrice() * trade.getQty();
                totalBought += trade.getQty();
                avgBuyPrice = totalCost / totalBought;
            } else if (trade.getType() == "SELL") {
                sellTrades++;
                if (trade.getPrice() > avgBuyPrice) {
                    winTrades++;
                }
            }
        }
    }

    string getSummary() override {
        return reportTitle + " generated.";
    }

    double getFinalValue() const { return finalValue; }
    double getROI() const { return ((finalValue - initialCapital) / initialCapital) * 100.0; }
    double getNetPL() const { return finalValue - initialCapital; }
    int getTotalTrades() const { return totalTrades; }
    int getWinRate() const { return sellTrades > 0 ? (winTrades * 100 / sellTrades) : 0; }
    int getBuyTrades() const { return totalTrades - sellTrades; }
    int getSellTrades() const { return sellTrades; }
};

// ==========================================
// 8. TradingSimulator
// ==========================================
class TradingSimulator {
private:
    StockData* stockData;
    MovingAverageCalculator* maCalc;
    SignalGenerator* sigGen;
    Portfolio* portfolio;

public:
    TradingSimulator(StockData* sd, MovingAverageCalculator* mac, SignalGenerator* sg, Portfolio* p)
        : stockData(sd), maCalc(mac), sigGen(sg), portfolio(p) {}

    void runSimulation() {
        vector<double> shortSma = maCalc->getShortSMA(*stockData);
        vector<double> longSma = maCalc->getLongSMA(*stockData);
        sigGen->generate(shortSma, longSma);

        for (int i = 0; i < stockData->size(); ++i) {
            double currentPrice = stockData->getPrice(i);
            string currentDate = stockData->getDate(i);
            SignalType currentSignal = sigGen->getSignal(i);

            if (currentSignal == SignalType::BUY) {
                // Buy 10 shares if we can
                portfolio->buyShares(10, currentPrice, currentDate);
            } else if (currentSignal == SignalType::SELL) {
                // Sell all held shares
                if (portfolio->getShares() > 0) {
                    portfolio->sellShares(portfolio->getShares(), currentPrice, currentDate);
                }
            }
        }
    }

    Portfolio* getPortfolio() { return portfolio; }
    SignalGenerator* getSignalGenerator() { return sigGen; }
};

// Helper to escape json string if needed
string escapeJson(const string& s) {
    return s; // keep it simple for date/type
}

int main(int argc, char* argv[]) {
    string ticker = "AAPL";
    double initialCapital = 100000.0;
    int shortWindow = 10;
    int longWindow = 50;

    if (argc >= 2) ticker = argv[1];
    if (argc >= 3) initialCapital = std::stod(argv[2]);
    if (argc >= 4) shortWindow = std::stoi(argv[3]);
    if (argc >= 5) longWindow = std::stoi(argv[4]);

    string path = "data/" + ticker + ".csv";
    
    StockData sd(ticker, path);
    if (!sd.loadFromCSV()) {
        cout << "{\"error\": \"Stock data not found\"}" << endl;
        return 1;
    }

    MovingAverageCalculator mac(shortWindow, longWindow);
    SignalGenerator sg;
    Portfolio p(initialCapital);

    TradingSimulator sim(&sd, &mac, &sg, &p);
    sim.runSimulation();

    double lastPrice = sd.getPrice(sd.size() - 1);
    PerformanceReport report(p, initialCapital, lastPrice);
    report.generate();

    // Manual JSON construction
    cout << "{";
    cout << "\"ticker\": \"" << ticker << "\",";
    cout << "\"initialCapital\": " << initialCapital << ",";
    cout << "\"finalValue\": " << report.getFinalValue() << ",";
    cout << "\"netPL\": " << report.getNetPL() << ",";
    cout << "\"roi\": " << report.getROI() << ",";
    cout << "\"totalTrades\": " << report.getTotalTrades() << ",";
    cout << "\"buyTrades\": " << report.getBuyTrades() << ",";
    cout << "\"sellTrades\": " << report.getSellTrades() << ",";
    cout << "\"winRate\": " << report.getWinRate() << ",";
    
    // Trades
    cout << "\"trades\": [";
    auto history = p.getHistory();
    for (size_t i = 0; i < history.size(); ++i) {
        const auto& tr = history[i];
        cout << "{";
        cout << "\"type\": \"" << tr.getType() << "\",";
        cout << "\"date\": \"" << tr.getDate() << "\",";
        cout << "\"price\": " << tr.getPrice() << ",";
        cout << "\"qty\": " << tr.getQty() << ",";
        cout << "\"total\": " << tr.getTotalValue();
        cout << "}";
        if (i < history.size() - 1) cout << ",";
    }
    cout << "],";
    
    // Signals
    cout << "\"signals\": [";
    vector<double> sh_sma = mac.getShortSMA(sd);
    vector<double> lg_sma = mac.getLongSMA(sd);
    for (int i = 0; i < sd.size(); ++i) {
        string sigStr;
        switch(sg.getSignal(i)) {
            case SignalType::BUY: sigStr = "BUY"; break;
            case SignalType::SELL: sigStr = "SELL"; break;
            default: sigStr = "HOLD"; break;
        }
        
        cout << "{";
        cout << "\"date\": \"" << sd.getDate(i) << "\",";
        cout << "\"signal\": \"" << sigStr << "\",";
        cout << "\"close\": " << sd.getPrice(i) << ",";
        cout << "\"shortSMA\": " << sh_sma[i] << ",";
        cout << "\"longSMA\": " << lg_sma[i];
        cout << "}";
        if (i < sd.size() - 1) cout << ",";
    }
    cout << "]";
    cout << "}" << endl;

    return 0;
}
