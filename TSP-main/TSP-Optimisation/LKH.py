import random
from util import City, read_cities, path_cost

def calculate_distance_matrix(cities):
    n = len(cities)
    distance_matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            distance = cities[i].distance(cities[j])
            distance_matrix[i][j] = distance
            distance_matrix[j][i] = distance
    return distance_matrix

def swap_2opt(route, i, k):
    assert i < k
    new_route = route[0:i]
    new_route.extend(reversed(route[i:k + 1]))
    new_route.extend(route[k + 1:])
    return new_route

def get_neighbors(n, num_neighbors):
    neighbors = []
    for i in range(n):
        local_neighbors = list(range(n))
        local_neighbors.remove(i)
        random.shuffle(local_neighbors)
        neighbors.append(local_neighbors[:num_neighbors])
    return neighbors

def lin_kernighan(cities):
    n = len(cities)
    distance_matrix = calculate_distance_matrix(cities)
    best_route = list(range(n))
    random.shuffle(best_route)
    best_cost = path_cost([cities[i] for i in best_route])

    improvement = True
    while improvement:
        improvement = False
        for start in range(n):
            for i in range(n):
                i_next = (i + 1) % n
                for k in range(i + 2, n + (i - 1) % n):
                    k_next = (k + 1) % n
                    if k == i_next:  # This would make no change in the tour
                        continue
                    new_route = swap_2opt(best_route, i_next, k)
                    new_cost = path_cost([cities[idx] for idx in new_route])
                    if new_cost < best_cost:
                        best_route = new_route
                        best_cost = new_cost
                        improvement = True
                        break
                if improvement:
                    break
            if improvement:
                break

    return best_route, best_cost

if __name__ == "__main__":
    cities = read_cities(256)  # Assumes 'cities_20.data' exists
    best_route, best_cost = lin_kernighan(cities)
    print(f"Optimized Route: {best_route}")
    print(f"Optimized Cost: {best_cost:.2f}")
