// Main JavaScript file for MazeViz

// DOM Elements
const themeSwitch = document.getElementById('theme-switch');
const mazeCanvas = document.getElementById('maze-canvas');
const generateMazeBtn = document.getElementById('generate-maze');
const clearMazeBtn = document.getElementById('clear-maze');
const resetMazeBtn = document.getElementById('reset-maze');
const solveMazeBtn = document.getElementById('solve-maze');
const mazeSizeSelect = document.getElementById('maze-size');
const generationAlgorithmSelect = document.getElementById('generation-algorithm');
const algorithmSelect = document.getElementById('algorithm-select');
const animationSpeedInput = document.getElementById('animation-speed');
const exportMazeBtn = document.getElementById('export-maze');
const importMazeBtn = document.getElementById('import-maze');
const importFileInput = document.getElementById('import-file');
const algorithmDescription = document.getElementById('algorithm-description');
const cellsVisitedSpan = document.getElementById('cells-visited');
const pathLengthSpan = document.getElementById('path-length');
const timeTakenSpan = document.getElementById('time-taken');

// Drawing tool buttons
const drawWallBtn = document.getElementById('draw-wall');
const drawStartBtn = document.getElementById('draw-start');
const drawEndBtn = document.getElementById('draw-end');
const eraseBtn = document.getElementById('erase');
const toolButtons = [drawWallBtn, drawStartBtn, drawEndBtn, eraseBtn];

// Global variables
let maze;
let currentTool = 'wall';
let isDrawing = false;
let animationSpeed = 50;
let isSolving = false;

// Algorithm descriptions
const algorithmDescriptions = {
    dfs: "Depth-First Search explores as far as possible along each branch before backtracking. It's memory-efficient but doesn't guarantee the shortest path.",
    bfs: "Breadth-First Search explores all neighbor nodes at the present depth before moving to nodes at the next depth level. It guarantees the shortest path in unweighted graphs.",
    astar: "A* (A-Star) combines the advantages of Dijkstra's Algorithm and Greedy Best-First-Search using heuristics to find the shortest path more efficiently.",
    dijkstra: "Dijkstra's Algorithm finds the shortest path by prioritizing nodes with the smallest known distance from the start. It's optimal for weighted graphs.",
    'wall-follower': "Wall Follower is a simple algorithm that follows walls by keeping one hand (left or right) in contact with a wall. It can solve any maze that doesn't have detached walls."
};

// Initialize the application
function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize the maze
    const size = parseInt(mazeSizeSelect.value);
    maze = new Maze(mazeCanvas, size, size);
    maze.initialize();
    maze.draw();
    
    // Update algorithm description
    updateAlgorithmDescription();
    
    // Check for saved theme preference
    loadThemePreference();
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    themeSwitch.addEventListener('change', toggleTheme);
    
    // Maze generation and control
    generateMazeBtn.addEventListener('click', generateMaze);
    clearMazeBtn.addEventListener('click', clearMaze);
    resetMazeBtn.addEventListener('click', resetMaze);
    mazeSizeSelect.addEventListener('change', changeMazeSize);
    
    // Solving
    solveMazeBtn.addEventListener('click', solveMaze);
    algorithmSelect.addEventListener('change', updateAlgorithmDescription);
    animationSpeedInput.addEventListener('input', updateAnimationSpeed);
    
    // Import/Export
    exportMazeBtn.addEventListener('click', exportMaze);
    importMazeBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importMaze);
    
    // Drawing tools
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => setActiveTool(btn.id));
    });
    
    // Canvas drawing events
    mazeCanvas.addEventListener('mousedown', startDrawing);
    mazeCanvas.addEventListener('mousemove', draw);
    mazeCanvas.addEventListener('mouseup', stopDrawing);
    mazeCanvas.addEventListener('mouseleave', stopDrawing);
}

// Toggle between light and dark theme
function toggleTheme() {
    if (themeSwitch.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme preference from localStorage
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        themeSwitch.checked = true;
        document.body.classList.add('dark-theme');
    }
}

// Generate a random maze using the selected algorithm
function generateMaze() {
    if (isSolving) return;
    
    const size = parseInt(mazeSizeSelect.value);
    const algorithm = generationAlgorithmSelect.value;
    
    // Reset the maze
    maze.reset();
    
    // Generate the maze using the selected algorithm
    if (algorithm === 'prim') {
        generateMazeWithPrim(maze);
    } else if (algorithm === 'kruskal') {
        generateMazeWithKruskal(maze);
    }
    
    // Redraw the maze
    maze.draw();
    
    // Reset stats
    resetStats();
}

// Clear the maze (remove all walls, start, and end points)
function clearMaze() {
    if (isSolving) return;
    
    maze.clear();
    maze.draw();
    resetStats();
}

