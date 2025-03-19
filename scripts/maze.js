/**
 * maze.js - Clase para manejar la estructura y renderizado del laberinto
 */

class Maze {
    /**
     * Constructor para la clase Maze
     * @param {HTMLCanvasElement} canvas - El elemento canvas donde se dibujará el laberinto
     * @param {number} size - El tamaño del laberinto (número de celdas por lado)
     */
    constructor(canvas, size) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = size;
        this.grid = [];
        this.startCell = null;
        this.endCell = null;
        this.cellSize = 0;
    }
    
    /**
     * Inicializa el laberinto con celdas vacías
     */
    initialize() {
        this.grid = [];
        
        // Crear la cuadrícula de celdas
        for (let row = 0; row < this.size; row++) {
            const rowCells = [];
            for (let col = 0; col < this.size; col++) {
                rowCells.push({
                    row,
                    col,
                    isWall: false,
                    isStart: false,
                    isEnd: false,
                    isVisited: false,
                    isFrontier: false,
                    isPath: false,
                    distance: Infinity,
                    parent: null
                });
            }
            this.grid.push(rowCells);
        }
        
        // Establecer celdas de inicio y fin por defecto
        this.startCell = this.grid[1][1];
        this.endCell = this.grid[this.size - 2][this.size - 2];
        this.startCell.isStart = true;
        this.endCell.isEnd = true;
        
        // Calcular el tamaño de cada celda
        this.calculateCellSize();
    }
    
    /**
     * Calcula el tamaño de cada celda basado en el tamaño del canvas
     */
    calculateCellSize() {
        const minDimension = Math.min(this.canvas.width, this.canvas.height);
        this.cellSize = Math.floor(minDimension / this.size);
    }
    
    /**
     * Dibuja el laberinto completo en el canvas
     */
    draw() {
        // Limpiar el canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calcular el desplazamiento para centrar el laberinto
        const offsetX = (this.canvas.width - this.size * this.cellSize) / 2;
        const offsetY = (this.canvas.height - this.size * this.cellSize) / 2;
        
        // Dibujar cada celda
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.grid[row][col];
                const x = offsetX + col * this.cellSize;
                const y = offsetY + row * this.cellSize;
                
                // Establecer el color de la celda según su estado
                if (cell.isWall) {
                    this.ctx.fillStyle = '#333333';
                } else if (cell.isStart) {
                    this.ctx.fillStyle = '#4caf50';
                } else if (cell.isEnd) {
                    this.ctx.fillStyle = '#f44336';
                } else if (cell.isPath) {
                    this.ctx.fillStyle = '#ffeb3b';
                } else if (cell.isVisited) {
                    this.ctx.fillStyle = '#bbdefb';
                } else if (cell.isFrontier) {
                    this.ctx.fillStyle = '#90caf9';
                } else {
                    this.ctx.fillStyle = '#ffffff';
                }
                
                // Dibujar la celda
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // Dibujar el borde de la celda
                this.ctx.strokeStyle = '#dddddd';
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }
    
    /**
     * Obtiene una celda a partir de coordenadas del canvas
     * @param {number} x - Coordenada X en el canvas
     * @param {number} y - Coordenada Y en el canvas
     * @returns {Object|null} - La celda en esa posición o null si está fuera del laberinto
     */
    getCellFromCoordinates(x, y) {
        // Calcular el desplazamiento para centrar el laberinto
        const offsetX = (this.canvas.width - this.size * this.cellSize) / 2;
        const offsetY = (this.canvas.height - this.size * this.cellSize) / 2;
        
        // Calcular la fila y columna
        const col = Math.floor((x - offsetX) / this.cellSize);
        const row = Math.floor((y - offsetY) / this.cellSize);
        
        // Verificar si está dentro de los límites
        if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
            return this.grid[row][col];
        }
        
        return null;
    }
    
    /**
     * Establece o quita una pared en una celda
     * @param {number} row - Fila de la celda
     * @param {number} col - Columna de la celda
     * @param {boolean} isWall - Si debe ser pared (true) o no (false)
     */
    setWall(row, col, isWall) {
        const cell = this.grid[row][col];
        
        // No permitir establecer paredes en celdas de inicio o fin
        if (cell.isStart || cell.isEnd) return;
        
        cell.isWall = isWall;
    }
    
    /**
     * Establece la celda de inicio
     * @param {number} row - Fila de la celda
     * @param {number} col - Columna de la celda
     */
    setStart(row, col) {
        // Quitar el estado de inicio de la celda anterior
        if (this.startCell) {
            this.startCell.isStart = false;
        }
        
        const cell = this.grid[row][col];
        
        // No permitir establecer inicio en una pared o en la meta
        if (cell.isWall || cell.isEnd) return;
        
        cell.isStart = true;
        this.startCell = cell;
    }
    
    /**
     * Establece la celda de fin
     * @param {number} row - Fila de la celda
     * @param {number} col - Columna de la celda
     */
    setEnd(row, col) {
        // Quitar el estado de fin de la celda anterior
        if (this.endCell) {
            this.endCell.isEnd = false;
        }
        
        const cell = this.grid[row][col];
        
        // No permitir establecer fin en una pared o en el inicio
        if (cell.isWall || cell.isStart) return;
        
        cell.isEnd = true;
        this.endCell = cell;
    }
    
    /**
     * Verifica si hay celdas de inicio y fin establecidas
     * @returns {boolean} - true si ambas celdas están establecidas
     */
    hasStartAndEnd() {
        return this.startCell && this.endCell;
    }
    
    /**
     * Marca una celda como visitada durante la resolución
     * @param {number} row - Fila de la celda
     * @param {number} col - Columna de la celda
     */
    markVisited(row, col) {
        const cell = this.grid[row][col];
        
        // No marcar paredes, inicio o fin como visitadas
        if (cell.isWall || cell.isStart || cell.isEnd) return;
        
        cell.isVisited = true;
        cell.isFrontier = false;
    }
    
    /**
     * Marca una celda como frontera durante la resolución
     * @param {number} row - Fila de la celda
     * @param {number} col - Columna de la celda
     */
    markFrontier(row, col) {
        const cell = this.grid[row][col];
        
        // No marcar paredes, inicio o fin como frontera
        if (cell.isWall || cell.isStart || cell.isEnd) return;
        
        cell.isFrontier = true;
    }
    
    /**
     * Marca una celda como parte del camino solución
     * @param {number} row - Fila de la celda
     * @param {number} col - Columna de la celda
     */
    markPath(row, col) {
        const cell = this.grid[row][col];
        
        // No marcar paredes, inicio o fin como parte del camino
        if (cell.isWall || cell.isStart || cell.isEnd) return;
        
        cell.isPath = true;
    }
    
    /**
     * Reinicia las marcas de visitado, frontera y camino
     */
    resetVisited() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.grid[row][col];
                cell.isVisited = false;
                cell.isFrontier = false;
                cell.isPath = false;
                cell.distance = Infinity;
                cell.parent = null;
            }
        }
    }
    
    /**
     * Obtiene las celdas vecinas de una celda dada
     * @param {number} row - Fila de la celda
     * @param {number} col - Columna de la celda
     * @param {boolean} includeDiagonals - Si se deben incluir vecinos diagonales
     * @returns {Array} - Array de celdas vecinas
     */
    getNeighbors(row, col, includeDiagonals = false) {
        const neighbors = [];
        const directions = [
            [-1, 0],  // Arriba
            [1, 0],   // Abajo
            [0, -1],  // Izquierda
            [0, 1]    // Derecha
        ];
        
        if (includeDiagonals) {
            directions.push(
                [-1, -1],  // Arriba-izquierda
                [-1, 1],   // Arriba-derecha
                [1, -1],   // Abajo-izquierda
                [1, 1]     // Abajo-derecha
            );
        }
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            // Verificar si está dentro de los límites
            if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
                neighbors.push(this.grid[newRow][newCol]);
            }
        }
        
        return neighbors;
    }
    
    /**
     * Verifica si existe un camino entre el inicio y el fin
     * @returns {boolean} - true si existe un camino, false en caso contrario
     */
    hasValidPath() {
        if (!this.startCell || !this.endCell) {
            return false;
        }
        
        // Usamos BFS para verificar la conectividad
        const visited = Array(this.size).fill().map(() => Array(this.size).fill(false));
        const queue = [this.startCell];
        visited[this.startCell.row][this.startCell.col] = true;
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Si llegamos al final, hay un camino
            if (current === this.endCell) {
                return true;
            }
            
            // Explorar vecinos
            const neighbors = this.getNeighbors(current.row, current.col);
            for (const neighbor of neighbors) {
                if (!neighbor.isWall && !visited[neighbor.row][neighbor.col]) {
                    visited[neighbor.row][neighbor.col] = true;
                    queue.push(neighbor);
                }
            }
        }
        
        // Si terminamos el BFS sin encontrar el final, no hay camino
        return false;
    }
    
    /**
     * Exporta el estado actual del laberinto a un objeto
     * @returns {Object} - Objeto con los datos del laberinto
     */
    export() {
        const walls = [];
        let start = null;
        let end = null;
        
        // Recopilar datos de paredes, inicio y fin
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.grid[row][col];
                
                if (cell.isWall) {
                    walls.push([row, col]);
                }
                
                if (cell.isStart) {
                    start = [row, col];
                }
                
                if (cell.isEnd) {
                    end = [row, col];
                }
            }
        }
        
        return {
            size: this.size,
            walls,
            start,
            end
        };
    }
    
    /**
     * Importa un laberinto desde un objeto
     * @param {Object} data - Objeto con los datos del laberinto
     */
    import(data) {
        // Verificar que los datos son válidos
        if (!data || !data.size || !Array.isArray(data.walls) || 
            !Array.isArray(data.start) || !Array.isArray(data.end)) {
            throw new Error('Formato de datos inválido');
        }
        
        // Reiniciar el laberinto
        this.size = data.size;
        this.initialize();
        
        // Establecer paredes
        for (const [row, col] of data.walls) {
            if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
                this.setWall(row, col, true);
            }
        }
        
        // Establecer inicio y fin
        const [startRow, startCol] = data.start;
        const [endRow, endCol] = data.end;
        
        if (startRow >= 0 && startRow < this.size && startCol >= 0 && startCol < this.size) {
            this.setStart(startRow, startCol);
        }
        
        if (endRow >= 0 && endRow < this.size && endCol >= 0 && endCol < this.size) {
            this.setEnd(endRow, endCol);
        }
    }
}
