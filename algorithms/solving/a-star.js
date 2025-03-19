/**
 * a-star.js - Implementación del algoritmo A* para resolver laberintos
 * 
 * A* es un algoritmo de búsqueda informada que encuentra el camino de menor costo
 * desde un nodo inicial hasta un nodo objetivo utilizando una heurística para guiar la búsqueda.
 */

class AStarSolver {
    /**
     * Constructor para el solucionador A*
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
     * Resuelve el laberinto usando A*
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
        
        // Cola de prioridad para A*
        const openSet = new PriorityQueue();
        
        // Conjunto de nodos visitados
        const closedSet = new Set();
        
        // Mapa para rastrear el camino
        const parentMap = new Map();
        
        // Mapa de costos g (costo desde el inicio hasta el nodo)
        const gScore = new Map();
        gScore.set(this.maze.startCell, 0);
        
        // Mapa de costos f (costo estimado total)
        const fScore = new Map();
        fScore.set(this.maze.startCell, this.heuristic(this.maze.startCell, this.maze.endCell));
        
        // Añadir el nodo inicial a la cola de prioridad
        openSet.enqueue(this.maze.startCell, fScore.get(this.maze.startCell));
        
        // Función para procesar una celda
        const processCell = () => {
            if (!this.isSolving || openSet.isEmpty()) {
                this.isSolving = false;
                callback(this.visitedCount, this.pathLength);
                return;
            }
            
            // Obtener el nodo con menor costo f
            const current = openSet.dequeue();
            
            // Si es la meta, reconstruir y mostrar el camino
            if (current === this.maze.endCell) {
                this.reconstructPath(parentMap, this.maze.endCell, () => {
                    this.isSolving = false;
                    callback(this.visitedCount, this.pathLength);
                });
                return;
            }
            
            // Añadir al conjunto cerrado
            closedSet.add(current);
            
            // Marcar como visitada
            this.maze.markVisited(current.row, current.col);
            this.visitedCount++;
            
            // Obtener vecinos
            const neighbors = this.maze.getNeighbors(current.row, current.col)
                .filter(cell => !cell.isWall && !closedSet.has(cell));
            
            // Procesar vecinos
            for (const neighbor of neighbors) {
                // Calcular el costo g tentativo
                const tentativeGScore = gScore.get(current) + 1;
                
                // Si el vecino no está en el conjunto abierto o el nuevo costo g es mejor
                if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
                    // Actualizar el padre
                    parentMap.set(neighbor, current);
                    
                    // Actualizar costos
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, this.maze.endCell));
                    
                    // Si no está en el conjunto abierto, añadirlo
                    if (!openSet.contains(neighbor)) {
                        openSet.enqueue(neighbor, fScore.get(neighbor));
                        
                        // Marcar como frontera
                        this.maze.markFrontier(neighbor.row, neighbor.col);
                    }
                }
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
     * Calcula la heurística (distancia Manhattan) entre dos celdas
     * @param {Object} cell1 - Primera celda
     * @param {Object} cell2 - Segunda celda
     * @returns {number} - Valor de la heurística
     */
    heuristic(cell1, cell2) {
        return Math.abs(cell1.row - cell2.row) + Math.abs(cell1.col - cell2.col);
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

/**
 * Clase para implementar una cola de prioridad
 */
class PriorityQueue {
    constructor() {
        this.elements = [];
        this.elementSet = new Set();
    }
    
    /**
     * Añade un elemento a la cola con una prioridad dada
     * @param {*} element - Elemento a añadir
     * @param {number} priority - Prioridad del elemento
     */
    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elementSet.add(element);
        this.elements.sort((a, b) => a.priority - b.priority);
    }
    
    /**
     * Extrae el elemento con mayor prioridad (menor valor)
     * @returns {*} - Elemento extraído
     */
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        
        const { element } = this.elements.shift();
        this.elementSet.delete(element);
        return element;
    }
    
    /**
     * Verifica si la cola contiene un elemento
     * @param {*} element - Elemento a verificar
     * @returns {boolean} - true si el elemento está en la cola
     */
    contains(element) {
        return this.elementSet.has(element);
    }
    
    /**
     * Verifica si la cola está vacía
     * @returns {boolean} - true si la cola está vacía
     */
    isEmpty() {
        return this.elements.length === 0;
    }
}
