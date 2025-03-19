/**
 * main.js - Archivo principal para MazeViz
 * Maneja la inicialización de la aplicación y la interacción del usuario
 */

// Estado global de la aplicación
const appState = {
    currentTool: 'wall', // Herramienta activa: 'wall', 'erase', 'start', 'end'
    isDrawing: false,    // Si el usuario está dibujando actualmente
    isSolving: false,    // Si un algoritmo está ejecutándose
    animationSpeed: 50,  // Velocidad de animación (1-100)
    darkMode: false      // Estado del modo oscuro
};

// Referencias a elementos DOM
const elements = {
    mazeCanvas: document.getElementById('maze-canvas'),
    mazeSize: document.getElementById('maze-size'),
    genAlgorithm: document.getElementById('generation-algorithm'),
    solveAlgorithm: document.getElementById('solving-algorithm'),
    animationSpeed: document.getElementById('animation-speed'),
    generateBtn: document.getElementById('generate-maze'),
    clearBtn: document.getElementById('clear-maze'),
    solveBtn: document.getElementById('solve-maze'),
    stopBtn: document.getElementById('stop-solving'),
    exportBtn: document.getElementById('export-maze'),
    importBtn: document.getElementById('import-maze'),
    importFile: document.getElementById('import-file'),
    themeSwitch: document.getElementById('theme-switch'),
    toolButtons: document.querySelectorAll('.tool-btn'),
    visitedNodes: document.getElementById('visited-nodes'),
    pathLength: document.getElementById('path-length'),
    solvingTime: document.getElementById('solving-time')
};

// Instancia del laberinto
let maze;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    setupEventListeners();
    initMaze();
});

/**
 * Inicializa el canvas para dibujar el laberinto
 */
function initCanvas() {
    const ctx = elements.mazeCanvas.getContext('2d');
    
    // Ajustar el tamaño del canvas para que se adapte al contenedor
    function resizeCanvas() {
        const container = elements.mazeCanvas.parentElement;
        const containerStyle = window.getComputedStyle(container);
        const width = parseInt(containerStyle.width) - 20; // Margen para evitar scroll
        const height = parseInt(containerStyle.height) - 20;
        
        elements.mazeCanvas.width = width;
        elements.mazeCanvas.height = height;
        
        // Si ya existe un laberinto, redibujarlo
        if (maze) {
            maze.draw();
        }
    }
    
    // Ajustar el canvas inicialmente y cuando cambie el tamaño de la ventana
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

/**
 * Configura todos los event listeners para la interacción del usuario
 */
function setupEventListeners() {
    // Eventos para herramientas de dibujo
    elements.toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todos los botones
            elements.toolButtons.forEach(btn => btn.classList.remove('active'));
            
            // Activar el botón seleccionado
            button.classList.add('active');
            
            // Actualizar la herramienta actual
            if (button.id === 'draw-wall') appState.currentTool = 'wall';
            if (button.id === 'erase-wall') appState.currentTool = 'erase';
            if (button.id === 'set-start') appState.currentTool = 'start';
            if (button.id === 'set-end') appState.currentTool = 'end';
        });
    });
    
    // Eventos del canvas para dibujar
    elements.mazeCanvas.addEventListener('mousedown', handleCanvasMouseDown);
    elements.mazeCanvas.addEventListener('mousemove', handleCanvasMouseMove);
    elements.mazeCanvas.addEventListener('mouseup', () => { appState.isDrawing = false; });
    elements.mazeCanvas.addEventListener('mouseleave', () => { appState.isDrawing = false; });
    
    // Eventos para botones de control
    elements.generateBtn.addEventListener('click', generateMaze);
    elements.clearBtn.addEventListener('click', clearMaze);
    elements.solveBtn.addEventListener('click', solveMaze);
    elements.stopBtn.addEventListener('click', stopSolving);
    elements.exportBtn.addEventListener('click', exportMaze);
    elements.importBtn.addEventListener('click', importMaze);
    
    // Evento para cambio de velocidad de animación
    elements.animationSpeed.addEventListener('input', (e) => {
        appState.animationSpeed = parseInt(e.target.value);
    });
    
    // Evento para cambio de tema
    elements.themeSwitch.addEventListener('change', toggleDarkMode);
    
    // Evento para cambio de tamaño del laberinto
    elements.mazeSize.addEventListener('change', () => {
        if (confirm('Cambiar el tamaño reiniciará el laberinto. ¿Continuar?')) {
            initMaze();
        } else {
            // Restaurar el valor anterior
            elements.mazeSize.value = maze.size;
        }
    });
}

