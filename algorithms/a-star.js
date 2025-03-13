// A* Algorithm for MazeViz

/**
 * Solves the maze using A* algorithm
 * @param {Maze} maze - The maze to solve
 * @param {Function} updateCallback - Callback function to update the display
 * @returns {Promise} - Promise that resolves when the algorithm completes
 */
async function solveMazeWithAStar(maze, updateCallback) {
    // Check if start and end points exist
    if (!maze.startCell || !maze.endCell) {
        return { path: null, visitedCells: [] };
    }
    
    // Initialize variables
    const visitedCells = [];
    const openSet = [];
    const closedSet = [];
    const startRow = maze.startCell.row;
    const startCol = maze.startCell.col;
    const endRow = maze.endCell.row;
    const endCol = maze.endCell.col;
    
    // Initialize the grid cells for pathfinding
    for (let row = 0; row < maze.rows; row++) {
        for (let col = 0; col < maze.cols; col++) {
            maze.grid[row][col].visited = false;
            maze.grid[row][col].parent = null;
            maze.grid[row][col].gScore = Infinity;
            maze.grid[row][col].fScore = Infinity;
        }
    }
    
    // Start with the start cell
    const startCell = maze.grid[startRow][startCol];
    startCell.gScore = 0;
    startCell.fScore = heuristic(startRow, startCol, endRow, endCol);
    openSet.push(startCell);
    
    // A* algorithm
    while (openSet.length > 0) {
        // Sort the open set by fScore
        openSet.sort((a, b) => a.fScore - b.fScore);
        
        // Get the cell with the lowest fScore
        const currentCell = openSet.shift();
        
        // Add to visited cells
        if (!visitedCells.includes(currentCell)) {
            visitedCells.push(currentCell);
            currentCell.visited = true;
            
            // Update the display
            await updateCallback(visitedCells, null);
        }
        
        // Check if we've reached the end
        if (currentCell.row === endRow && currentCell.col === endCol) {
            // Reconstruct the path
            const path = reconstructPath(maze, startRow, startCol, endRow, endCol);
            await updateCallback(visitedCells, path);
            return { path, visitedCells };
        }
        
        // Add to closed set
        closedSet.push(currentCell);
        
        // Get neighbors
        const neighbors = maze.getNeighbors(currentCell.row, currentCell.col);
        
        for (const neighbor of neighbors) {
            // Skip if in closed set
            if (closedSet.includes(neighbor)) {
                continue;
            }
            
            // Calculate tentative gScore
            const tentativeGScore = currentCell.gScore + 1; // Assuming all steps cost 1
            
            // Check if this path is better
            if (tentativeGScore < neighbor.gScore) {
                // Update path
                neighbor.parent = currentCell;
                neighbor.gScore = tentativeGScore;
                neighbor.fScore = tentativeGScore + heuristic(neighbor.row, neighbor.col, endRow, endCol);
                
                // Add to open set if not already there
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    
    // No path found
    return { path: null, visitedCells };
}

/**
 * Calculates the Manhattan distance heuristic
 * @param {number} row1 - Start row
 * @param {number} col1 - Start column
 * @param {number} row2 - End row
 * @param {number} col2 - End column
 * @returns {number} - Heuristic value
 */
function heuristic(row1, col1, row2, col2) {
    // Manhattan distance
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
}

/**
 * Reconstructs the path from start to end
 * @param {Maze} maze - The maze
 * @param {number} startRow - Start row
 * @param {number} startCol - Start column
 * @param {number} endRow - End row
 * @param {number} endCol - End column
 * @returns {Array} - Array of cells in the path
 */
function reconstructPath(maze, startRow, startCol, endRow, endCol) {
    const path = [];
    let current = maze.grid[endRow][endCol];
    
    // Trace back from end to start
    while (current && !(current.row === startRow && current.col === startCol)) {
        path.unshift(current);
        current = current.parent;
    }
    
    // Add the start cell
    if (current) {
        path.unshift(current);
    }
    
    return path;
}