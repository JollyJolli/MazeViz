// Maze class for MazeViz

class Maze {
    constructor(canvas, rows, cols) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.cellSize = 0;
        this.startCell = null;
        this.endCell = null;
        this.visitedCells = [];
        this.path = [];
        
        // Resize the canvas based on the available space
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    // Initialize the maze grid
    initialize() {
        this.grid = [];
        this.visitedCells = [];
        this.path = [];
        this.startCell = null;
        this.endCell = null;
        
        // Create the grid with empty cells
        for (let row = 0; row < this.rows; row++) {
            const rowArray = [];
            for (let col = 0; col < this.cols; col++) {
                rowArray.push({
                    row,
                    col,
                    type: 'empty',
                    visited: false,
                    inPath: false,
                    distance: Infinity,
                    fScore: Infinity,
                    gScore: Infinity,
                    parent: null
                });
            }
            this.grid.push(rowArray);
        }
    }
    
    // Resize the canvas to fit the container
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = window.innerHeight * 0.6; // Use 60% of viewport height as max
        
        // Calculate the cell size based on the container dimensions and grid size
        const cellSizeByWidth = Math.floor((containerWidth - 40) / this.cols);
        const cellSizeByHeight = Math.floor((containerHeight - 40) / this.rows);
        this.cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);
        
        // Set canvas dimensions
        this.canvas.width = this.cellSize * this.cols;
        this.canvas.height = this.cellSize * this.rows;
        
        // Redraw the maze if it exists
        if (this.grid.length > 0) {
            this.draw();
        }
    }
    
    // Draw the maze on the canvas
    draw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw each cell
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                this.drawCell(cell);
            }
        }
    }
    
    // Draw a single cell
    drawCell(cell) {
        const { row, col, type, visited, inPath } = cell;
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        
        // Set the fill color based on cell properties
        if (inPath) {
            this.ctx.fillStyle = '#ffc107'; // Path color (amber)
        } else if (visited) {
            this.ctx.fillStyle = 'rgba(100, 149, 237, 0.3)'; // Visited color (light cornflower blue)
        } else if (type === 'wall') {
            this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        } else if (type === 'start') {
            this.ctx.fillStyle = '#4caf50'; // Start color (green)
        } else if (type === 'end') {
            this.ctx.fillStyle = '#f44336'; // End color (red)
        } else {
            this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--panel-background');
        }
        
        // Draw the cell
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // Draw the cell border
        this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
    }
    
    // Get the cell at the specified coordinates
    getCellFromCoordinates(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        
        return null;
    }
    
    // Set the cell type
    setCellType(row, col, type) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            // If setting a start or end point, clear the previous one
            if (type === 'start') {
                if (this.startCell) {
                    this.grid[this.startCell.row][this.startCell.col].type = 'empty';
                }
                this.startCell = { row, col };
            } else if (type === 'end') {
                if (this.endCell) {
                    this.grid[this.endCell.row][this.endCell.col].type = 'empty';
                }
                this.endCell = { row, col };
            }
            
            // Update the cell type
            this.grid[row][col].type = type;
            
            // If the cell was a start or end point and is now something else, update the reference
            if (this.startCell && this.startCell.row === row && this.startCell.col === col && type !== 'start') {
                this.startCell = null;
            }
            if (this.endCell && this.endCell.row === row && this.endCell.col === col && type !== 'end') {
                this.endCell = null;
            }
        }
    }
    
    // Set the start point
    setStart(row, col) {
        this.setCellType(row, col, 'start');
    }
    
    // Set the end point
    setEnd(row, col) {
        this.setCellType(row, col, 'end');
    }
    
    // Check if the maze has both start and end points
    hasStartAndEnd() {
        return this.startCell !== null && this.endCell !== null;
    }
    
    // Get the neighbors of a cell
    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [
            { row: -1, col: 0 }, // Up
            { row: 1, col: 0 },  // Down
            { row: 0, col: -1 }, // Left
            { row: 0, col: 1 }   // Right
        ];
        
        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            
            if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                const neighbor = this.grid[newRow][newCol];
                if (neighbor.type !== 'wall') {
                    neighbors.push(neighbor);
                }
            }
        }
        
        return neighbors;
    }
    
    // Update the visited cells during algorithm animation
    updateVisitedCells(visitedCells) {
        // Reset all cells' visited status
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].visited = false;
            }
        }
        
        // Mark the specified cells as visited
        for (const cell of visitedCells) {
            this.grid[cell.row][cell.col].visited = true;
        }
        
        this.visitedCells = visitedCells;
    }
    
    // Update the path during algorithm animation
    updatePath(path) {
        // Reset all cells' path status
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].inPath = false;
            }
        }
        
        // Mark the specified cells as part of the path
        for (const cell of path) {
            this.grid[cell.row][cell.col].inPath = true;
        }
        
        this.path = path;
    }
    
    // Reset the maze (clear all cells)
    clear() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].type = 'empty';
                this.grid[row][col].visited = false;
                this.grid[row][col].inPath = false;
            }
        }
        
        this.startCell = null;
        this.endCell = null;
        this.visitedCells = [];
        this.path = [];
    }
    
    // Reset the path (keep walls, start, and end points)
    resetPath() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].visited = false;
                this.grid[row][col].inPath = false;
                this.grid[row][col].distance = Infinity;
                this.grid[row][col].fScore = Infinity;
                this.grid[row][col].gScore = Infinity;
                this.grid[row][col].parent = null;
            }
        }
        
        this.visitedCells = [];
        this.path = [];
    }
    
    // Reset the maze (keep only walls)
    reset() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].type !== 'wall') {
                    this.grid[row][col].type = 'empty';
                }
                this.grid[row][col].visited = false;
                this.grid[row][col].inPath = false;
                this.grid[row][col].distance = Infinity;
                this.grid[row][col].fScore = Infinity;
                this.grid[row][col].gScore = Infinity;
                this.grid[row][col].parent = null;
            }
        }
        
        this.startCell = null;
        this.endCell = null;
        this.visitedCells = [];
        this.path = [];
    }
    
    // Serialize the maze to JSON
    serialize() {
        const cells = [];
        
        // Save only non-empty cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.type !== 'empty') {
                    cells.push({
                        row: cell.row,
                        col: cell.col,
                        type: cell.type
                    });
                }
            }
        }
        
        return {
            rows: this.rows,
            cols: this.cols,
            cells: cells
        };
    }
    
    // Deserialize the maze from JSON
    deserialize(data) {
        // Create a new grid with the specified dimensions
        this.rows = data.rows;
        this.cols = data.cols;
        this.initialize();
        
        // Set the cell types
        for (const cell of data.cells) {
            this.setCellType(cell.row, cell.col, cell.type);
        }
        
        // Resize the canvas to fit the new grid
        this.resizeCanvas();
    }
}