// Reset the maze path (keep walls, start, and end points)
function resetMaze() {
    if (isSolving) return;
    
    maze.resetPath();
    maze.draw();
    resetStats();
}

// Change the maze size
function changeMazeSize() {
    if (isSolving) return;
    
    const size = parseInt(mazeSizeSelect.value);
    maze = new Maze(mazeCanvas, size, size);
    maze.initialize();
    maze.draw();
    resetStats();
}

// Solve the maze using the selected algorithm
function solveMaze() {
    if (isSolving || !maze.hasStartAndEnd()) {
        if (!maze.hasStartAndEnd()) {
            alert('Please set start and end points before solving.');
        }
        return;
    }
    
    // Reset the path
    maze.resetPath();
    
    // Get the selected algorithm
    const algorithm = algorithmSelect.value;
    
    // Start solving
    isSolving = true;
    solveMazeBtn.disabled = true;
    
    // Record start time
    const startTime = performance.now();
    
    // Call the appropriate solving function based on the selected algorithm
    let result;
    switch (algorithm) {
        case 'dfs':
            result = solveMazeWithDFS(maze, updateMazeDisplay);
            break;
        case 'bfs':
            result = solveMazeWithBFS(maze, updateMazeDisplay);
            break;
        case 'astar':
            result = solveMazeWithAStar(maze, updateMazeDisplay);
            break;
        case 'dijkstra':
            result = solveMazeWithDijkstra(maze, updateMazeDisplay);
            break;
        case 'wall-follower':
            result = solveMazeWithWallFollower(maze, updateMazeDisplay);
            break;
    }
    
    // When solving is complete
    result.then(({ path, visitedCells }) => {
        // Calculate time taken
        const endTime = performance.now();
        const timeTaken = Math.round(endTime - startTime);
        
        // Update stats
        updateStats(visitedCells.length, path ? path.length : 0, timeTaken);
        
        // Re-enable solve button
        isSolving = false;
        solveMazeBtn.disabled = false;
    });
}

// Update the maze display during algorithm animation
async function updateMazeDisplay(visitedCells, path) {
    // Update the maze with the current state
    maze.updateVisitedCells(visitedCells);
    if (path) maze.updatePath(path);
    
    // Draw the maze
    maze.draw();
    
    // Delay based on animation speed
    const delay = 101 - animationSpeed; // Invert the scale (1-100 -> 100-1)
    await new Promise(resolve => setTimeout(resolve, delay));
}

// Update the animation speed
function updateAnimationSpeed() {
    animationSpeed = parseInt(animationSpeedInput.value);
}

// Update the algorithm description
function updateAlgorithmDescription() {
    const algorithm = algorithmSelect.value;
    algorithmDescription.textContent = algorithmDescriptions[algorithm] || '';
}

// Update the stats display
function updateStats(cellsVisited, pathLength, timeTaken) {
    cellsVisitedSpan.textContent = cellsVisited;
    pathLengthSpan.textContent = pathLength;
    timeTakenSpan.textContent = timeTaken;
}

// Reset the stats display
function resetStats() {
    cellsVisitedSpan.textContent = '0';
    pathLengthSpan.textContent = '0';
    timeTakenSpan.textContent = '0';
}

// Set the active drawing tool
function setActiveTool(toolId) {
    // Remove active class from all tool buttons
    toolButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to the selected tool button
    document.getElementById(toolId).classList.add('active');
    
    // Set the current tool
    currentTool = toolId.replace('draw-', '').replace('erase', 'empty');
}

// Start drawing on the maze
function startDrawing(e) {
    if (isSolving) return;
    
    isDrawing = true;
    draw(e);
}

// Draw on the maze
function draw(e) {
    if (!isDrawing || isSolving) return;
    
    // Get the mouse position relative to the canvas
    const rect = mazeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to cell coordinates
    const cell = maze.getCellFromCoordinates(x, y);
    
    if (cell) {
        // Apply the current tool to the cell
        if (currentTool === 'start') {
            maze.setStart(cell.row, cell.col);
        } else if (currentTool === 'end') {
            maze.setEnd(cell.row, cell.col);
        } else {
            maze.setCellType(cell.row, cell.col, currentTool);
        }
        
        // Redraw the maze
        maze.draw();
        
        // Reset stats if we're modifying the maze
        resetStats();
    }
}

// Stop drawing on the maze
function stopDrawing() {
    isDrawing = false;
}

// Export the maze to a JSON file
function exportMaze() {
    const mazeData = maze.serialize();
    const dataStr = JSON.stringify(mazeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = 'maze-' + new Date().toISOString().slice(0, 10) + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
}

// Import a maze from a JSON file
function importMaze(e) {
    if (isSolving) return;
    
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const mazeData = JSON.parse(e.target.result);
            maze.deserialize(mazeData);
            maze.draw();
            resetStats();
        } catch (error) {
            alert('Error importing maze: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset the file input
    importFileInput.value = '';
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);