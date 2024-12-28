import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import networkx as nx
import itertools
import time
from util import City, read_cities, write_cities_and_return_them, generate_cities

class Christofides:
    def __init__(self, cities):
        self.cities = cities
        self.graph = self.create_graph(cities)
        self.mst = None
        self.perfect_matching = None
        self.eulerian_circuit = None
        self.tour = []

    def create_graph(self, cities):
        G = nx.Graph()
        for i, city1 in enumerate(cities):
            for j, city2 in enumerate(cities):
                if i != j:
                    G.add_edge(i, j, weight=city1.distance(city2))
        return G

    def run(self):
        self.mst = self.minimum_spanning_tree(self.graph)
        odd_degree_nodes = [node for node in self.mst.nodes if self.mst.degree[node] % 2 == 1]
        self.perfect_matching = self.minimum_weight_perfect_matching(self.graph, odd_degree_nodes)
        multi_graph = nx.MultiGraph(self.mst)
        multi_graph.add_edges_from(self.perfect_matching)
        self.eulerian_circuit = list(nx.eulerian_circuit(multi_graph))
        self.tour = self.create_hamiltonian_circuit(self.eulerian_circuit)

        return self.calculate_tour_cost(self.tour)

    def minimum_spanning_tree(self, G):
        return nx.minimum_spanning_tree(G)

    def minimum_weight_perfect_matching(self, G, nodes):
        subgraph = G.subgraph(nodes)
        matching = nx.algorithms.matching.min_weight_matching(subgraph)
        return matching

    def create_hamiltonian_circuit(self, eulerian_circuit):
        visited = set()
        tour = []
        for u, v in eulerian_circuit:
            if u not in visited:
                visited.add(u)
                tour.append(u)
            if v not in visited:
                visited.add(v)
                tour.append(v)
        return tour

    def calculate_tour_cost(self, tour):
        return sum([self.cities[tour[i]].distance(self.cities[tour[(i + 1) % len(tour)]]) for i in range(len(tour))])

    def visualize(self):
        fig, ax = plt.subplots()
        x = [self.cities[city].x for city in self.tour]
        y = [self.cities[city].y for city in self.tour]
        line, = ax.plot([], [], 'g', marker='o', markersize=5)

        def init():
            ax.set_xlim(0, 1000)
            ax.set_ylim(0, 1000)
            return line,

        def update(frame):
            line.set_data(x[:frame + 1], y[:frame + 1])
            return line,

        ani = FuncAnimation(fig, update, frames=len(self.tour), init_func=init, blit=True, repeat=False, interval=200)
        plt.title('Christofides Algorithm TSP')
        plt.show()

if __name__ == "__main__":
    for _ in range(1):
        cities = read_cities(256)
        christofides = Christofides(cities)

        start_time = time.time()
        min_cost = christofides.run()
        end_time = time.time()

        print(f"Minimum cost: {min_cost}")
        print(f"Time taken to calculate the cost: {end_time - start_time} seconds")

        christofides.visualize()
