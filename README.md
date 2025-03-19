# MazeViz

MazeViz es una aplicación web interactiva para generar, visualizar y resolver laberintos utilizando diferentes algoritmos.

## Características

- Generación de laberintos aleatorios utilizando varios algoritmos:
  - Prim
  - Kruskal
  - DFS
  - Backtracking
- Dibujo manual de laberintos
- Resolución de laberintos con visualización animada usando:
  - Búsqueda en profundidad (DFS)
  - Búsqueda en anchura (BFS)
  - A*
  - Dijkstra
  - Wall Follower (regla de la mano derecha)
- Exportación e importación de laberintos en formato JSON
- Modo oscuro/claro
- Ajuste de velocidad de animación
- Estadísticas de resolución (nodos visitados, longitud del camino, tiempo)

## Cómo usar

1. Abre `index.html` en tu navegador
2. Genera un laberinto aleatorio o dibuja uno manualmente
3. Selecciona un algoritmo de resolución
4. Haz clic en "Resolver Laberinto" para ver la animación

## Estructura del proyecto

```
MazeViz/
│── index.html
│── styles/
│   ├── main.css
│   ├── maze.css
│── scripts/
│   ├── main.js
│   ├── maze.js
│── algorithms/
│   ├── generation/
│   │   ├── prim.js
│   │   ├── kruskal.js
│   │   ├── dfs-generation.js
│   │   ├── backtracking.js
│   ├── solving/
│   │   ├── depth-first.js
│   │   ├── breadth-first.js
│   │   ├── a-star.js
│   │   ├── dijkstra.js
│   │   ├── wall-follower.js
```

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (vanilla, sin frameworks)
- Canvas API para la visualización
