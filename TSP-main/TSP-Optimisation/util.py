import math
import random
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import itertools


class City:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def distance(self, city):
        return math.hypot(self.x - city.x, self.y - city.y)

    def __repr__(self):
        return f"({self.x}, {self.y})"


def read_cities(size):
    cities = []
    with open(f'test_data/cities_{size}.data', 'r') as handle:
        lines = handle.readlines()
        for line in lines:
            x, y = map(float, line.split())
            cities.append(City(x, y))
    return cities


def write_cities_and_return_them(size):
    cities = generate_cities(size)
    with open(f'test_data/cities_{size}.data', 'w+') as handle:
        for city in cities:
            handle.write(f'{city.x} {city.y}\n')
    return cities


def generate_cities(size):
    return [City(x=int(random.random() * 1000), y=int(random.random() * 1000)) for _ in range(size)]


def path_cost(route):
    return sum([city.distance(route[index - 1]) for index, city in enumerate(route)])


def visualize_tsp(title, cities,sample_size=100):
    fig, ax = plt.subplots()
    line, = ax.plot([], [], 'bo-', animated=True)

    def init():
        ax.set_xlim(0, 1000)  # Adjusted to the range used in generate_cities
        ax.set_ylim(0, 1000)
        return line,

    def update(path):
        x, y = zip(*[(city.x, city.y) for city in path])
        line.set_data(x, y)
        return line,

    paths = list(itertools.permutations(cities))
    random.shuffle(paths)
    paths = paths[:sample_size]  # Only use a subset of paths to speed up the animation

    ani = FuncAnimation(fig, update, frames=paths, init_func=init, blit=True, repeat=False, interval=10)  # Reduced interval
    plt.title(title)
    plt.show()