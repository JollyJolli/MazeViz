/**
 * wall-follower.js - Implementación del algoritmo Wall Follower para resolver laberintos
 * 
 * El algoritmo Wall Follower (o regla de la mano derecha/izquierda) consiste en mantener
 * una mano en la pared y seguir el camino. Funciona bien en laberintos simplemente conectados
 * (sin islas), pero puede fallar en laberintos más complejos.
 */

class WallFollowerSolver {
    /**
     * Constructor para el solucionador Wall Follower
     * @param {Maze} maze - Instancia del laberinto a resolver
     */
    constructor(maze) {
        this.maze = maze;
        this.visitedCount = 0;
        this.pathLength = 0;
        this.isSolving = false;
        this.animationSpeed = 100 - appState.animationSpeed + 1; // Invertir para que mayor valor = mayor velocidad
    }
    
    /**
     * Resuelve el laberinto usando Wall Follower (regla de la mano derecha)
     * @param {Function} callback - Función a llamar cuando se complete la resolución
     */
    solve(callback) {
        if (!this.maze.hasStartAndEnd()) {
            alert('El laberinto debe tener un punto de inicio y un punto final.');
            callback(0, 0);
            return;
        }
        
        this.isSolving = true;
        this.visitedCount = 0;
        this.pathLength = 0;
        
        // Posición actual (comenzar en la celda de inicio)
        let current = this.maze.startCell;
        
        // Dirección actual (0: arriba, 1: derecha, 2: abajo, 3: izquierda)
        let direction = 1; // Comenzar mirando hacia la derecha
        
        // Camino recorrido
        const path = [];
        
        // Mapa para rastrear celdas visitadas
        const visitedMap = new Map();
        
        // Función para procesar un paso
        const processStep = () => {
            if (!this.isSolving) {
                callback(this.visitedCount, this.pathLength);
                return;
            }
            
            // Si hemos llegado a la meta
            if (current === this.maze.endCell) {
                this.pathLength = path.length;
                
                // Marcar el camino
                for (const cell of path) {
                    this.maze.markPath(cell.row, cell.col);
                }
                
                this.maze.draw();
                this.isSolving = false;
                callback(this.visitedCount, this.pathLength);
                return;
            }
            
            // Marcar como visitada
            if (!visitedMap.has(current)) {
                this.maze.markVisited(current.row, current.col);
                visitedMap.set(current, true);
                this.visitedCount++;
                
                // Añadir al camino
                path.push(current);
            }
            
            // Intentar girar a la derecha (relativo a la dirección actual)
            const rightDirection = (direction + 1) % 4;
            const rightCell = this.getCellInDirection(current, rightDirection);
            
            // Si podemos girar a la derecha (no hay pared)
            if (rightCell && !rightCell.isWall) {
                direction = rightDirection;
                current = rightCell;
                
                // Dibujar el laberinto actualizado
                this.maze.markFrontier(current.row, current.col);
                this.maze.draw();
                
                // Procesar el siguiente paso después de un retraso
                setTimeout(processStep, this.animationSpeed);
                return;
            }
            
            // Intentar seguir recto
            const straightCell = this.getCellInDirection(current, direction);
            
            // Si podemos seguir recto (no hay pared)
            if (straightCell && !straightCell.isWall) {
                current = straightCell;
                
                // Dibujar el laberinto actualizado
                this.maze.markFrontier(current.row, current.col);
                this.maze.draw();
                
                // Procesar el siguiente paso después de un retraso
                setTimeout(processStep, this.animationSpeed);
                return;
            }
            
            // Intentar girar a la izquierda
            const leftDirection = (direction + 3) % 4;
            const leftCell = this.getCellInDirection(current, leftDirection);
            
            // Si podemos girar a la izquierda (no hay pared)
            if (leftCell && !leftCell.isWall) {
                direction = leftDirection;
                current = leftCell;
                
                // Dibujar el laberinto actualizado
                this.maze.markFrontier(current.row, current.col);
                this.maze.draw();
                
                // Procesar el siguiente paso después de un retraso
                setTimeout(processStep, this.animationSpeed);
                return;
            }
            
            // Si no podemos avanzar en ninguna dirección, dar la vuelta
            direction = (direction + 2) % 4;
            
            // Dibujar el laberinto actualizado
            this.maze.draw();
            
            // Procesar el siguiente paso después de un retraso
            setTimeout(processStep, this.animationSpeed);
        };
        
        // Iniciar el procesamiento
        processStep();
    }
    
    /**
     * Obtiene la celda en la dirección especificada
     * @param {Object} cell - Celda actual
     * @param {number} direction - Dirección (0: arriba, 1: derecha, 2: abajo, 3: izquierda)
     * @returns {Object|null} - Celda en la dirección especificada o null si está fuera de los límites
     */
    getCellInDirection(cell, direction) {
        let newRow = cell.row;
        let newCol = cell.col;
        
        switch (direction) {
            case 0: // Arriba
                newRow--;
                break;
            case 1: // Derecha
                newCol++;
                break;
            case 2: // Abajo
                newRow++;
                break;
            case 3: // Izquierda
                newCol--;
                break;
        }
        
        // Verificar si está dentro de los límites
        if (newRow >= 0 && newRow < this.maze.size && newCol >= 0 && newCol < this.maze.size) {
            return this.maze.grid[newRow][newCol];
        }
        
        return null;
    }
}
