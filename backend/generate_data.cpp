#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <random>
#include <iomanip>
#include <sstream>

using namespace std;

void generate_csv(const string& ticker, double start_price) {
    string filepath = "data/" + ticker + ".csv";
    ofstream f(filepath);
    
    if (!f.is_open()) {
        cerr << "Could not open " << filepath << "\n";
        return;
    }
    
    f << "Date,Open,High,Low,Close,Volume\n";
    
    double price = start_price;
    std::mt19937 gen(42 + ticker[0]);
    std::normal_distribution<double> daily_return_dist(0.0005, 0.015);
    std::normal_distribution<double> noise_dist(0.0, 0.005);
    std::normal_distribution<double> vol_dist(1000000, 200000);
    
    int year = 2023, month = 1, day = 1;
    
    for (int i = 0; i < 250; ++i) {
        // Date formatting (simple increment)
        int days_in_month = (month == 2) ? 28 : ((month == 4 || month == 6 || month == 9 || month == 11) ? 30 : 31);
        if (day > days_in_month) {
            day = 1;
            month++;
            if (month > 12) {
                month = 1;
                year++;
            }
        }
        
        stringstream ss;
        ss << year << "-" << setfill('0') << setw(2) << month << "-" << setw(2) << day;
        string date = ss.str();
        day++;
        
        double daily_return = daily_return_dist(gen);
        double open_p = price * (1.0 + noise_dist(gen));
        double close_p = open_p * (1.0 + daily_return);
        double high_p = max(open_p, close_p) * (1.0 + abs(noise_dist(gen)));
        double low_p = min(open_p, close_p) * (1.0 - abs(noise_dist(gen)));
        int volume = max(10000, (int)vol_dist(gen));
        
        f << fixed << setprecision(2);
        f << date << "," << open_p << "," << high_p << "," << low_p << "," << close_p << "," << volume << "\n";
        
        price = close_p;
    }
    
    f.close();
    cout << "Generated " << filepath << "\n";
}

int main() {
    generate_csv("AAPL", 130.0);
    generate_csv("GOOGL", 95.0);
    generate_csv("MSFT", 240.0);
    return 0;
}
