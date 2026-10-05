cmake_minimum_required(VERSION 3.10)
project(stock_simulator)

# Requires C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source files
set(SOURCES main.cpp)

# Output binary
add_executable(stock_simulator ${SOURCES})

# Thread support for cpp-httplib
find_package(Threads REQUIRED)
target_link_libraries(stock_simulator Threads::Threads)
