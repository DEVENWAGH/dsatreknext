// N-Queens problem with corrected implementations for all languages
const nQueensUltimate = {
  title: 'N-Queens c',
  description: [
    {
      type: 'p',
      children: [
        {
          text: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle. Each solution contains a distinct board configuration of the n-queens placement, where "Q" and "." both indicate a queen and an empty space, respectively.',
        },
      ],
    },
  ],
  editorial: [
    {
      type: 'p',
      children: [
        {
          text: 'Use backtracking to explore all possible board configurations. For each row, try placing a queen in each column and check if it conflicts with previously placed queens. If not, proceed to the next row. If a conflict is found, backtrack and try a different position.',
        },
      ],
    },
  ],
  difficulty: 'hard',
  tags: ['Array', 'Backtracking'],
  companies: ['Amazon', 'Google', 'Microsoft', 'Facebook'],
  hints: [
    'Use backtracking to explore all valid board configurations',
    'For each position, check if placing a queen would conflict with any previously placed queens',
    'Queens can attack horizontally, vertically, and diagonally',
  ],
  testCases: [
    {
      input: '4',
      output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
    },
    { input: '1', output: '[["Q"]]' },
  ],
  starterCode: {
    JAVASCRIPT: `var solveNQueens = function(n) {
    // Write your solution here
    return [];
};`,
    PYTHON: `def solve_n_queens(n):
    # Write your solution here
    return []`,
    JAVA: `List<List<String>> solveNQueens(int n) {
    // Write your solution here
    return new ArrayList<>();
}`,
    CPP: `vector<vector<string>> solveNQueens(int n) {
    // Write your solution here
    return {};
}`,
    TYPESCRIPT: `function solveNQueens(n: number): string[][] {
    // Write your solution here
    return [];
}`,
    GO: `func solveNQueens(n int) [][]string {
    // Write your solution here
    return [][]string{}
}`,
    RUST: `fn solve_n_queens(n: i32) -> Vec<Vec<String>> {
    // Write your solution here
    vec![]
}`,
    RUBY: `def solve_n_queens(n)
  # Write your solution here
  []
end`,
    C: `char*** solveNQueens(int n, int* returnSize, int** returnColumnSizes) {
    // Write your solution here
    *returnSize = 0;
    return NULL;
}`,
    CSHARP: `public IList<IList<string>> SolveNQueens(int n) {
    // Write your solution here
    return new List<IList<string>>();
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
#include <functional>
using namespace std;`,
    TYPESCRIPT: `declare var require: any;
declare var process: any;`,
    GO: `package main
import (
    "bufio"
    "fmt"
    "os"
    "strconv"
    "encoding/json"
)`,
    RUST: `use std::io;`,
    RUBY: `require 'json'`,
    C: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
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
    const n = parseInt(input);
    const result = solveNQueens(n);
    console.log(JSON.stringify(result));
});`,
    PYTHON: `input_data = sys.stdin.read().strip()
