# Comparative Analysis of Optimization Techniques for the Traveling Salesman Problem (TSP)

This repository contains implementations and analysis of various optimization techniques for solving the Traveling Salesman Problem (TSP). The project compares classical and meta-heuristic approaches in terms of performance, efficiency, and accuracy.

---

## 🚀 Features
- Implementation of a wide range of algorithms:
  - **Exact Algorithms**:
    - Brute Force (`brute_force.py`)
    - Dynamic Programming (`dynamic_programming.py`, `cpu_dp.py`)
    - Divide and Conquer (`divide_and_conquer.py`)
    - Christofides Algorithm (`Christofides.py`)
  - **Heuristic and Meta-Heuristic Algorithms**:
    - Greedy TSP (`greedy_tsp.py`)
    - Genetic Algorithm (`genetic.py`)
    - Ant Colony Optimization (`aco.py`)
    - Particle Swarm Optimization (`pso.py`)
    - Simulated Annealing (`anneal.py`)
    - Tabu Search
    - Lin-Kernighan-Helsgaun Algorithm (`LKH.py`, `Optimised_LKH.py`)
  - **Machine Learning Approach**:
    - Neural Networks for TSP (`neural_networks.py`)
- Jupyter Notebook (`proj1[1].ipynb`) for data analysis, visualizations, and insights.
- Comparative performance analysis across all algorithms.

---

## 📁 Project Structure

```plaintext
├── Christofides.py                # Christofides algorithm implementation
├── LKH.py                         # Lin-Kernighan-Helsgaun algorithm
├── Optimised_LKH.py               # Optimized Lin-Kernighan-Helsgaun
├── aco.py                         # Ant Colony Optimization
├── anneal.py                      # Simulated Annealing
├── brute_force.py                 # Brute Force solution
├── cpu_dp.py                      # Dynamic Programming for TSP (optimized for CPU)
├── divide_and_conquer.py          # Divide and Conquer approach
├── dynamic_programming.py         # Standard Dynamic Programming
├── genetic.py                     # Genetic Algorithm
├── greedy_tsp.py                  # Greedy Algorithm
├── neural_networks.py             # Neural Network-based TSP solution
├── proj1[1].ipynb                 # Jupyter Notebook for analysis and visualization
├── pso.py                         # Particle Swarm Optimization
├── python.py                      # Miscellaneous utilities
