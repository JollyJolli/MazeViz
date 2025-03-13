// Dijkstra's Algorithm for MazeViz

/**
 * Solves the maze using Dijkstra's algorithm
 * @param {Maze} maze - The maze to solve
 * @param {Function} updateCallback - Callback function to update the display
 * @returns {Promise} - Promise that resolves when the algorithm completes
 */
async function solveMazeWithDijkstra(maze, updateCallback) {
    // Check if start and end points exist
    if (!maze.startCell || !maze.endCell) {
        return { path: null, visitedCells: [] };
    }
    
    // Initialize variables
    const visitedCells = [];
    const unvisitedSet = [];
    const startRow = maze.startCell.row;
    const startCol = maze.startCell.col;
    const endRow = maze.endCell.row;
    const endCol = maze.endCell.col;
    
    // Initialize the grid cells for pathfinding
    for (let row = 0; row < maze.rows; row++) {
        for (let col = 0; col < maze.cols; col++) {
            maze.grid[row][col].visited = false;
            maze.grid[row][col].parent = null;
            maze.grid[row][col].distance = Infinity;
            unvisitedSet.push(maze.grid[row][col]);
        }
    }
    
    // Start with the start cell
    maze.grid[startRow][startCol].distance = 0;
    
    // Dijkstra's algorithm
    while (unvisitedSet.length > 0) {
        // Sort unvisited set by distance
        unvisitedSet.sort((a, b) => a.distance - b.distance);
        
        // Get the cell with the smallest distance
        const currentCell = unvisitedSet.shift();
        
        // If the current cell has infinite distance, there's no path
        if (currentCell.distance === Infinity) {
            break;
        }
        
        // Add to visited cells
        visitedCells.push(currentCell);
        currentCell.visited = true;
        
        // Update the display
        await updateCallback(visitedCells, null);
        
        // Check if we've reached the end
        if (currentCell.row === endRow && currentCell.col === endCol) {
            // Reconstruct the path
            const path = reconstructPath(maze, startRow, startCol, endRow, endCol);
            await updateCallback(visitedCells, path);
            return { path, visitedCells };
        }
        
        // Get neighbors
        const neighbors = maze.getNeighbors(currentCell.row, currentCell.col);
        
        for (const neighbor of neighbors) {
            // Skip if already visited
            if (neighbor.visited) {
                continue;
            }
            
            // Calculate new distance
            const newDistance = currentCell.distance + 1; // Assuming all steps cost 1
            
            // If new distance is better, update
            if (newDistance < neighbor.distance) {
                neighbor.distance = newDistance;
                neighbor.parent = currentCell;
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