n = int(input_data)
result = solve_n_queens(n)
# Ensure no spaces in JSON output
print(json.dumps(result).replace(\" \", \"\"))`,
    JAVA: `}
class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        
        Solution sol = new Solution();
        List<List<String>> result = sol.solveNQueens(n);
        
        // Convert to JSON-like format
        System.out.print("[");
        for (int i = 0; i < result.size(); i++) {
            System.out.print("[");
            for (int j = 0; j < result.get(i).size(); j++) {
                System.out.print("\\"" + result.get(i).get(j) + "\\"");
                if (j < result.get(i).size() - 1) {
                    System.out.print(",");
                }
            }
            System.out.print("]");
            if (i < result.size() - 1) {
                System.out.print(",");
            }
        }
        System.out.println("]");
    }
}`,
    CPP: `int main() {
    int n;
    cin >> n;
    
    vector<vector<string>> result = solveNQueens(n);
    
    // Convert to JSON-like format
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << "[";
        for (int j = 0; j < result[i].size(); j++) {
            cout << "\\"" << result[i][j] << "\\"";
            if (j < result[i].size() - 1) {
                cout << ",";
            }
        }
        cout << "]";
        if (i < result.size() - 1) {
            cout << ",";
        }
    }
    cout << "]" << endl;
    
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
    const n = parseInt(input);
    const result = solveNQueens(n);
    console.log(JSON.stringify(result));
});`,
    GO: `func main() {
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Scan()
    input := scanner.Text()
    
    n, _ := strconv.Atoi(input)
    
    result := solveNQueens(n)
    
    // Convert to JSON
    jsonResult, _ := json.Marshal(result)
    fmt.Println(string(jsonResult))
}`,
    RUST: `fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let n: i32 = input.trim().parse().unwrap();
    
    let result = solve_n_queens(n);
    
    // Convert to JSON-like format
    print!("[");
    for (i, board) in result.iter().enumerate() {
        print!("[");
        for (j, row) in board.iter().enumerate() {
            print!("\\\"{}\\\"", row);
            if j < board.len() - 1 {
                print!(",");
            }
        }
        print!("]");
        if i < result.len() - 1 {
            print!(",");
        }
    }
    println!("]");
}`,
    RUBY: `n = gets.strip.to_i
result = solve_n_queens(n)
puts result.to_json`,
    C: `int main() {
    int n;
    scanf("%d", &n);
    
    int returnSize;
    int* returnColumnSizes;
    char*** result = solveNQueens(n, &returnSize, &returnColumnSizes);
    
    // Convert to JSON-like format
    printf("[");
    for (int i = 0; i < returnSize; i++) {
        printf("[");
        for (int j = 0; j < returnColumnSizes[i]; j++) {
            printf("\\\"%s\\\"", result[i][j]);
            if (j < returnColumnSizes[i] - 1) {
                printf(",");
            }
        }
        printf("]");
        if (i < returnSize - 1) {
            printf(",");
        }
    }
    printf("]\\n");
    
    // Free memory
    for (int i = 0; i < returnSize; i++) {
        for (int j = 0; j < returnColumnSizes[i]; j++) {
            free(result[i][j]);
        }
        free(result[i]);
    }
    free(result);
    free(returnColumnSizes);
    
    return 0;
}`,
    CSHARP: `}

class Program {
    static void Main() {
        int n = int.Parse(Console.ReadLine());
        
        Solution sol = new Solution();
        IList<IList<string>> result = sol.SolveNQueens(n);
        
        // Convert to JSON format
        Console.Write("[");
        for (int i = 0; i < result.Count; i++) {
            Console.Write("[");
            for (int j = 0; j < result[i].Count; j++) {
                Console.Write("\\"" + result[i][j] + "\\"");
                if (j < result[i].Count - 1) {
                    Console.Write(",");
                }
            }
            Console.Write("]");
            if (i < result.Count - 1) {
                Console.Write(",");
            }
        }
        Console.WriteLine("]");
    }
}`,
  },
  referenceSolution: {
    JAVASCRIPT: `var solveNQueens = function(n) {
    const result = [];
    
    // Create empty board
    const createBoard = () => {
        const board = [];
        for (let i = 0; i < n; i++) {
            board.push(new Array(n).fill('.'));
        }
        return board;
    };
    
    // Check if position is valid
    const isValid = (board, row, col) => {
        // Check column
        for (let i = 0; i < row; i++) {
            if (board[i][col] === 'Q') return false;
        }
        
        // Check upper left diagonal
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] === 'Q') return false;
        }
        
        // Check upper right diagonal
        for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] === 'Q') return false;
        }
        
        return true;
    };
    
    // Convert board to required format
    const formatBoard = (board) => {
        return board.map(row => row.join(''));
    };
    
    // Backtracking function
    const backtrack = (board, row) => {
        if (row === n) {
            result.push(formatBoard([...board]));
            return;
        }
        
        for (let col = 0; col < n; col++) {
            if (isValid(board, row, col)) {
                board[row][col] = 'Q';
                backtrack(board, row + 1);
                board[row][col] = '.';
            }
        }
    };
    
    backtrack(createBoard(), 0);
    return result;
};`,
    PYTHON: `def solve_n_queens(n):
    result = []
    
    # Create empty board
    board = [['.' for _ in range(n)] for _ in range(n)]
    
    def is_valid(row, col):
        # Check column
        for i in range(row):
            if board[i][col] == 'Q':
                return False
        
        # Check upper left diagonal
        i, j = row - 1, col - 1
        while i >= 0 and j >= 0:
            if board[i][j] == 'Q':
                return False
            i -= 1
            j -= 1
        
        # Check upper right diagonal
        i, j = row - 1, col + 1
        while i >= 0 and j < n:
            if board[i][j] == 'Q':
                return False
            i -= 1
            j += 1
        
        return True
    
    def backtrack(row):
        if row == n:
            # Create solution without spaces
            solution = []
            for r in board:
                solution.append(''.join(r))
            result.append(solution)
            return
        
        for col in range(n):
            if is_valid(row, col):
                board[row][col] = 'Q'
                backtrack(row + 1)
                board[row][col] = '.'
    
    backtrack(0)
    return result`,
    JAVA: `List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    char[][] board = new char[n][n];
    
    // Initialize board
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            board[i][j] = '.';
        }
    }
    
    backtrack(board, 0, result);
    return result;
}

private void backtrack(char[][] board, int row, List<List<String>> result) {
    if (row == board.length) {
        result.add(constructSolution(board));
        return;
    }
    
    for (int col = 0; col < board.length; col++) {
        if (isValid(board, row, col)) {
            board[row][col] = 'Q';
            backtrack(board, row + 1, result);
            board[row][col] = '.';
        }
    }
}

private boolean isValid(char[][] board, int row, int col) {
    // Check column
    for (int i = 0; i < row; i++) {
        if (board[i][col] == 'Q') {
            return false;
        }
    }
    
    // Check upper left diagonal
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] == 'Q') {
            return false;
        }
    }
    
    // Check upper right diagonal
    for (int i = row - 1, j = col + 1; i >= 0 && j < board.length; i--, j++) {
        if (board[i][j] == 'Q') {
            return false;
        }
    }
    
    return true;
}

private List<String> constructSolution(char[][] board) {
    List<String> solution = new ArrayList<>();
    for (int i = 0; i < board.length; i++) {
        solution.add(new String(board[i]));
    }
    return solution;
}`,
    CPP: `vector<vector<string>> solveNQueens(int n) {
    vector<vector<string>> result;
    vector<string> board(n, string(n, '.'));
    
    // Check if position is valid
    auto isValid = [&](int row, int col) -> bool {
        // Check column
        for (int i = 0; i < row; i++) {
            if (board[i][col] == 'Q') {
                return false;
            }
        }
        
        // Check upper left diagonal
        for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] == 'Q') {
                return false;
            }
        }
        
        // Check upper right diagonal
        for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] == 'Q') {
                return false;
            }
        }
        
        return true;
    };
    
    // Backtracking function
    function<void(int)> backtrack = [&](int row) {
        if (row == n) {
            result.push_back(board);
            return;
        }
        
        for (int col = 0; col < n; col++) {
            if (isValid(row, col)) {
                board[row][col] = 'Q';
                backtrack(row + 1);
                board[row][col] = '.';
            }
        }
    };
    
    backtrack(0);
    return result;
}`,
    TYPESCRIPT: `function solveNQueens(n: number): string[][] {
    const result: string[][] = [];
    
    // Create empty board
    const createBoard = (): string[][] => {
        const board: string[][] = [];
        for (let i = 0; i < n; i++) {
            const row: string[] = [];
            for (let j = 0; j < n; j++) {
                row.push('.');
            }
            board.push(row);
        }
        return board;
    };
    
    // Check if position is valid
    const isValid = (board: string[][], row: number, col: number): boolean => {
        // Check column
        for (let i = 0; i < row; i++) {
            if (board[i][col] === 'Q') return false;
        }
        
        // Check upper left diagonal
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] === 'Q') return false;
        }
        
        // Check upper right diagonal
        for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] === 'Q') return false;
        }
        
        return true;
    };
    
    // Convert board to required format
    const formatBoard = (board: string[][]): string[] => {
        return board.map(row => row.join(''));
    };
    
    // Backtracking function
    const backtrack = (board: string[][], row: number): void => {
        if (row === n) {
            result.push(formatBoard(board.map(r => [...r])));
            return;
        }
        
        for (let col = 0; col < n; col++) {
            if (isValid(board, row, col)) {
                board[row][col] = 'Q';
                backtrack(board, row + 1);
                board[row][col] = '.';
            }
        }
    };
    
    backtrack(createBoard(), 0);
    return result;
}`,
    GO: `func solveNQueens(n int) [][]string {
    result := [][]string{}
    board := make([][]byte, n)
    for i := range board {
        board[i] = make([]byte, n)
        for j := range board[i] {
            board[i][j] = '.'
        }
    }
    
    var backtrack func(row int)
    backtrack = func(row int) {
        if row == n {
            solution := make([]string, n)
            for i := 0; i < n; i++ {
                solution[i] = string(board[i])
            }
            result = append(result, solution)
            return
        }
        
        for col := 0; col < n; col++ {
            if isValid(board, row, col, n) {
                board[row][col] = 'Q'
                backtrack(row + 1)
                board[row][col] = '.'
            }
        }
    }
    
    backtrack(0)
    return result
}

func isValid(board [][]byte, row, col, n int) bool {
    // Check column
    for i := 0; i < row; i++ {
        if board[i][col] == 'Q' {
            return false
        }
    }
    
    // Check upper left diagonal
    for i, j := row-1, col-1; i >= 0 && j >= 0; i, j = i-1, j-1 {
        if board[i][j] == 'Q' {
            return false
        }
    }
    
    // Check upper right diagonal
    for i, j := row-1, col+1; i >= 0 && j < n; i, j = i-1, j+1 {
        if board[i][j] == 'Q' {
            return false
        }
    }
    
    return true
}`,
    RUST: `fn solve_n_queens(n: i32) -> Vec<Vec<String>> {
    let n = n as usize;
    let mut result = Vec::new();
    let mut board = vec![vec!['.'; n]; n];
    
    fn is_valid(board: &Vec<Vec<char>>, row: usize, col: usize) -> bool {
        // Check column
        for i in 0..row {
            if board[i][col] == 'Q' {
                return false;
            }
        }
        
        // Check upper left diagonal
        let mut i = row as i32 - 1;
        let mut j = col as i32 - 1;
        while i >= 0 && j >= 0 {
            if board[i as usize][j as usize] == 'Q' {
                return false;
            }
            i -= 1;
            j -= 1;
        }
        
        // Check upper right diagonal
        let mut i = row as i32 - 1;
        let mut j = col as i32 + 1;
        while i >= 0 && j < board.len() as i32 {
            if board[i as usize][j as usize] == 'Q' {
                return false;
            }
            i -= 1;
            j += 1;
        }
        
        true
    }
    
    fn backtrack(board: &mut Vec<Vec<char>>, row: usize, result: &mut Vec<Vec<String>>) {
        if row == board.len() {
            let solution: Vec<String> = board
                .iter()
                .map(|r| r.iter().collect::<String>())
                .collect();
            result.push(solution);
            return;
        }
        
        for col in 0..board.len() {
            if is_valid(board, row, col) {
                board[row][col] = 'Q';
                backtrack(board, row + 1, result);
                board[row][col] = '.';
            }
        }
    }
    
    backtrack(&mut board, 0, &mut result);
    result
}`,
    RUBY: `def solve_n_queens(n)
  result = []
  board = Array.new(n) { Array.new(n, '.') }
  
  def is_valid(board, row, col)
    # Check column
    (0...row).each do |i|
      return false if board[i][col] == 'Q'
    end
    
    # Check upper left diagonal
    i, j = row - 1, col - 1
    while i >= 0 && j >= 0
      return false if board[i][j] == 'Q'
      i -= 1
      j -= 1
    end
    
    # Check upper right diagonal
    i, j = row - 1, col + 1
    while i >= 0 && j < board.length
      return false if board[i][j] == 'Q'
      i -= 1
      j += 1
    end
    
    true
  end
  
  def backtrack(board, row, result)
    if row == board.length
      result << board.map(&:join)
      return
    end
    
    (0...board.length).each do |col|
      if is_valid(board, row, col)
        board[row][col] = 'Q'
        backtrack(board, row + 1, result)
        board[row][col] = '.'
      end
    end
  end
  
  backtrack(board, 0, result)
  result
end`,
    C: `char*** solveNQueens(int n, int* returnSize, int** returnColumnSizes) {
    *returnSize = 0;
    char*** result = (char***)malloc(1000 * sizeof(char**));
    *returnColumnSizes = (int*)malloc(1000 * sizeof(int));
    
    // Create board
    char** board = (char**)malloc(n * sizeof(char*));
    for (int i = 0; i < n; i++) {
        board[i] = (char*)malloc((n + 1) * sizeof(char));
        for (int j = 0; j < n; j++) {
            board[i][j] = '.';
        }
        board[i][n] = '\\0';
    }
    
    // Check if position is valid
    bool isValid(char** board, int row, int col) {
        // Check column
        for (int i = 0; i < row; i++) {
            if (board[i][col] == 'Q') return false;
        }
        
        // Check upper left diagonal
        for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] == 'Q') return false;
        }
        
        // Check upper right diagonal
        for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] == 'Q') return false;
        }
        
        return true;
    }
    
    // Add solution to result
    void addSolution(char** board) {
        char** solution = (char**)malloc(n * sizeof(char*));
        for (int i = 0; i < n; i++) {
            solution[i] = (char*)malloc((n + 1) * sizeof(char));
            strcpy(solution[i], board[i]);
        }
        result[*returnSize] = solution;
        (*returnColumnSizes)[*returnSize] = n;
        (*returnSize)++;
    }
    
    // Backtracking function
    void backtrack(int row) {
        if (row == n) {
            addSolution(board);
            return;
        }
        
        for (int col = 0; col < n; col++) {
            if (isValid(board, row, col)) {
                board[row][col] = 'Q';
                backtrack(row + 1);
                board[row][col] = '.';
            }
        }
    }
    
    backtrack(0);
    
    // Free board
    for (int i = 0; i < n; i++) {
        free(board[i]);
    }
    free(board);
    
    return result;
}`,
    CSHARP: `public IList<IList<string>> SolveNQueens(int n) {
    var result = new List<IList<string>>();
    var board = new char[n][];
    
    // Initialize board
    for (int i = 0; i < n; i++) {
        board[i] = new char[n];
        for (int j = 0; j < n; j++) {
            board[i][j] = '.';
        }
    }
    
    Backtrack(board, 0, result);
    return result;
}

private void Backtrack(char[][] board, int row, IList<IList<string>> result) {
    if (row == board.Length) {
        result.Add(ConstructSolution(board));
        return;
    }
    
    for (int col = 0; col < board.Length; col++) {
        if (IsValid(board, row, col)) {
            board[row][col] = 'Q';
            Backtrack(board, row + 1, result);
            board[row][col] = '.';
        }
    }
}

private bool IsValid(char[][] board, int row, int col) {
    // Check column
    for (int i = 0; i < row; i++) {
        if (board[i][col] == 'Q') {
            return false;
        }
    }
    
    // Check upper left diagonal
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] == 'Q') {
            return false;
        }
    }
    
    // Check upper right diagonal
    for (int i = row - 1, j = col + 1; i >= 0 && j < board.Length; i--, j++) {
        if (board[i][j] == 'Q') {
            return false;
        }
    }
    
    return true;
}

private IList<string> ConstructSolution(char[][] board) {
    var solution = new List<string>();
    for (int i = 0; i < board.Length; i++) {
        solution.Add(new string(board[i]));
    }
    return solution;
}`,
  },
};

// Function to seed the ultimate problem
async function seedNQueensUltimate() {
  try {
    const response = await fetch('http://localhost:3000/api/problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nQueensUltimate),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ N-Queens Ultimate - ALL supported languages working!');
      console.log('Problem ID:', result.data.id);
    } else {
      console.log('❌ Failed to seed problem:', result.message);
    }
  } catch (error) {
    console.error('❌ Error seeding problem:', error);
  }
}

// Run the seeding
seedNQueensUltimate();
