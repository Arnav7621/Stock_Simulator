CXX = g++
CXXFLAGS = -std=c++17 -O2

all: stock_simulator generate_data

stock_simulator: main.cpp httplib.h json.hpp
	$(CXX) $(CXXFLAGS) -o stock_simulator main.cpp -lpthread

generate_data: generate_data.cpp
	$(CXX) $(CXXFLAGS) -o generate_data generate_data.cpp

clean:
	rm -f stock_simulator generate_data
