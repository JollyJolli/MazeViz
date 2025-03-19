/**
 * breadth-first.js - Implementación del algoritmo BFS para resolver laberintos
 * 
 * La búsqueda en anchura (BFS) explora todos los nodos a una distancia d
 * del nodo inicial antes de explorar los nodos a una distancia d+1.
 * Garantiza encontrar el camino más corto en un grafo no ponderado.
 */

class BFSSolver {
    /**
     * Constructor para el solucionador BFS
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
     * Resuelve el laberinto usando BFS
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
        
        // Cola para BFS
        const queue = [this.maze.startCell];
        
        // Mapa para rastrear el camino
        const parentMap = new Map();
        
        // Marcar la celda inicial como visitada
        this.maze.markVisited(this.maze.startCell.row, this.maze.startCell.col);
        this.visitedCount++;
        
        // Función para procesar una celda
        const processCell = () => {
            if (!this.isSolving || queue.length === 0) {
                this.isSolving = false;
                callback(this.visitedCount, this.pathLength);
                return;
            }
            
            // Obtener la celda actual
            const current = queue.shift();
            
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
            
            // Procesar vecinos
            for (const neighbor of neighbors) {
                // Marcar como visitada
                this.maze.markVisited(neighbor.row, neighbor.col);
                this.visitedCount++;
                
                // Añadir a la cola
                queue.push(neighbor);
                
                // Establecer el padre
                parentMap.set(neighbor, current);
                
                // Marcar como frontera (para visualización)
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
