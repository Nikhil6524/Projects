import math
import random
import matplotlib.pyplot as plt
from util_aco import City, read_cities, path_cost, visualize_tsp
import time
class AntColony:
    def __init__(self, cities, n_ants=20, n_best=5, n_iterations=100, decay=0.95, alpha=1, beta=2):
        self.cities = cities
        self.n_ants = n_ants
        self.n_best = n_best
        self.n_iterations = n_iterations
        self.decay = decay
        self.alpha = alpha
        self.beta = beta
        self.pheromone = [[1 / (len(cities) ** 2) for _ in range(len(cities))] for __ in range(len(cities))]
        self.all_inds = range(len(cities))
        self.best_route = None
        self.best_cost = float('inf')
        self.progress = []

    def run(self):
        for iteration in range(self.n_iterations):
            all_routes = [self.generate_route() for _ in range(self.n_ants)]
            self.update_pheromone(all_routes)
            best_route_in_iteration = min(all_routes, key=lambda x: path_cost(x))
            cost = path_cost(best_route_in_iteration)
            self.progress.append(cost)
            if cost < self.best_cost:
                self.best_cost = cost
                self.best_route = best_route_in_iteration
            self.pheromone_decay()

        print("Best fitness obtained:", self.best_cost)

    def generate_route(self):
        route = []
        start = random.choice(self.cities)
        unvisited = set(self.cities)
        unvisited.remove(start)
        current = start
        route.append(current)

        while unvisited:
            probabilities = self.calculate_transition_probabilities(current, unvisited)
            next_city = self.roulette_wheel_selection(probabilities)
            route.append(next_city)
            unvisited.remove(next_city)
            current = next_city

        # Apply a local search like 2-opt
        route = self.local_search_2opt(route)
        return route

    def calculate_transition_probabilities(self, current, unvisited):
        probabilities = []
        pheromone = self.pheromone[current.index]
        total = sum(pheromone[city.index] ** self.alpha * (1 / current.distance(city)) ** self.beta for city in unvisited)

        for city in unvisited:
            prob = (pheromone[city.index] ** self.alpha * (1 / current.distance(city)) ** self.beta) / total
            probabilities.append((city, prob))

        return probabilities

    def roulette_wheel_selection(self, probabilities):
        random_value = random.random()
        cumulative_probability = 0.0
        for city, prob in probabilities:
            cumulative_probability += prob
            if cumulative_probability >= random_value:
                return city
        return probabilities[-1][0]  # return the last city if no selection (shouldn't happen)

    def update_pheromone(self, routes):
        for route in routes:
            contribution = 1 / path_cost(route)
            for i in range(len(route) - 1):
                self.pheromone[route[i].index][route[i + 1].index] += contribution
                self.pheromone[route[i + 1].index][route[i].index] += contribution  # Symmetric TSP

    def pheromone_decay(self):
        for i in range(len(self.pheromone)):
            for j in range(len(self.pheromone)):
                self.pheromone[i][j] *= self.decay

    def local_search_2opt(self, route):
        best = route
        improved = True
        while improved:
            improved = False
            for i in range(1, len(route) - 2):
                for j in range(i + 1, len(route)):
                    if j - i == 1: continue
                    new_route = route[:]
                    new_route[i:j] = route[j - 1:i - 1:-1]
                    if path_cost(new_route) < path_cost(best):
                        best = new_route
                        improved = True
            route = best
        return best

    def plot_learning(self):
        plt.figure()
        plt.plot(self.progress)
        plt.xlabel('Iteration')
        plt.ylabel('Distance of Best Route')
        plt.title('ACO Progress')
        plt.show()

    def visualize_routes(self):
        visualize_tsp('Ant Colony Optimization TSP', self.best_route)

if __name__ == "__main__":
    cities = read_cities(256)  # Example: Reading 256 cities from file
    aco = AntColony(cities, n_ants=20, n_best=5, n_iterations=100, decay=0.95)

    start_time = time.time()
    aco.run()
    end_time = time.time()

    total_time = end_time - start_time
    print(f"Total time taken: {total_time} seconds")

    aco.plot_learning()
    aco.visualize_routes()
