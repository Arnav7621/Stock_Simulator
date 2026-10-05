mkdir data -Force
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/yhirose/cpp-httplib/master/httplib.h" -OutFile "httplib.h"
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/nlohmann/json/v3.9.1/single_include/nlohmann/json.hpp" -OutFile "json.hpp"
Remove-Item "init.py" -ErrorAction SilentlyContinue
g++ -std=c++17 -O2 -o generate_data generate_data.cpp
.\generate_data.exe
