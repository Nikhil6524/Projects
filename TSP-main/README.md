
# Comparative Analysis of Optimization Techniques for the Traveling Salesman Problem (TSP)

This repository provides a detailed comparative analysis of various optimization techniques applied to the Traveling Salesman Problem (TSP). It includes both exact and heuristic/meta-heuristic algorithms, evaluating their efficiency, scalability, and solution quality.

---

## 🚀 Features
- Comprehensive implementation of algorithms:
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
    - Lin-Kernighan-Helsgaun Algorithm (`LKH.py`, `Optimised_LKH.py`)
  - **Machine Learning Approach**:
    - Neural Networks for TSP (`neural_networks.py`)
- Jupyter Notebook (`proj1[1].ipynb`) for visualization and analysis.
- Comparative performance analysis across all algorithms.
- Results visualization (shortest path, convergence graphs, etc.).

---

## 🗂️ Project Structure

```plaintext
├── Christofides.py                # Christofides algorithm implementation
├── LKH.py                         # Lin-Kernighan-Helsgaun algorithm
├── Optimised_LKH.py               # Optimized Lin-Kernighan-Helsgaun algorithm
├── aco.py                         # Ant Colony Optimization
├── anneal.py                      # Simulated Annealing
├── brute_force.py                 # Brute Force solution
├── cpu_dp.py                      # Dynamic Programming optimized for CPU
├── divide_and_conquer.py          # Divide and Conquer approach
├── dynamic_programming.py         # Standard Dynamic Programming
├── genetic.py                     # Genetic Algorithm
├── greedy_tsp.py                  # Greedy Algorithm
├── neural_networks.py             # Neural Network-based TSP solution
├── proj1[1].ipynb                 # Jupyter Notebook for analysis and visualization
├── pso.py                         # Particle Swarm Optimization
├── python.py                      # Miscellaneous utilities
├── requirements.txt               # Required dependencies
├── README.md                      # Project documentation
```

---

## 🛠️ Setup and Usage

### Prerequisites
Ensure Python 3.8 or later is installed. Install dependencies using:
```bash
pip install -r requirements.txt
```

### Running the Project
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tsp-optimization-analysis.git
   cd tsp-optimization-analysis
   ```
2. Run any algorithm by executing the corresponding script:
   ```bash
   python genetic.py
   ```
3. Open the Jupyter Notebook for in-depth analysis:
   ```bash
   jupyter notebook proj1[1].ipynb
   ```

---

## 📊 Comparative Analysis

The project evaluates each algorithm based on:
- **Optimal Path Length**: Quality of the shortest path found.
- **Execution Time**: Time required to compute the solution.
- **Convergence Behavior**: How quickly the algorithm converges to an optimal or near-optimal solution.
- **Scalability**: Performance on varying dataset sizes.

---

## 📚 Algorithms Overview

### Exact Algorithms
1. **Brute Force**:
   - Explores all possible route permutations.
   - Guarantees optimality but computationally expensive.

2. **Dynamic Programming**:
   - Uses memoization to optimize subproblem solutions.
   - Reduces redundant calculations compared to brute force.

3. **Christofides Algorithm**:
   - Constructs a near-optimal solution using Minimum Spanning Tree (MST) and Eulerian cycles.

### Heuristic and Meta-Heuristic Algorithms
4. **Greedy TSP**:
   - Selects the nearest unvisited city at each step.
   - Fast but may not yield optimal solutions.

5. **Genetic Algorithm**:
   - Inspired by natural evolution (mutation, crossover, selection).
   - Effective for large-scale TSP problems.

6. **Ant Colony Optimization (ACO)**:
   - Simulates ant behavior using pheromone trails to find optimal routes.

7. **Particle Swarm Optimization (PSO)**:
   - Simulates social behavior to optimize solutions.

8. **Simulated Annealing (SA)**:
   - Mimics the annealing process in metallurgy to escape local optima.

9. **Lin-Kernighan-Helsgaun Algorithm (LKH)**:
   - One of the most effective heuristics for large-scale TSP instances.

### Machine Learning Approach
10. **Neural Networks**:
    - Utilizes machine learning to approximate solutions for TSP.


---

## 🛠️ Future Enhancements
- Implement additional state-of-the-art algorithms.
- Introduce parallel and distributed computing for improved performance.
- Expand datasets to include more real-world TSP instances.

---

## 🤝 Contributions

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to your branch (`git push origin feature-branch`).
5. Open a pull request.

---

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🙌 Acknowledgments
Special thanks to the open-source community and academic research on optimization techniques.

---

## 📞 Contact

For any inquiries, feel free to contact:
- **Author**: [Your Name](https://github.com/Nikhil6524)
- **Email**: bl.en.u4aie22062@bl.students.amrita.edu
