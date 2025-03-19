/**
 * depth-first.js - Implementación del algoritmo DFS para resolver laberintos
 * 
 * La búsqueda en profundidad (DFS) explora tan lejos como sea posible a lo largo
 * de cada rama antes de retroceder.
 */

class DFSSolver {
    /**
     * Constructor para el solucionador DFS
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
     * Resuelve el laberinto usando DFS
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
        
        // Pila para DFS
        const stack = [this.maze.startCell];
        
        // Mapa para rastrear el camino
        const parentMap = new Map();
        
        // Función para procesar una celda
        const processCell = () => {
            if (!this.isSolving || stack.length === 0) {
                this.isSolving = false;
                callback(this.visitedCount, this.pathLength);
                return;
            }
            
            // Obtener la celda actual
            const current = stack.pop();
            
            // Si ya visitamos esta celda, pasar a la siguiente
            if (current.isVisited) {
                setTimeout(processCell, 0);
                return;
            }
            
            // Marcar como visitada
            this.maze.markVisited(current.row, current.col);
            this.visitedCount++;
            
            // Si es la meta, reconstruir y mostrar el camino
            if (current === this.maze.endCell) {
                this.reconstructPath(parentMap, this.maze.endCell, () => {
                    this.isSolving = false;
                    callback(this.visitedCount, this.pathLength);
                });
                return;
            }
            
            // Obtener vecinos no visitados
            const neighbors = this.maze.getNeighbors(current.row, current.col)
                .filter(cell => !cell.isWall && !cell.isVisited);
            
            // Añadir vecinos a la pila
            for (const neighbor of neighbors) {
                stack.push(neighbor);
                
                // Solo establecer el padre si no tiene uno
                if (!parentMap.has(neighbor)) {
                    parentMap.set(neighbor, current);
                }
                
                // Marcar como frontera
                this.maze.markFrontier(neighbor.row, neighbor.col);
            }
            
            // Dibujar el laberinto actualizado
            this.maze.draw();
            
            // Procesar la siguiente celda después de un retraso
            setTimeout(processCell, this.animationSpeed);
        };
        
        // Iniciar el procesamiento
        processCell();
    }
    
    /**
     * Reconstruye el camino desde el inicio hasta el final
     * @param {Map} parentMap - Mapa de padres para reconstruir el camino
     * @param {Object} endCell - Celda final
     * @param {Function} callback - Función a llamar cuando se complete la reconstrucción
     */
    reconstructPath(parentMap, endCell, callback) {
        const path = [];
        let current = endCell;
        
        // Reconstruir el camino siguiendo los padres
        while (current !== this.maze.startCell && parentMap.has(current)) {
            path.push(current);
            current = parentMap.get(current);
        }
        
        // Invertir el camino para que vaya desde el inicio hasta el final
        path.reverse();
        
        // Establecer la longitud del camino
        this.pathLength = path.length;
        
        // Animar la visualización del camino
        const animatePath = (index) => {
            if (index >= path.length) {
                callback();
                return;
            }
            
            const cell = path[index];
            this.maze.markPath(cell.row, cell.col);
            this.maze.draw();
            
            setTimeout(() => animatePath(index + 1), this.animationSpeed / 2);
        };
        
        // Iniciar la animación
        animatePath(0);
    }
}
