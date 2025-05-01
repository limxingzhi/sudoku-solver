
const content = await Deno.readTextFile('./input.txt');

type Grid = Array<Array<number>>;

const sudoku: Grid = content
  .trim()
  .split("\n")
  .map((line) =>
    line.trim().split('').map((char) => (char === "." ? 0 : parseInt(char, 10)))
  );

// hard coded array of numbers
const ALL_NUMBERS = [1,2,3,4,5,6,7,8,9] as const;

function print(grid: Grid) {
  const output = grid.reduce((cum, row) => cum + '\n' + row.join(' '), '')
  console.log(output)
  return output
}

// find possible values for a position on a given grid
function findCandidates (grid: Grid, position: string) : [boolean, Array<number>] {
  const [x,y] = position.split('').map(Number) as [number, number];

  const possibleNumber = new Set<number>(ALL_NUMBERS);

  for (let i = 0; i < 9; i++) {
    if (grid[x][i] && i !== y) possibleNumber.delete(grid[x][i]);
    if (grid[i][y] && i !== x) possibleNumber.delete(grid[i][y]);
  }

  // Check 3x3 grid
  const boxStartRow = Math.floor(x / 3) * 3;
  const boxStartCol = Math.floor(y / 3) * 3;

  for (let i = boxStartRow; i < boxStartRow + 3; i++) {
    for (let j = boxStartCol; j < boxStartCol + 3; j++) {
      if ((i !== x || j !== y) && grid[i][j]) {
        possibleNumber.delete(grid[i][j]);
      }
    }
  }

  if (possibleNumber.size === 0) return [false, []];
  else return [true, Array.from(possibleNumber)];
}

// returns a deep clone of a grid with a updated position
function updateGrid(grid: Grid, position: string, input: number) {
  const [x,y] = position.split('').map(Number) as [number, number];
  const newGrid: Grid = JSON.parse(JSON.stringify(grid));
  newGrid[x][y] = input;
  return newGrid;
}

/**
 * Find the next blank
 * @returns [blank found, position]
 **/
function findBlank(grid: Grid): [boolean, string] {
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      if (!grid[x][y]) return [true, `${x}${y}`]
    }
  }

  return [false, '']
}

const stack:Array<Grid> = [];

// build the initial search tree
(() => {
  // find the first blank
  const [blankExist, firstBlank] = findBlank(sudoku);
  if (!blankExist) throw new Error('grid is filled')

  const [candidatesExist, candidates] = findCandidates(sudoku, firstBlank);
  if (!candidatesExist) throw new Error('no candidates exist for the first blank')

  // populate the stack with all possible values of the first blank grid
  candidates.map(candidate => stack.push(updateGrid(sudoku, firstBlank, candidate)));
})();

function solve (): Grid | undefined {
  while (stack.length) {
    const currentGrid = stack.pop() as Grid;

    // sampling solutions
    // if (stack.length % 1000) print(currentGrid)

    // find the next blank
    const [blankExist, blankPosition] = findBlank(currentGrid);
    if (!blankExist) return currentGrid;

    const [candidatesExist, candidates] = findCandidates(currentGrid, blankPosition);
    if (!candidatesExist) continue;

    // populate the stack with all possible values of the first blank grid
    candidates.map(candidate => stack.push(updateGrid(currentGrid, blankPosition, candidate)));
  }
}

const grid = solve();
if (grid) print(grid);
else throw 'Grid is unsolvable';

