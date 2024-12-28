import matplotlib.pyplot as plt
from util import City, read_cities, write_cities_and_return_them, generate_cities, path_cost
import time as time

class Greedy:
    def __init__(self, cities):
        self.unvisited = cities[1:]
        self.route = [cities[0]]

    def run(self, plot):
        if plot:
            plt.ion()
            plt.show(block=False)
            self.init_plot()
        while len(self.unvisited):
            index, nearest_city = min(enumerate(self.unvisited),
                                      key=lambda item: item[1].distance(self.route[-1]))
            self.route.append(nearest_city)
            del self.unvisited[index]
            self.plot_interactive(False)
        self.route.append(self.route[0])
        self.plot_interactive(False)
        self.route.pop()
        return path_cost(self.route)

    def plot_interactive(self, block):
        x1, y1, x2, y2 = self.route[-2].x, self.route[-2].y, self.route[-1].x, self.route[-1].y
        plt.plot([x1, x2], [y1, y2], 'ro')
        plt.plot([x1, x2], [y1, y2], 'g')
        plt.draw()
        plt.pause(0.07)
        plt.show(block=block)

    def init_plot(self):
        fig = plt.figure(0)
        fig.suptitle('Greedy TSP')
        x_list, y_list = [], []
        for city in [*self.route, *self.unvisited]:
            x_list.append(city.x)
            y_list.append(city.y)
        x_list.append(self.route[0].x)
        y_list.append(self.route[0].y)

        plt.plot(x_list, y_list, 'ro')
        plt.show(block=False)


if __name__ == "__main__":
    cities = read_cities(256)
    greedy = Greedy(cities)

    start_time = time.time()
    min_cost = greedy.run(plot=False)  # Set plot to False to exclude visualization time
    end_time = time.time()

    print(f"Minimum cost: {min_cost}")
    print(f"Time taken: {end_time - start_time} seconds")
    plt.show(block=True)
