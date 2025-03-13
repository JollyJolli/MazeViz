// Depth-First Search Algorithm for MazeViz

/**
 * Solves the maze using Depth-First Search algorithm
 * @param {Maze} maze - The maze to solve
 * @param {Function} updateCallback - Callback function to update the display
 * @returns {Promise} - Promise that resolves when the algorithm completes
 */
async function solveMazeWithDFS(maze, updateCallback) {
    // Check if start and end points exist
    if (!maze.startCell || !maze.endCell) {
        return { path: null, visitedCells: [] };
    }
    
    // Initialize variables
    const visitedCells = [];
    const stack = [];
    const startRow = maze.startCell.row;
    const startCol = maze.startCell.col;
    const endRow = maze.endCell.row;
    const endCol = maze.endCell.col;
    
    // Initialize the grid cells for pathfinding
    for (let row = 0; row < maze.rows; row++) {
        for (let col = 0; col < maze.cols; col++) {
            maze.grid[row][col].visited = false;
            maze.grid[row][col].parent = null;
        }
    }
    
    // Start with the start cell
    stack.push(maze.grid[startRow][startCol]);
    maze.grid[startRow][startCol].visited = true;
    visitedCells.push(maze.grid[startRow][startCol]);
    
    // Update the display
    await updateCallback(visitedCells, null);
    
    // DFS algorithm
    while (stack.length > 0) {
        // Get the current cell from the top of the stack
        const currentCell = stack.pop();
        
        // Check if we've reached the end
        if (currentCell.row === endRow && currentCell.col === endCol) {
            // Reconstruct the path
            const path = reconstructPath(maze, startRow, startCol, endRow, endCol);
            await updateCallback(visitedCells, path);
            return { path, visitedCells };
        }
        
        // Get unvisited neighbors
        const neighbors = maze.getNeighbors(currentCell.row, currentCell.col);
        
        for (const neighbor of neighbors) {
            if (!neighbor.visited) {
                // Mark as visited
                neighbor.visited = true;
                neighbor.parent = currentCell;
                
                // Add to visited cells and stack
                visitedCells.push(neighbor);
                stack.push(neighbor);
                
                // Update the display
                await updateCallback(visitedCells, null);
            }
        }
    }
    
    // No path found
    return { path: null, visitedCells };
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