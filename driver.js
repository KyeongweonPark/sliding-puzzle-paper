const Puzzle = require("./Puzzle");
const PriorityQueue = require("./PriorityQueue");

// TODO: Make this a static variable, didn't seem to be working with nodejs...    
const slideDirections = {
    "INITIAL": 0,
    "UP": 1,
    "DOWN": 2,
    "LEFT": 3,
    "RIGHT": 4,
}

const slideDirectionsInv = {
    "0": "INITIAL",
    "1": "UP",
    "2": "DOWN",
    "3": "LEFT",
    "4": "RIGHT",
}


























const solvePuzzleAStar = (puzzle, goal_state) => {
    puzzle.printPuzzle();

    const openList = new PriorityQueue();   // Un-explored states as a priority queue
    const closedList = []; // Previously visited states
    const goal_mapping = Puzzle.getGoalMapping(goal_state); // Mapping of goal tiles' (row,col) to quickly find heuristic distance
    puzzle.updateManhattanSum(goal_mapping);
    openList.enqueue(puzzle, puzzle.manhattanSum);
    let curPuzzle = puzzle;
    while (!curPuzzle.isInGoalState(goal_state)) {
        const neighboringPuzzleStates = curPuzzle.generateNeighbors(goal_mapping);
        const costToNeighbor = curPuzzle.costFromStart + 1;
        for(neighbor of neighboringPuzzleStates) {
            // const closeNeighborIndex = closedList.findIndex(puzzle => puzzle.isEqualToPuzzle(neighbor));
            // // If on the closed list, check if we found a better way
            // if (closeNeighborIndex !== -1) {
            //     const closedPuzzle = closedList[closeNeighborIndex];
            //     if (closedPuzzle.costFromStart > costToNeighbor) {
            //         console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
            //         closedList.splice(closeNeighborIndex, 1);
            //         closedPuzzle.cameFrom = curPuzzle;
            //         closedPuzzle.costFromStart = costToNeighbor;
            //         openList.enqueue(closedPuzzle, closedPuzzle.manhattanSum + closedPuzzle.costFromStart)
            //     }
            // }

            // If on the open list, check if we found a better way
            const openNeighorIndex = openList.items.findIndex(puzzle => puzzle.element.isEqualToPuzzle(neighbor));
            if (openNeighorIndex !== -1) {
                const puzzleToMaybeUpdate = openList.items[openNeighorIndex];
                if (puzzleToMaybeUpdate.element.costFromStart > costToNeighbor) {
                    let removed = openList.items.splice(openNeighorIndex, 1)[0]; // remove from queue to resort with new cost
                    neighbor.cameFrom = curPuzzle;
                    neighbor.updateManhattanSum(goal_mapping);
                    neighbor.costFromStart = costToNeighbor;
                    openList.enqueue(neighbor, neighbor.manhattanSum + neighbor.costFromStart);
                }
            } else {
                // Add to open list for further exploration
                neighbor.cameFrom = curPuzzle;
                neighbor.updateManhattanSum(goal_mapping);
                neighbor.costFromStart = costToNeighbor;
                openList.enqueue(neighbor, neighbor.manhattanSum + neighbor.costFromStart);   
            }
            
        }

        closedList.push(curPuzzle);
        curPuzzle = openList.dequeue();
        // console.log("QUEUE:", openList.items.length, " CLOSED_LIST:", closedList.length);
    }

    // curPuzzle.printPuzzle();
    return curPuzzle;
}























const SOLVED = 0;
const NOT_SOLVED = -1;

// https://en.wikipedia.org/wiki/Iterative_deepening_A*#Pseudocode
const solvePuzzleIDAStar = (puzzle, goal_state) => {
    const goal_mapping = Puzzle.getGoalMapping(goal_state); // Mapping of goal tiles' (row,col) to quickly find heuristic distance
    let curPuzzle = puzzle;
    curPuzzle.updateManhattanSum(goal_mapping);
    let threshold = curPuzzle.manhattanSum;
    const solutionPath = [curPuzzle] // Stack of Puzzles up to our current state
    while (curPuzzle.manhattanSum !== 0) {
        // console.log("SOLUTION_PATH:", solutionPath.length, " BOUNDING_THRESHOLD:", threshold);
        newThreshold = iterativeDeepeningSearch(solutionPath, 0, threshold, goal_mapping);
        threshold = newThreshold;

        if (threshold === Infinity) {
            console.log("unsolvable");
            return;
        }
        curPuzzle = solutionPath[solutionPath.length-1]; // Get top of stack
    }

    curPuzzle.printPuzzle()
    return curPuzzle;
}

