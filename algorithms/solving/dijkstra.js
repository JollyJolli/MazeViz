/**
 * dijkstra.js - Implementación del algoritmo de Dijkstra para resolver laberintos
 * 
 * El algoritmo de Dijkstra encuentra el camino más corto entre un nodo inicial
 * y todos los demás nodos en un grafo ponderado.
 */

class DijkstraSolver {
    /**
     * Constructor para el solucionador Dijkstra
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
     * Resuelve el laberinto usando Dijkstra
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
        
        // Cola de prioridad para Dijkstra
        const queue = new PriorityQueue();
        
        // Mapa para rastrear el camino
        const parentMap = new Map();
        
        // Mapa de distancias
        const distances = new Map();
        
        // Inicializar distancias
        for (let row = 0; row < this.maze.size; row++) {
            for (let col = 0; col < this.maze.size; col++) {
                const cell = this.maze.grid[row][col];
                distances.set(cell, Infinity);
            }
        }
        
        // Establecer la distancia del nodo inicial a 0
        distances.set(this.maze.startCell, 0);
        
        // Añadir el nodo inicial a la cola de prioridad
        queue.enqueue(this.maze.startCell, 0);
        
        // Función para procesar una celda
        const processCell = () => {
            if (!this.isSolving || queue.isEmpty()) {
                this.isSolving = false;
                callback(this.visitedCount, this.pathLength);
                return;
            }
            
            // Obtener el nodo con menor distancia
            const current = queue.dequeue();
            
            // Si ya procesamos este nodo con una distancia menor, saltar
            if (current.isVisited) {
                setTimeout(processCell, 0);
                return;
            }
            
            // Marcar como visitada
            this.maze.markVisited(current.row, current.col);
            current.isVisited = true;
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
            
            // Procesar vecinos
            for (const neighbor of neighbors) {
                // Calcular nueva distancia
                const newDistance = distances.get(current) + 1;
                
                // Si encontramos un camino más corto
                if (newDistance < distances.get(neighbor)) {
                    // Actualizar distancia
                    distances.set(neighbor, newDistance);
                    
                    // Actualizar padre
                    parentMap.set(neighbor, current);
                    
                    // Añadir a la cola de prioridad
                    queue.enqueue(neighbor, newDistance);
                    
                    // Marcar como frontera
                    this.maze.markFrontier(neighbor.row, neighbor.col);
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
 * (Reutilizamos la implementación de A* si ya existe, de lo contrario la definimos aquí)
 */
if (typeof PriorityQueue === 'undefined') {
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
}
