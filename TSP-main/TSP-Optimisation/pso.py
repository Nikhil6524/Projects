import time
from util import read_cities, path_cost, City

def nearest_neighbor(cities, start_index=0):
    unvisited = cities[:]
    current_city = unvisited.pop(start_index)
    route = [current_city]

    while unvisited:
        next_city = min(unvisited, key=lambda city: city.distance(current_city))
        route.append(next_city)
        unvisited.remove(next_city)
        current_city = next_city

    return route

class Particle:
    def __init__(self, route):
        self.route = route
        self.best_route = route.copy()
        self.best_cost = path_cost(route)
        self.velocity = []

    def update_velocity(self, global_best_route):
        # Deterministic velocity update: swap a fixed number of elements between personal and global best routes
        self.velocity = [(i, j) for i, j in zip(range(len(self.route)), reversed(range(len(self.route)))) if i < j][:len(self.route)//4]

    def apply_velocity(self):
        # Apply velocity as a series of swaps
        for i, j in self.velocity:
            self.route[i], self.route[j] = self.route[j], self.route[i]

    def evaluate(self):
        current_cost = path_cost(self.route)
        if current_cost < self.best_cost:
            self.best_cost = current_cost
            self.best_route = self.route.copy()
        return current_cost

def pso_for_tsp(cities, num_particles=10, iterations=30):
    initial_routes = [nearest_neighbor(cities, start_index=i % len(cities)) for i in range(num_particles)]
    particles = [Particle(route) for route in initial_routes]
    global_best_route = min(particles, key=lambda p: p.best_cost).best_route
    global_best_cost = path_cost(global_best_route)

    for _ in range(iterations):
        for particle in particles:
            particle.update_velocity(global_best_route)
            particle.apply_velocity()
            particle_cost = particle.evaluate()
            if particle_cost < global_best_cost:
                global_best_cost = particle_cost
                global_best_route = particle.best_route.copy()

    return global_best_route, global_best_cost

if __name__ == '__main__':
    cities = read_cities(256)  # Assumes 'cities_20.data' exists
    start_time = time.time()
    best_route, best_cost = pso_for_tsp(cities)
    end_time = time.time()
    print(f"Best Route: {best_route}")
    print(f"Cost of the best route: {best_cost:.2f}")
    print(f"Time taken: {end_time - start_time:.2f} seconds")