const iterativeDeepeningSearch = (solutionPath, costToCurPuzzle, boundingThreshold, goal_mapping) => {
    let curPuzzle = solutionPath[solutionPath.length-1]; // Get top of stack
    let costToSolution = costToCurPuzzle + curPuzzle.manhattanSum

    if (costToSolution > boundingThreshold) {
        return costToSolution;
    }

    if (curPuzzle.manhattanSum === 0) {
        // console.log("DID I REACH THE GOAL?")
        return SOLVED;
    }

    minThreshold = Infinity;
    for (neighbor of curPuzzle.generateNeighbors(goal_mapping)) {
        neighbor.cameFrom = curPuzzle;
        solutionPath.push(neighbor);
        threshold = iterativeDeepeningSearch(solutionPath, costToCurPuzzle + 1 + neighbor.manhattanSum, boundingThreshold, goal_mapping);
        if (threshold == SOLVED) return threshold;
        if (threshold < minThreshold) minThreshold = threshold;
        solutionPath.pop();
    }

    return minThreshold;
}

const goal_state = [ [1, 2, 3], 
                    [4, 5, 6],
                    [7, 8, 0] ];
// let puzzle = new Puzzle();

// puzzle.printPuzzle();
// console.log(puzzle.blank_row, puzzle.blank_col);

// puzzle.slideUp();
// puzzle.slideUp();
// puzzle.slideUp();
// puzzle.printPuzzle();

// puzzle.slideRight();
// puzzle.slideRight();
// puzzle.slideRight();
// puzzle.printPuzzle();

// puzzle.slideDown();
// puzzle.slideDown();
// puzzle.slideDown();
// puzzle.printPuzzle();

// puzzle.slideLeft();
// puzzle.slideLeft();
// puzzle.slideLeft();
// puzzle.printPuzzle();

// console.log(puzzle.isInGoalState(goal_state));

// let puzzle2 = Puzzle.fromPuzzle(puzzle);
// puzzle.printPuzzle();
// puzzle2.printPuzzle();
// console.log(puzzle.isEqualToPuzzle(puzzle2))
// console.log(!closed_list.find(puzzle => puzzle.isEqualToPuzzle(puzzle2)))
// puzzle2.matrix[0][0].value=500000;
// puzzle.printPuzzle();
// puzzle2.printPuzzle();
// console.log(puzzle.isEqualToPuzzle(puzzle2))
// console.log(!closed_list.find(puzzle => puzzle.isEqualToPuzzle(puzzle2)))


// Make a reasonably solvable puzzle

let puzzle = Puzzle.fromMatrix([[8, 6, 7],
                            [2, 5, 4],
                            [3, 0, 1]]);

puzzle.printPuzzle();
// cameFrom[puzzle].printPuzzle();
// cameFrom[puzzle2].printPuzzle();



















// Breadth first search
const solvePuzzleBFS = (puzzle, goal_state) => {
    // puzzle.printPuzzle();
    const openList = [];   // Un-explored states
    const closedList = []; // Previously visited states
    let curPuzzle = puzzle;
    while (!curPuzzle.isInGoalState(goal_state)) {
        neighboringPuzzleStates = curPuzzle.generateNeighbors();
        for(neighbor of neighboringPuzzleStates) {
            // Only explore new states, if we've already explored then don't add to open list
            if (!closedList.find(puzzle => puzzle.isEqualToPuzzle(neighbor))) {
                neighbor.cameFrom = curPuzzle;
                // neighbor.printPuzzle();
                openList.push(neighbor);            
            }
        }

        // closedList.push(curPuzzle);
        curPuzzle = openList.shift();
    }

    // curPuzzle.printPuzzle();
    return curPuzzle;
}



// let bfs = solvePuzzleBFS(puzzle, goal_state);
// let bfsMoves = [];
// while (bfs) {
//     bfsMoves.push(slideDirectionsInv[JSON.stringify(bfs.lastSlideDirection)]);
//     bfs = bfs.cameFrom;
// }
// console.log("BFS SOLUTION:", bfsMoves.length, bfsMoves);


// const aStarSolution = solvePuzzleAStar(puzzle, goal_state);
// let astarMoves = [];
// let FUCKYOU = aStarSolution;
// while (FUCKYOU) {
//     FUCKYOU.printPuzzle();
//     astarMoves.push(slideDirectionsInv[JSON.stringify(FUCKYOU.lastSlideDirection)]);
//     FUCKYOU = FUCKYOU.cameFrom;
// }

// console.log("A* SOLUTION:", astarMoves.length, astarMoves);

let idastar = solvePuzzleIDAStar(puzzle, goal_state);
console.log(idastar);

let idastarMoves = [];
while (idastar) {
    idastar.printPuzzle();
    idastarMoves.push(slideDirectionsInv[JSON.stringify(idastar.lastSlideDirection)]);
    idastar = idastar.cameFrom;
}

console.log("IDA* SOLUTION:", idastarMoves.length, idastarMoves);





let queue = [];
queue.push(1);
queue.push(2);
queue.push(3);
queue.push(4);
queue.push(5);
queue.push(6);
queue.push(7);
console.log(queue);
queue.shift();
queue.shift();
queue.shift();
console.log(queue);