/**
 * Inicializa un nuevo laberinto
 */
function initMaze() {
    const size = parseInt(elements.mazeSize.value);
    maze = new Maze(elements.mazeCanvas, size);
    maze.initialize();
    maze.draw();
    
    // Reiniciar estadísticas
    updateStats(0, 0, 0);
}

/**
 * Maneja el evento mousedown en el canvas
 */
function handleCanvasMouseDown(e) {
    if (appState.isSolving) return;
    
    appState.isDrawing = true;
    const rect = elements.mazeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Aplicar la herramienta actual en la celda seleccionada
    applyTool(x, y);
}

/**
 * Maneja el evento mousemove en el canvas
 */
function handleCanvasMouseMove(e) {
    if (!appState.isDrawing || appState.isSolving) return;
    
    const rect = elements.mazeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Solo aplicar la herramienta para paredes y borrador durante el arrastre
    if (appState.currentTool === 'wall' || appState.currentTool === 'erase') {
        applyTool(x, y);
    }
}

/**
 * Aplica la herramienta actual en las coordenadas dadas
 */
function applyTool(x, y) {
    const cell = maze.getCellFromCoordinates(x, y);
    if (!cell) return;
    
    switch (appState.currentTool) {
        case 'wall':
            maze.setWall(cell.row, cell.col, true);
            break;
        case 'erase':
            maze.setWall(cell.row, cell.col, false);
            break;
        case 'start':
            maze.setStart(cell.row, cell.col);
            break;
        case 'end':
            maze.setEnd(cell.row, cell.col);
            break;
    }
    
    maze.draw();
}

/**
 * Genera un laberinto aleatorio usando el algoritmo seleccionado
 */
function generateMaze() {
    if (appState.isSolving) return;
    
    const algorithm = elements.genAlgorithm.value;
    clearMaze();
    
    // Generar el laberinto
    switch (algorithm) {
        case 'prim':
            generateMazeWithPrim(maze);
            break;
        case 'kruskal':
            generateMazeWithKruskal(maze);
            break;
        case 'dfs':
            generateMazeWithDFS(maze);
            break;
        case 'backtracking':
            generateMazeWithBacktracking(maze);
            break;
    }
    
    // Verificar si hay un camino válido entre el inicio y el fin
    if (!maze.hasValidPath()) {
        // Si no hay camino válido, crear uno
        createPathBetweenStartAndEnd();
    }
    
    // Redibujar el laberinto
    maze.draw();
}

/**
 * Crea un camino directo entre el inicio y el fin si no existe uno
 */
function createPathBetweenStartAndEnd() {
    if (!maze.startCell || !maze.endCell) return;
    
    // Implementamos un algoritmo simple para crear un camino
    // Primero nos movemos horizontalmente y luego verticalmente
    let currentRow = maze.startCell.row;
    let currentCol = maze.startCell.col;
    const endRow = maze.endCell.row;
    const endCol = maze.endCell.col;
    
    // Mover horizontalmente
    while (currentCol !== endCol) {
        if (currentCol < endCol) {
            currentCol++;
        } else {
            currentCol--;
        }
        
        // Eliminar cualquier pared en el camino
        maze.setWall(currentRow, currentCol, false);
    }
    
    // Mover verticalmente
    while (currentRow !== endRow) {
        if (currentRow < endRow) {
            currentRow++;
        } else {
            currentRow--;
        }
        
        // Eliminar cualquier pared en el camino
        maze.setWall(currentRow, currentCol, false);
    }
}

