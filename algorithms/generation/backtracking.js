/**
 * backtracking.js - Implementación del algoritmo de backtracking para generación de laberintos
 * 
 * Este algoritmo es similar al DFS pero utiliza una pila explícita en lugar de recursión,
 * lo que permite visualizar el proceso de generación paso a paso.
 */

/**
 * Genera un laberinto usando el algoritmo de backtracking
 * @param {Maze} maze - Instancia del laberinto a generar
 */
function generateMazeWithBacktracking(maze) {
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
    
    // Crear un array para rastrear celdas visitadas
    const visited = Array(maze.size).fill().map(() => Array(maze.size).fill(false));
    visited[startRow][startCol] = true;
    
    // Pila para el backtracking
    const stack = [{ row: startRow, col: startCol }];
    
    // Mientras la pila no esté vacía
    while (stack.length > 0) {
        // Obtener la celda actual (sin quitarla de la pila)
        const current = stack[stack.length - 1];
        
        // Obtener vecinos no visitados
        const neighbors = getUnvisitedNeighbors(maze, current.row, current.col, visited);
        
        if (neighbors.length > 0) {
            // Elegir un vecino aleatorio
            const randomIndex = Math.floor(Math.random() * neighbors.length);
            const next = neighbors[randomIndex];
            
            // Derribar la pared entre la celda actual y la siguiente
            const wallRow = (current.row + next.row) / 2;
            const wallCol = (current.col + next.col) / 2;
            maze.setWall(wallRow, wallCol, false);
            
            // Marcar la nueva celda como pasaje y visitada
            maze.setWall(next.row, next.col, false);
            visited[next.row][next.col] = true;
            
            // Añadir la nueva celda a la pila
            stack.push(next);
        } else {
            // No hay vecinos no visitados, hacer backtracking
            stack.pop();
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
 * Obtiene los vecinos no visitados de una celda
 * @param {Maze} maze - Instancia del laberinto
 * @param {number} row - Fila de la celda
 * @param {number} col - Columna de la celda
 * @param {Array} visited - Matriz de celdas visitadas
 * @returns {Array} - Lista de vecinos no visitados
 */
function getUnvisitedNeighbors(maze, row, col, visited) {
    // Direcciones: arriba, abajo, izquierda, derecha
    const directions = [
        [-2, 0],  // Arriba
        [2, 0],   // Abajo
        [0, -2],  // Izquierda
        [0, 2]    // Derecha
    ];
    
    const neighbors = [];
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        // Verificar si la nueva celda está dentro de los límites y no ha sido visitada
        if (newRow >= 0 && newRow < maze.size && newCol >= 0 && newCol < maze.size &&
            !visited[newRow][newCol]) {
            neighbors.push({ row: newRow, col: newCol });
        }
    }
    
    return neighbors;
}
