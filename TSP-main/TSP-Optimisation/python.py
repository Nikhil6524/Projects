import matplotlib.pyplot as plt
import networkx as nx
import matplotlib.patches as mpatches

def draw_complex_workflow():
    # Create a directed graph
    G = nx.DiGraph()

    # Define the nodes and their positions for better control over layout
    nodes = {
        "Data Collection": (1, 2),
        "Algorithm Selection": (2, 2),
        "Implementation": (1, 1),
        "Parameter Tuning": (2, 1),
        "Execution & Data Collection": (1, 0),
        "Performance Analysis": (2, 0),
        "Visualization": (1, -1),
        "Reporting": (2, -1)
    }

    # Define edges including back edges to form loops
    edges = [
        ("Data Collection", "Algorithm Selection"),
        ("Algorithm Selection", "Implementation"),
        ("Implementation", "Parameter Tuning"),
        ("Parameter Tuning", "Performance Analysis"),
        ("Performance Analysis", "Execution & Data Collection"),
        ("Execution & Data Collection", "Visualization"),
        ("Visualization", "Reporting"),
        ("Performance Analysis", "Parameter Tuning"),  # Loop back for additional tuning
        ("Execution & Data Collection", "Implementation"),  # Loop for re-implementation
    ]

    # Add nodes and edges to the graph
    G.add_nodes_from(nodes)
    G.add_edges_from(edges)

    # Draw the graph with custom node shapes
    pos = {node: (xy[0], -xy[1]) for node, xy in nodes.items()}
    for node, (x, y) in pos.items():
        square = mpatches.FancyBboxPatch((x-0.15, y-0.15), 0.3, 0.3, boxstyle="square,pad=-0.02", ec="black", fc="none", linewidth=2)
        plt.gca().add_patch(square)
        plt.text(x, y, node, ha='center', va='center', fontweight='bold')

    nx.draw_networkx_edges(G, pos, edge_color='gray', arrows=True)

    # Adjust plot margins
    plt.title("Workflow Diagram")
    plt.axis('off')  # Turn off the axis
    plt.xlim(0.5, 2.5)  # Set limits to center the nodes horizontally
    plt.ylim(-2, 3)  # Set limits to include all nodes vertically
    plt.show()

# Execute the function
draw_complex_workflow()
