/**
 * dfs-generation.js - Implementación del algoritmo DFS para generación de laberintos
 * 
 * Este algoritmo utiliza una búsqueda en profundidad (DFS) para generar un laberinto
 * perfecto (con un único camino entre cualquier par de celdas).
 */

/**
 * Genera un laberinto usando el algoritmo DFS
 * @param {Maze} maze - Instancia del laberinto a generar
 */
function generateMazeWithDFS(maze) {
    // Inicializar el laberinto con todas las celdas como paredes
    for (let row = 0; row < maze.size; row++) {
        for (let col = 0; col < maze.size; col++) {
            maze.setWall(row, col, true);
        }
    }
    
    // Elegir una celda inicial aleatoria (que sea impar para evitar bordes)
    const startRow = Math.floor(Math.random() * (maze.size / 2)) * 2 + 1;
    const startCol = Math.floor(Math.random() * (maze.size / 2)) * 2 + 1;
    
    // Marcar la celda inicial como pasaje
    maze.setWall(startRow, startCol, false);
    
    // Realizar DFS desde la celda inicial
    dfsCarve(maze, startRow, startCol);
    
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
 * Realiza una búsqueda en profundidad para tallar el laberinto
 * @param {Maze} maze - Instancia del laberinto
 * @param {number} row - Fila actual
 * @param {number} col - Columna actual
 */
function dfsCarve(maze, row, col) {
    // Direcciones: arriba, abajo, izquierda, derecha
    const directions = [
        [-2, 0],  // Arriba
        [2, 0],   // Abajo
        [0, -2],  // Izquierda
        [0, 2]    // Derecha
    ];
    
    // Mezclar las direcciones para obtener un laberinto más aleatorio
    shuffleArray(directions);
    
    // Explorar cada dirección
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        // Verificar si la nueva celda está dentro de los límites y es una pared
        if (newRow >= 0 && newRow < maze.size && newCol >= 0 && newCol < maze.size &&
            maze.grid[newRow][newCol].isWall) {
            
            // Derribar la pared entre la celda actual y la nueva celda
            const wallRow = row + dr / 2;
            const wallCol = col + dc / 2;
            maze.setWall(wallRow, wallCol, false);
            
            // Marcar la nueva celda como pasaje
            maze.setWall(newRow, newCol, false);
            
            // Continuar DFS desde la nueva celda
            dfsCarve(maze, newRow, newCol);
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
