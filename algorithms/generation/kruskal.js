/**
 * kruskal.js - Implementación del algoritmo de Kruskal para generación de laberintos
 * 
 * El algoritmo de Kruskal es un algoritmo de árbol de expansión mínima que
 * puede ser adaptado para generar laberintos perfectos (con un único camino
 * entre cualquier par de celdas).
 */

/**
 * Genera un laberinto usando el algoritmo de Kruskal
 * @param {Maze} maze - Instancia del laberinto a generar
 */
function generateMazeWithKruskal(maze) {
    // Inicializar el laberinto con todas las celdas como paredes
    for (let row = 0; row < maze.size; row++) {
        for (let col = 0; col < maze.size; col++) {
            maze.setWall(row, col, true);
        }
    }
    
    // Crear conjuntos disjuntos para cada celda (inicialmente cada celda está en su propio conjunto)
    const sets = new DisjointSets(maze.size);
    
    // Crear una lista de todas las paredes internas
    const walls = [];
    
    // Marcar las celdas que serán pasajes (celdas con coordenadas impares)
    for (let row = 1; row < maze.size; row += 2) {
        for (let col = 1; col < maze.size; col += 2) {
            // Marcar la celda como pasaje
            maze.setWall(row, col, false);
            
            // Añadir las paredes a la derecha y abajo (si están dentro de los límites)
            if (col + 2 < maze.size) {
                walls.push({
                    from: { row, col },
                    to: { row, col: col + 2 },
                    wall: { row, col: col + 1 }
                });
            }
            
            if (row + 2 < maze.size) {
                walls.push({
                    from: { row, col },
                    to: { row: row + 2, col },
                    wall: { row: row + 1, col }
                });
            }
        }
    }
    
    // Mezclar aleatoriamente las paredes
    shuffleArray(walls);
    
    // Procesar cada pared
    for (const { from, to, wall } of walls) {
        // Calcular los índices de los conjuntos
        const fromIndex = (from.row * maze.size + from.col) / 2;
        const toIndex = (to.row * maze.size + to.col) / 2;
        
        // Si las celdas están en conjuntos diferentes, unirlas
        if (sets.find(fromIndex) !== sets.find(toIndex)) {
            // Unir los conjuntos
            sets.union(fromIndex, toIndex);
            
            // Eliminar la pared entre ellas
            maze.setWall(wall.row, wall.col, false);
        }
    }
    
    // Asegurar que el inicio y fin no sean paredes
    if (maze.startCell) {
        maze.startCell.isWall = false;
        
        // Asegurar que las celdas adyacentes al inicio no sean paredes
        const startNeighbors = maze.getNeighbors(maze.startCell.row, maze.startCell.col);
        for (const neighbor of startNeighbors) {
            if (Math.random() < 0.7) { // 70% de probabilidad de abrir un camino
                maze.setWall(neighbor.row, neighbor.col, false);
            }
        }
    }
    
    if (maze.endCell) {
        maze.endCell.isWall = false;
        
        // Asegurar que las celdas adyacentes al fin no sean paredes
        const endNeighbors = maze.getNeighbors(maze.endCell.row, maze.endCell.col);
        for (const neighbor of endNeighbors) {
            if (Math.random() < 0.7) { // 70% de probabilidad de abrir un camino
                maze.setWall(neighbor.row, neighbor.col, false);
            }
        }
    }
    
    // Redibujar el laberinto
    maze.draw();
}

/**
 * Clase para manejar conjuntos disjuntos (Union-Find)
 */
class DisjointSets {
    /**
     * Constructor
     * @param {number} size - Tamaño del laberinto
     */
    constructor(size) {
        // Calcular el número de celdas (solo las que serán pasajes)
        const numCells = Math.ceil(size / 2) * Math.ceil(size / 2);
        
        // Inicializar los padres (cada elemento es su propio padre inicialmente)
        this.parent = Array.from({ length: numCells }, (_, i) => i);
        
        // Inicializar los rangos (todos en 0 inicialmente)
        this.rank = Array(numCells).fill(0);
    }
    
    /**
     * Encuentra el representante de un conjunto
     * @param {number} x - Elemento a buscar
     * @returns {number} - Representante del conjunto
     */
    find(x) {
        if (this.parent[x] !== x) {
            // Compresión de camino
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }
    
    /**
     * Une dos conjuntos
     * @param {number} x - Primer elemento
     * @param {number} y - Segundo elemento
     */
    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);
        
        if (rootX === rootY) return;
        
        // Unión por rango
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
    }
}

/**
 * Mezcla aleatoriamente un array (algoritmo de Fisher-Yates)
 * @param {Array} array - Array a mezclar
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
