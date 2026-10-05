import http.server
import socketserver
import json
import subprocess
import os

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SIMULATOR_PATH = os.path.join(BASE_DIR, "stock_simulator.exe")

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        if self.path == '/api/status':
            self.wfile.write(b'{"status": "ok", "message": "Python + C++ API"}')
            return
        elif self.path == '/api/tickers':
            self.wfile.write(b'{"tickers": ["AAPL", "GOOGL", "MSFT"]}')
            return
        elif self.path.startswith('/api/data/'):
            ticker = self.path.split('/')[-1]
            try:
                with open(os.path.join(BASE_DIR, "data", f"{ticker}.csv"), "r") as f:
                    lines = f.readlines()[1:]
                    dates = []
                    prices = []
                    for line in lines:
                        parts = line.strip().split(',')
                        if len(parts) >= 5:
                            dates.append(parts[0])
                            prices.append(float(parts[4]))
                    self.wfile.write(json.dumps({"ticker": ticker, "dates": dates, "prices": prices}).encode())
            except Exception as e:
                self.wfile.write(json.dumps({"error": "Data not found"}).encode())
            return
        self.wfile.write(b'{"error": "Not Found"}')

    def do_POST(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        if self.path == '/api/simulate':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            ticker = data.get("ticker", "AAPL")
            cap = str(data.get("initialCapital", 100000.0))
            shortWindow = str(data.get("shortWindow", 10))
            longWindow = str(data.get("longWindow", 50))
            
            # Run C++ Simulator
            try:
                result = subprocess.run(
                    [SIMULATOR_PATH, ticker, cap, shortWindow, longWindow],
                    capture_output=True, text=True, check=True, cwd=BASE_DIR
                )
                self.wfile.write(result.stdout.encode())
            except subprocess.CalledProcessError as e:
                self.wfile.write(json.dumps({"error": "Simulation failed", "details": e.stderr}).encode())
            except Exception as e:
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return
        self.wfile.write(b'{"error": "Not Found"}')

print(f"Starting Python server on port {PORT}...")
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    httpd.serve_forever()
