import itertools
from util import City, read_cities, write_cities_and_return_them, generate_cities, path_cost, visualize_tsp
import time as time

class BruteForce:
    def __init__(self, cities):
        self.cities = cities

    def run(self):
        start_time = time.time()  # Start timing before the computation
        self.cities = min(itertools.permutations(self.cities), key=lambda path: path_cost(path))
        end_time = time.time()  # End timing after the computation
        return path_cost(self.cities), end_time - start_time  # Return both cost and time


if __name__ == "__main__":

    brute = BruteForce(read_cities(8))
    cost, duration = brute.run()
    print(f"Minimum path cost: {cost}, Time taken: {duration} seconds")
    visualize_tsp('Brute force TSP', brute.cities)