/**
 * Limpia el laberinto actual
 */
function clearMaze() {
    if (appState.isSolving) return;
    
    initMaze();
}

/**
 * Resuelve el laberinto usando el algoritmo seleccionado
 */
function solveMaze() {
    if (appState.isSolving) return;
    if (!maze.hasStartAndEnd()) {
        alert('Por favor, establece un punto de inicio y un punto final antes de resolver.');
        return;
    }
    
    // Verificar si hay un camino válido entre inicio y fin
    if (!maze.hasValidPath()) {
        // Si no hay camino válido, crear uno
        createPathBetweenStartAndEnd();
        alert('Se ha creado un camino entre el inicio y el fin porque no existía uno válido.');
        maze.draw();
    }
    
    appState.isSolving = true;
    elements.solveBtn.disabled = true;
    elements.generateBtn.disabled = true;
    elements.clearBtn.disabled = true;
    
    const algorithm = elements.solveAlgorithm.value;
    const startTime = performance.now();
    
    // Limpiar solución anterior
    maze.resetVisited();
    maze.draw();
    
    let solver;
    switch (algorithm) {
        case 'dfs':
            solver = new DFSSolver(maze);
            break;
        case 'bfs':
            solver = new BFSSolver(maze);
            break;
        case 'astar':
            solver = new AStarSolver(maze);
            break;
        case 'dijkstra':
            solver = new DijkstraSolver(maze);
            break;
        case 'wall-follower':
            solver = new WallFollowerSolver(maze);
            break;
    }
    
    solver.solve((visitedCount, pathLength) => {
        const endTime = performance.now();
        const timeElapsed = endTime - startTime;
        
        updateStats(visitedCount, pathLength, timeElapsed);
        
        appState.isSolving = false;
        elements.solveBtn.disabled = false;
        elements.generateBtn.disabled = false;
        elements.clearBtn.disabled = false;
    });
}

/**
 * Detiene la ejecución del algoritmo de resolución
 */
function stopSolving() {
    if (!appState.isSolving) return;
    
    // La implementación depende de cómo se manejen las animaciones
    // en los algoritmos de resolución
    appState.isSolving = false;
    elements.solveBtn.disabled = false;
    elements.generateBtn.disabled = false;
    elements.clearBtn.disabled = false;
    
    // Reiniciar estadísticas
    updateStats(0, 0, 0);
}

/**
 * Actualiza las estadísticas mostradas
 */
function updateStats(visitedCount, pathLength, timeElapsed) {
    elements.visitedNodes.textContent = visitedCount;
    elements.pathLength.textContent = pathLength;
    elements.solvingTime.textContent = `${timeElapsed.toFixed(2)} ms`;
}

/**
 * Exporta el laberinto actual a un archivo JSON
 */
function exportMaze() {
    if (!maze) return;
    
    const mazeData = maze.export();
    const dataStr = JSON.stringify(mazeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `maze_${maze.size}x${maze.size}_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
}

/**
 * Importa un laberinto desde un archivo JSON
 */
function importMaze() {
    const fileInput = elements.importFile;
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, selecciona un archivo para importar.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const mazeData = JSON.parse(e.target.result);
            maze.import(mazeData);
            elements.mazeSize.value = maze.size;
            maze.draw();
        } catch (error) {
            alert('Error al importar el laberinto: ' + error.message);
        }
    };
    reader.readAsText(file);
}

/**
 * Alterna entre modo claro y oscuro
 */
function toggleDarkMode() {
    appState.darkMode = elements.themeSwitch.checked;
    
    if (appState.darkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Redibujar el laberinto con los nuevos colores
    if (maze) {
        maze.draw();
    }
}
