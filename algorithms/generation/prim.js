/**
 * prim.js - Implementación del algoritmo de Prim para generación de laberintos
 * 
 * El algoritmo de Prim es un algoritmo de árbol de expansión mínima que
 * puede ser adaptado para generar laberintos perfectos (con un único camino
 * entre cualquier par de celdas).
 */

/**
 * Genera un laberinto usando el algoritmo de Prim
 * @param {Maze} maze - Instancia del laberinto a generar
 */
function generateMazeWithPrim(maze) {
    // Inicializar el laberinto con todas las celdas como paredes
    for (let row = 0; row < maze.size; row++) {
        for (let col = 0; col < maze.size; col++) {
            maze.setWall(row, col, true);
        }
    }
    
    // Elegir una celda inicial aleatoria (que sea par para evitar bordes)
    const startRow = Math.floor(Math.random() * (maze.size / 2)) * 2 + 1;
    const startCol = Math.floor(Math.random() * (maze.size / 2)) * 2 + 1;
    
    // Marcar la celda inicial como pasaje
    maze.setWall(startRow, startCol, false);
    
    // Lista de paredes frontera
    const frontierWalls = [];
    
    // Añadir las paredes vecinas a la frontera
    addFrontierWalls(maze, startRow, startCol, frontierWalls);
    
    // Mientras haya paredes en la frontera
    while (frontierWalls.length > 0) {
        // Elegir una pared aleatoria de la frontera
        const randomIndex = Math.floor(Math.random() * frontierWalls.length);
        const [wallRow, wallCol] = frontierWalls[randomIndex];
        
        // Remover la pared de la frontera
        frontierWalls.splice(randomIndex, 1);
        
        // Verificar si la pared conecta un pasaje con una celda no visitada
        const neighbors = getPassageNeighbors(maze, wallRow, wallCol);
        
        if (neighbors.length === 1) {
            // Convertir la pared en pasaje
            maze.setWall(wallRow, wallCol, false);
            
            // Encontrar la celda no visitada al otro lado de la pared
            const [passageRow, passageCol] = neighbors[0];
            const dx = wallRow - passageRow;
            const dy = wallCol - passageCol;
            const newRow = wallRow + dx;
            const newCol = wallCol + dy;
            
            // Verificar si la nueva celda está dentro de los límites
            if (newRow >= 0 && newRow < maze.size && newCol >= 0 && newCol < maze.size) {
                // Convertir la celda no visitada en pasaje
                maze.setWall(newRow, newCol, false);
                
                // Añadir las nuevas paredes frontera
                addFrontierWalls(maze, newRow, newCol, frontierWalls);
            }
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
 * Añade las paredes vecinas a la lista de frontera
 * @param {Maze} maze - Instancia del laberinto
 * @param {number} row - Fila de la celda
 * @param {number} col - Columna de la celda
 * @param {Array} frontierWalls - Lista de paredes frontera
 */
function addFrontierWalls(maze, row, col, frontierWalls) {
    // Direcciones: arriba, abajo, izquierda, derecha
    const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        // Verificar si la celda está dentro de los límites y es una pared
        if (newRow >= 0 && newRow < maze.size && newCol >= 0 && newCol < maze.size &&
            maze.grid[newRow][newCol].isWall) {
            
            // Añadir la pared entre la celda actual y la nueva celda
            const wallRow = row + dr / 2;
            const wallCol = col + dc / 2;
            
            // Verificar si ya está en la lista de frontera
            const isInFrontier = frontierWalls.some(([r, c]) => r === wallRow && c === wallCol);
            
            if (!isInFrontier) {
                frontierWalls.push([wallRow, wallCol]);
            }
        }
    }
}

/**
 * Obtiene las celdas vecinas que son pasajes
 * @param {Maze} maze - Instancia del laberinto
 * @param {number} row - Fila de la pared
 * @param {number} col - Columna de la pared
 * @returns {Array} - Lista de celdas vecinas que son pasajes
 */
function getPassageNeighbors(maze, row, col) {
    // Direcciones: arriba, abajo, izquierda, derecha
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const passages = [];
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        // Verificar si la celda está dentro de los límites y es un pasaje
        if (newRow >= 0 && newRow < maze.size && newCol >= 0 && newCol < maze.size &&
            !maze.grid[newRow][newCol].isWall) {
            passages.push([newRow, newCol]);
        }
    }
    
    return passages;
}
