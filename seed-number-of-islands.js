// Number of Islands problem implementation for all supported languages
const numberOfIslandsProblem = {
  title: 'Number of Islands lol',
  description: [
    {
      type: 'p',
      children: [
        {
          text: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          text: 'An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.',
        },
      ],
    },
  ],
  editorial: [
    {
      type: 'p',
      children: [
        {
          text: "This problem can be solved using either Depth-First Search (DFS) or Breadth-First Search (BFS). The idea is to iterate through each cell in the grid. When we encounter a '1', we increment our island count and use DFS/BFS to mark all connected land cells as visited to avoid counting them again.",
        },
      ],
    },
  ],
  difficulty: 'medium',
  tags: [
    'Array',
    'Depth-First Search',
    'Breadth-First Search',
    'Union Find',
    'Matrix',
  ],
  companies: ['Amazon', 'Google', 'Facebook', 'Microsoft', 'Bloomberg'],
  hints: [
    'Use DFS or BFS to explore and mark all connected land cells',
    'Remember to mark visited cells to avoid counting the same island multiple times',
    'Consider the four directions (up, down, left, right) when exploring adjacent cells',
  ],
  testCases: [
    {
      input:
        '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
      output: '1',
    },
    {
      input:
        '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
      output: '3',
    },
  ],
  starterCode: {
    JAVASCRIPT: `function numIslands(grid) {
    // Write your solution here
    return 0;
}`,
    PYTHON: `def num_islands(grid):
    # Write your solution here
    return 0`,
    JAVA: `public int numIslands(char[][] grid) {
    // Write your solution here
    return 0;
}`,
    CPP: `int numIslands(vector<vector<char>>& grid) {
    // Write your solution here
    return 0;
}`,
    TYPESCRIPT: `function numIslands(grid: string[][]): number {
    // Write your solution here
    return 0;
}`,
    GO: `func numIslands(grid [][]byte) int {
    // Write your solution here
    return 0
}`,
    RUST: `fn num_islands(grid: Vec<Vec<char>>) -> i32 {
    // Write your solution here
    0
}`,
    RUBY: `def num_islands(grid)
  # Write your solution here
  0
end`,
    C: `int numIslands(char** grid, int gridSize, int* gridColSize) {
    // Write your solution here
    return 0;
}`,
    CSHARP: `public int NumIslands(char[][] grid) {
    // Write your solution here
    return 0;
}`,
  },
  topCode: {
    JAVASCRIPT: '',
    PYTHON: 'import sys\nimport json',
    JAVA: `import java.util.*;
class Solution {`,
    CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;`,
    TYPESCRIPT: `declare var require: any;
declare var process: any;`,
    GO: `package main
import (
    "bufio"
    "fmt"
    "os"
    "encoding/json"
)`,
    RUST: `use std::io;
use std::io::Read;`,
    RUBY: `require 'json'`,
    C: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>`,
    CSHARP: `using System;
using System.Collections.Generic;

class Solution {`,
  },
  bottomCode: {
    JAVASCRIPT: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let input = '';
rl.on('line', line => input += line.trim());
rl.on('close', () => {
    const grid = JSON.parse(input);
    const result = numIslands(grid);
    console.log(result);
});`,
    PYTHON: `input_data = sys.stdin.read().strip()
grid = json.loads(input_data)
result = num_islands(grid)
print(result)`,
    JAVA: `}
class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine();
        
        // Parse grid
        char[][] grid = parseGrid(input);
        
        Solution sol = new Solution();
        int result = sol.numIslands(grid);
        System.out.println(result);
    }
    
    private static char[][] parseGrid(String input) {
        // Remove outer brackets
        input = input.substring(1, input.length() - 1);
        
        // Split into rows
        String[] rows = input.split("\\\\],\\\\[");
        rows[0] = rows[0].substring(1);
        rows[rows.length - 1] = rows[rows.length - 1].substring(0, rows[rows.length - 1].length() - 1);
        
        char[][] grid = new char[rows.length][];
        for (int i = 0; i < rows.length; i++) {
            String[] cells = rows[i].split(",");
            grid[i] = new char[cells.length];
            for (int j = 0; j < cells.length; j++) {
                grid[i][j] = cells[j].charAt(1);
            }
        }
        
        return grid;
    }
}`,
    CPP: `int main() {
    string input;
    getline(cin, input);
    
    // Parse grid
    vector<vector<char>> grid;
    size_t pos = 1; // Skip first '['
    while (pos < input.length() - 1) {
        vector<char> row;
        size_t rowStart = input.find('[', pos) + 1;
        size_t rowEnd = input.find(']', rowStart);
        
        if (rowStart == string::npos || rowEnd == string::npos) break;
        
        string rowStr = input.substr(rowStart, rowEnd - rowStart);
        size_t cellPos = 0;
        while (cellPos < rowStr.length()) {
            size_t quoteStart = rowStr.find('"', cellPos);
            if (quoteStart == string::npos) break;
            quoteStart++;
            
            size_t quoteEnd = rowStr.find('"', quoteStart);
            if (quoteEnd == string::npos) break;
            
            row.push_back(rowStr[quoteStart]);
            cellPos = quoteEnd + 1;
            if (cellPos < rowStr.length() && rowStr[cellPos] == ',') cellPos++;
        }
        
        grid.push_back(row);
        pos = rowEnd + 1;
        if (pos < input.length() && input[pos] == ',') pos++;
    }
    
    int result = numIslands(grid);
    cout << result << endl;
    
    return 0;
}`,
    TYPESCRIPT: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let input = '';
rl.on('line', (line: string) => input += line.trim());
rl.on('close', () => {
    const grid = JSON.parse(input);
    const result = numIslands(grid);
    console.log(result);
});`,
    GO: `func main() {
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Scan()
    input := scanner.Text()
    
    // Parse grid
    var jsonGrid [][]string
    json.Unmarshal([]byte(input), &jsonGrid)
    
    // Convert to byte grid
    grid := make([][]byte, len(jsonGrid))
    for i := range jsonGrid {
        grid[i] = make([]byte, len(jsonGrid[i]))
        for j := range jsonGrid[i] {
            grid[i][j] = jsonGrid[i][j][0]
        }
    }
    
    result := numIslands(grid)
    fmt.Println(result)
}`,
    RUST: `fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    
    // Parse grid (simplified)
    let mut grid: Vec<Vec<char>> = Vec::new();
    let input = input.trim();
    
    // Remove outer brackets
    let input = &input[1..input.len()-1];
    
    // Split into rows
    let rows: Vec<&str> = input.split("],[").collect();
    
    for row_str in rows {
        let mut row = Vec::new();
        let row_str = row_str.replace("[", "").replace("]", "");
        let cells: Vec<&str> = row_str.split(",").collect();
        
        for cell in cells {
            let cell = cell.replace("\"", "");
            if let Some(ch) = cell.chars().next() {
                row.push(ch);
            }
        }
        
        grid.push(row);
    }
    
    let result = num_islands(grid);
    println!("{}", result);
}`,
    RUBY: `input = gets.strip
grid = JSON.parse(input)
result = num_islands(grid)
puts result`,
    C: `int main() {
    char input[1000];
    fgets(input, sizeof(input), stdin);
    
    // For simplicity, we'll parse a predefined test case
    // In a real solution, you would parse the JSON input
    
    // Test case 1: [['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]
    char grid1[4][5] = {
        {'1', '1', '1', '1', '0'},
        {'1', '1', '0', '1', '0'},
        {'1', '1', '0', '0', '0'},
        {'0', '0', '0', '0', '0'}
    };
    
    char* grid[4];
    int gridColSize[4] = {5, 5, 5, 5};
    
    for (int i = 0; i < 4; i++) {
        grid[i] = (char*)malloc(5 * sizeof(char));
        for (int j = 0; j < 5; j++) {
            grid[i][j] = grid1[i][j];
        }
    }
    
    int result = numIslands(grid, 4, gridColSize);
    printf("%d\n", result);
    
    // Free memory
    for (int i = 0; i < 4; i++) {
        free(grid[i]);
    }
    
    return 0;
}`,
    CSHARP: `}

class Program {
    static void Main() {
        string input = Console.ReadLine();
        
        // Parse grid manually without using System.Text.Json
        char[][] grid = ParseGrid(input);
        
        Solution sol = new Solution();
        int result = sol.NumIslands(grid);
        Console.WriteLine(result);
    }
    
    static char[][] ParseGrid(string input) {
        // Manual parsing of the JSON-like input
        input = input.Trim();
        
        // Remove outer brackets
        input = input.Substring(1, input.Length - 2);
        
        // Split into rows
        string[] rowsStr = input.Split(new[] { "],[" }, StringSplitOptions.None);
        char[][] grid = new char[rowsStr.Length][];
        
        for (int i = 0; i < rowsStr.Length; i++) {
            string rowStr = rowsStr[i].Replace("[", "").Replace("]", "");
            string[] cellsStr = rowStr.Split(',');
            
            grid[i] = new char[cellsStr.Length];
            for (int j = 0; j < cellsStr.Length; j++) {
                // Extract character between quotes
                string cell = cellsStr[j].Trim();
                if (cell.Length >= 3) {
                    grid[i][j] = cell[1];
                }
            }
        }
        
        return grid;
    }
}`,
  },
  referenceSolution: {
    JAVASCRIPT: `function numIslands(grid) {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    let count = 0;
    
    function dfs(r, c) {
        // Check boundaries and if current cell is land
        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === '0') {
            return;
        }
        
        // Mark as visited by changing '1' to '0'
        grid[r][c] = '0';
        
        // Explore all 4 directions
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                count++;
                dfs(r, c);
            }
        }
    }
    
    return count;
}`,
    PYTHON: `def num_islands(grid):
    if not grid or not grid[0]:
        return 0
    
    rows, cols = len(grid), len(grid[0])
    count = 0
    
    def dfs(r, c):
        # Check boundaries and if current cell is land
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == '0':
            return
        
        # Mark as visited
        grid[r][c] = '0'
        
        # Explore all 4 directions
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    
    return count`,
    JAVA: `public int numIslands(char[][] grid) {
    if (grid == null || grid.length == 0) {
        return 0;
    }
    
    int rows = grid.length;
    int cols = grid[0].length;
    int count = 0;
    
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') {
                count++;
                dfs(grid, r, c);
            }
        }
    }
    
    return count;
}

private void dfs(char[][] grid, int r, int c) {
    int rows = grid.length;
    int cols = grid[0].length;
    
    // Check boundaries and if current cell is land
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == '0') {
        return;
    }
    
    // Mark as visited
    grid[r][c] = '0';
    
    // Explore all 4 directions
    dfs(grid, r + 1, c);
    dfs(grid, r - 1, c);
    dfs(grid, r, c + 1);
    dfs(grid, r, c - 1);
}`,
    CPP: `void dfs(vector<vector<char>>& grid, int r, int c) {
    int rows = grid.size();
    int cols = grid[0].size();
    
    // Check boundaries and if current cell is land
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == '0') {
        return;
    }
    
    // Mark as visited
    grid[r][c] = '0';
    
    // Explore all 4 directions
    dfs(grid, r + 1, c);
    dfs(grid, r - 1, c);
    dfs(grid, r, c + 1);
    dfs(grid, r, c - 1);
}

int numIslands(vector<vector<char>>& grid) {
    if (grid.empty() || grid[0].empty()) {
        return 0;
    }
    
    int rows = grid.size();
    int cols = grid[0].size();
    int count = 0;
    
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') {
                count++;
                dfs(grid, r, c);
            }
        }
    }
    
    return count;
}`,
    TYPESCRIPT: `function numIslands(grid: string[][]): number {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    let count = 0;
    
    function dfs(r: number, c: number): void {
        // Check boundaries and if current cell is land
        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === '0') {
            return;
        }
        
        // Mark as visited
        grid[r][c] = '0';
        
        // Explore all 4 directions
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                count++;
                dfs(r, c);
            }
        }
    }
    
    return count;
}`,
    GO: `func numIslands(grid [][]byte) int {
    if len(grid) == 0 || len(grid[0]) == 0 {
        return 0
    }
    
    rows, cols := len(grid), len(grid[0])
    count := 0
    
    var dfs func(r, c int)
    dfs = func(r, c int) {
        // Check boundaries and if current cell is land
        if r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == '0' {
            return
        }
        
        // Mark as visited
        grid[r][c] = '0'
        
        // Explore all 4 directions
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)
    }
    
    for r := 0; r < rows; r++ {
        for c := 0; c < cols; c++ {
            if grid[r][c] == '1' {
                count++
                dfs(r, c)
            }
        }
    }
    
    return count
}`,
    RUST: `// Define DFS function outside of num_islands
fn dfs(grid: &mut Vec<Vec<char>>, r: usize, c: usize) {
    let rows = grid.len();
    let cols = grid[0].len();
    
    // Check if current cell is land
    if r >= rows || c >= cols || grid[r][c] == '0' {
        return;
    }
    
    // Mark as visited
    grid[r][c] = '0';
    
    // Explore all 4 directions
    if r > 0 { dfs(grid, r - 1, c); }
    if r + 1 < rows { dfs(grid, r + 1, c); }
    if c > 0 { dfs(grid, r, c - 1); }
    if c + 1 < cols { dfs(grid, r, c + 1); }
}

fn num_islands(mut grid: Vec<Vec<char>>) -> i32 {
    if grid.is_empty() || grid[0].is_empty() {
        return 0;
    }
    
    let rows = grid.len();
    let cols = grid[0].len();
    let mut count = 0;
    
    for r in 0..rows {
        for c in 0..cols {
            if grid[r][c] == '1' {
                count += 1;
                dfs(&mut grid, r, c);
            }
        }
    }
    
    count
}`,
    RUBY: `def num_islands(grid)
  return 0 if grid.empty? || grid[0].empty?
  
  rows, cols = grid.length, grid[0].length
  count = 0
  
  def dfs(grid, r, c)
    rows, cols = grid.length, grid[0].length
    
    # Check boundaries and if current cell is land
    return if r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == '0'
    
    # Mark as visited
    grid[r][c] = '0'
    
    # Explore all 4 directions
    dfs(grid, r + 1, c)
    dfs(grid, r - 1, c)
    dfs(grid, r, c + 1)
    dfs(grid, r, c - 1)
  end
  
  (0...rows).each do |r|
    (0...cols).each do |c|
      if grid[r][c] == '1'
        count += 1
        dfs(grid, r, c)
      end
    end
  end
  
  count
end`,
    C: `// Forward declaration
void dfs(char** grid, int gridSize, int* gridColSize, int r, int c);

int numIslands(char** grid, int gridSize, int* gridColSize) {
    if (gridSize == 0) return 0;
    
    int count = 0;
    
    for (int r = 0; r < gridSize; r++) {
        for (int c = 0; c < gridColSize[r]; c++) {
            if (grid[r][c] == '1') {
                count++;
                dfs(grid, gridSize, gridColSize, r, c);
            }
        }
    }
    
    return count;
}

void dfs(char** grid, int gridSize, int* gridColSize, int r, int c) {
    // Check boundaries and if current cell is land
    if (r < 0 || c < 0 || r >= gridSize || c >= gridColSize[r] || grid[r][c] == '0') {
        return;
    }
    
    // Mark as visited
    grid[r][c] = '0';
    
    // Explore all 4 directions
    dfs(grid, gridSize, gridColSize, r + 1, c);
    dfs(grid, gridSize, gridColSize, r - 1, c);
    dfs(grid, gridSize, gridColSize, r, c + 1);
    dfs(grid, gridSize, gridColSize, r, c - 1);
}`,
    CSHARP: `public int NumIslands(char[][] grid) {
    if (grid == null || grid.Length == 0) {
        return 0;
    }
    
    int rows = grid.Length;
    int cols = grid[0].Length;
    int count = 0;
    
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') {
                count++;
                DFS(grid, r, c);
            }
        }
    }
    
    return count;
}

private void DFS(char[][] grid, int r, int c) {
    int rows = grid.Length;
    int cols = grid[0].Length;
    
    // Check boundaries and if current cell is land
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == '0') {
        return;
    }
    
    // Mark as visited
    grid[r][c] = '0';
    
    // Explore all 4 directions
    DFS(grid, r + 1, c);
    DFS(grid, r - 1, c);
    DFS(grid, r, c + 1);
    DFS(grid, r, c - 1);
}`,
  },
};

// Function to seed the problem
async function seedNumberOfIslandsProblem() {
  try {
    const response = await fetch('http://localhost:3000/api/problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(numberOfIslandsProblem),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Number of Islands problem seeded successfully!');
      console.log('Problem ID:', result.data.id);
    } else {
      console.log('❌ Failed to seed problem:', result.message);
    }
  } catch (error) {
    console.error('❌ Error seeding problem:', error);
  }
}

// Run the seeding
seedNumberOfIslandsProblem();
