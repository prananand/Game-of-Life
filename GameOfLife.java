package conwaygame;
import java.util.ArrayList;
/**
 * Conway's Game of Life Class holds various methods that will
 * progress the state of the game's board through it's many iterations/generations.
 *
 * Rules 
 * Alive cells with 0-1 neighbors die of loneliness.
 * Alive cells with >=4 neighbors die of overpopulation.
 * Alive cells with 2-3 neighbors survive.
 * Dead cells with exactly 3 neighbors become alive by reproduction.

 * @author Seth Kelley 
 * @author Maxwell Goldberg
 */
public class GameOfLife {

    // Instance variables
    private static final boolean ALIVE = true;
    private static final boolean DEAD = false;

    private boolean[][] grid;    // The board has the current generation of cells
    private int totalAliveCells; // Total number of alive cells in the grid (board)

    /**
    * Default Constructor which creates a small 5x5 grid with five alive cells.
    * This variation does not exceed bounds and dies off after four iterations.
    */
    public GameOfLife() {
        grid = new boolean[5][5];
        totalAliveCells = 5;
        grid[1][1] = ALIVE;
        grid[1][3] = ALIVE;
        grid[2][2] = ALIVE;
        grid[3][2] = ALIVE;
        grid[3][3] = ALIVE;
    }

    /**
    * Constructor used that will take in values to create a grid with a given number
    * of alive cells
    * @param file is the input file with the initial game pattern formatted as follows:
    * An integer representing the number of grid rows, say r
    * An integer representing the number of grid columns, say c
    * Number of r lines, each containing c true or false values (true denotes an ALIVE cell)
    */
    public GameOfLife (String file) {

        StdIn.setFile(file);
        int row = StdIn.readInt();
        int col = StdIn.readInt();
       
        grid = new boolean[row][col];
        totalAliveCells = 0;
        
        for (int i = 0; i < row; i++) {
            for (int j = 0; j < col; j++) {
                grid[i][j] = StdIn.readBoolean();
                if (grid[i][j] == ALIVE) {
                    totalAliveCells++;
                }
             }
        }
    }

    /**
     * Returns grid
     * @return boolean[][] for current grid
     */
    public boolean[][] getGrid () {
        return grid;
    }
    
    /**
     * Returns totalAliveCells
     * @return int for total number of alive cells in grid
     */
    public int getTotalAliveCells () {
        return totalAliveCells;
    }

    /**
     * Returns the status of the cell at (row,col): ALIVE or DEAD
     * @param row row position of the cell
     * @param col column position of the cell
     * @return true or false value "ALIVE" or "DEAD" (state of the cell)
     */
    public boolean getCellState (int row, int col) {
        return grid[row][col];
    }

    /**
     * Returns true if there are any alive cells in the grid
     * @return true if there is at least one cell alive, otherwise returns false
     */
    public boolean isAlive () {
        for (int row = 0; row < grid.length; row++) {
            for (int col = 0; col < grid[row].length; col++) {
                if (grid[row][col] == ALIVE) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Determines the number of alive cells around a given cell.
     * Each cell has 8 neighbor cells which are the cells that are 
     * horizontally, vertically, or diagonally adjacent.
     * 
     * @param col column position of the cell
     * @param row row position of the cell
     * @return neighboringCells, the number of alive cells (at most 8).
     */
    public int numOfAliveNeighbors (int row, int col) {
         int neighboringCells = 0;

         for (int i = -1; i <= 1; i++) {
             for (int j = -1; j <= 1; j++) { 
                 if (i == 0 && j == 0) { //if on current grid then skip
                    continue;
                 }
                 int neighboringRow = (row + i + grid.length) % grid.length;
                 int neighboringCol = (col + j + grid[row].length) % grid[row].length;
                 if (grid[neighboringRow][neighboringCol] == ALIVE) {
                     neighboringCells++; //neighboring cells increment
                 }
             }
         }
        return neighboringCells;
        }

    /**
     * Creates a new grid with the next generation of the current grid using 
     * the rules for Conway's Game of Life.
     * 
     * @return boolean[][] of new grid (this is a new 2D array)
     */
    public boolean[][] computeNewGrid () {
        boolean[][] newGrid = new boolean[grid.length][grid[0].length];
        for(int row = 0; row < newGrid.length; row++) {
            for(int col = 0; col < newGrid[row].length; col++) {
                int aliveNeighbors = numOfAliveNeighbors(row, col);
                if(grid[row][col] && aliveNeighbors < 2) //if less than two then dead due to loneliness
                    newGrid[row][col] = DEAD;
                else if(grid[row][col] && aliveNeighbors > 3) //if greater than three then dead due to overpopulation
                    newGrid[row][col] = DEAD;
                else if(!grid[row][col] && aliveNeighbors == 3) //if three then alive
                    newGrid[row][col] = ALIVE;
                else 
                    newGrid[row][col] = grid[row][col];
                
            }
        }
        return newGrid;
    }


    /**
     * Updates the current grid (the grid instance variable) with the grid denoting
     * the next generation of cells computed by computeNewGrid().
     * 
     * Updates totalAliveCells instance variable
     */
    public void nextGeneration () {
        grid = computeNewGrid();
    }

    /**
     * Updates the current grid with the grid computed after multiple (n) generations. 
     * @param n number of iterations that the grid will go through to compute a new grid
     */
    public void nextGeneration (int n) {
        for (int i = 0; i < n; i++) {
            grid = computeNewGrid();
        }
    }

    /**
     * Determines the number of separate cell communities in the grid
     * @return the number of communities in the grid, communities can be formed from edges
     */
    public int numOfCommunities() {
        WeightedQuickUnionUF weightedUnionFind = new WeightedQuickUnionUF(grid.length, grid[0].length);
        ArrayList<Integer> list = new ArrayList<>();

        for (int row = 0; row < grid.length; row++) {
            for (int col = 0; col < grid[0].length; col++) {
                if (grid[row][col] == ALIVE) {
                    for (int i = -1; i <= 1; i++) {
                        for (int j = -1; j <= 1; j++) {
                            if (i == 0 && j == 0) 
                            continue;
                            int neighboringRow = (row + i + grid.length) % grid.length;
                            int neighboringCol = (col + j + grid[0].length) % grid[0].length;
                             if (grid[neighboringRow][neighboringCol] == ALIVE) {
                                weightedUnionFind.union(row, col, neighboringRow, neighboringCol);
                            }
                        }
                    }
                }
            }
        }

        for (int row = 0; row < grid.length; row++) {
            for (int col = 0; col < grid[0].length; col++) {
                if (grid[row][col] == ALIVE) { 
                    if (!list.contains(weightedUnionFind.find(row, col))) {
                        list.add(weightedUnionFind.find(row, col));
                    }
                }
            }
        }
        return list.size();
    }
}



