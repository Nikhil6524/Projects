import math
import random
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from util import City, read_cities, path_cost
import time

def calculate_distance_matrix(cities):
    n = len(cities)
    distance_matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            distance = cities[i].distance(cities[j])
            distance_matrix[i][j] = distance
            distance_matrix[j][i] = distance
    return distance_matrix

def create_candidate_list(distance_matrix, k=20):
    candidate_list = []
    for i, distances in enumerate(distance_matrix):
        # Sort cities by distance and take the closest k cities
        sorted_cities = sorted(range(len(distances)), key=lambda x: distances[x])
        candidate_list.append(sorted_cities[1:k+1])  # Exclude self
    return candidate_list

def swap_2opt(route, i, k):
    new_route = route[0:i]
    new_route.extend(reversed(route[i:k+1]))
    new_route.extend(route[k+1:])
    return new_route

def lin_kernighan(cities):
    distance_matrix = calculate_distance_matrix(cities)
    candidate_list = create_candidate_list(distance_matrix)
    n = len(cities)
    best_route = list(range(n))
    random.shuffle(best_route)
    best_cost = path_cost([cities[i] for i in best_route])
    history = [(best_route[:], best_cost)]

    improved = True
    while improved:
        improved = False
        for i in range(n - 1):
            for k in candidate_list[i]:  # Only consider candidates for i
                if i < k:  # Ensure correct ordering for 2-opt swap
                    new_route = swap_2opt(best_route, i, k)
                    new_cost = sum(distance_matrix[new_route[l]][new_route[l + 1]] for l in range(n - 1))
                    new_cost += distance_matrix[new_route[-1]][new_route[0]]
                    if new_cost < best_cost:
                        best_route = new_route
                        best_cost = new_cost
                        improved = True
                        history.append((best_route[:], best_cost))
                        break
            if improved:
                break

    return best_route, best_cost, history

def animate_lin_kernighan(cities, history):
    fig, ax = plt.subplots()
    line, = ax.plot([], [], 'o-')
    text = ax.text(0.02, 0.95, '', transform=ax.transAxes)
    xdata, ydata = [], []

    def init():
        ax.set_xlim(0, 1000)
        ax.set_ylim(0, 1000)
        return line, text

    def update(frame):
        route, cost = history[frame]
        xdata = [cities[i].x for i in route] + [cities[route[0]].x]
        ydata = [cities[i].y for i in route] + [cities[route[0]].y]
        line.set_data(xdata, ydata)
        text.set_text(f'Cost: {cost:.2f}')
        return line, text

    ani = FuncAnimation(fig, update, frames=range(len(history)), init_func=init, blit=True, repeat=False, interval=50)
    plt.title("Lin-Kernighan TSP Solution")
    plt.show()

if __name__ == "__main__":
    cities = read_cities(256)

    start_time = time.time()
    best_route, best_cost, history = lin_kernighan(cities)
    end_time = time.time()

    sol = [cities[i] for i in best_route]
    print(f"Minimum path cost: {best_cost}")
    print(f"Time taken for computation: {end_time - start_time} seconds")

    animate_lin_kernighan(cities, history)
