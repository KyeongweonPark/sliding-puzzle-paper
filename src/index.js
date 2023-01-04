import { Puzzle, slideDirections } from "./Puzzle.js";
import { state } from "./State.js";
import { solvePuzzleStrategically } from "./strategicAlgorithm.js";
import {
  solvePuzzleIDAStar,
  solvePuzzleAStarClosedSet,
  solvePuzzleAStar,
  solvePuzzleBFS,
} from "./searchAlgorithms.js";
import {
  animateMoveList,
  checkPuzzleBeforeAnimating,
  initializeUiElements,
} from "./uiUtils.js";

import Background from "../public/assets/Paper_Logo.png";
import imgCha from "../public/assets/Cha.png";
import imgChoi from "../public/assets/Choi.png";
import imgJo from "../public/assets/Jo.png";
import imgJung from "../public/assets/Jung.png";
import imgLee from "../public/assets/Lee.png";
import imgPark from "../public/assets/Park.png";
import imgRho from "../public/assets/Rho.png";
import imgSong from "../public/assets/Song.png";

// When page is finished loading
window.addEventListener("load", async () => {
  //   let url = document.location.href;
  //   console.log(url);
  //   // Enable offline access for Mobile (PWA)
  // Webpack is smart and will remove dev check during production builds :-)
  if ("serviceWorker" in navigator) {
    if (process.env.NODE_ENV === "development") {
      console.log("In development mode, will not register service worker");
    } else {
      navigator.serviceWorker
        .register("./service-worker.js")
        .catch((registrationError) => {
          console.log("Failed to enable offline access", registrationError);
        });
    }
  }

  //   const searchParams = new URLSearchParams(location.search);

  //   for (const param of searchParams) {
  //     console.log(param);
  //   }

  let searchParams = new URLSearchParams(location.search);
  const name = await searchParams.get("name");
  switch (name) {
    case "cha":
      initializeUiElements(imgCha);
      break;
    case "choi":
      initializeUiElements(imgChoi);
      break;
    case "jo":
      initializeUiElements(imgJo);
      break;
    case "jung":
      initializeUiElements(imgJung);
      break;
    case "lee":
      initializeUiElements(imgLee);
      break;
    case "park":
      initializeUiElements(imgPark);
      break;
    case "rho":
      initializeUiElements(imgRho);
      break;
    case "song":
      initializeUiElements(imgSong);
      break;

    default:
      initializeUiElements(Background);
  }
  // Initialize UI, buttons, css toggles, initial Puzzle state

  // Add custom onclick for solve button with animation locking logic
  document.getElementById("solveBtn").addEventListener("click", async () => {
    if (state.solveAnimation.active) {
      return;
    }

    // Wait for our animation lock to become available
    // Don't want to start solving while puzzle is moving, or kick off two animations at the same time
    await state.solveAnimation.lock.finish;
    solvePuzzle();
  });
});

// Maps dropdown values to our solver functions
const algorithmMappings = {
  Strategic: solvePuzzleStrategically,
  "IDA*": solvePuzzleIDAStar,
  "A*": solvePuzzleAStar,
  "A*closedSet": solvePuzzleAStarClosedSet,
  BFS: solvePuzzleBFS,
};

// Solve puzzle using selected algorithm, output result, and start animation
const solvePuzzle = () => {
  // If multiple instances get are trying to acquire lock at same time, this will stop them
  // Needed for mobile where you can press multiple buttons at the same time (randomize + solve)
  if (state.solveAnimation.active) {
    return;
  }

  // Lock our state for solving/animating the puzzle solution
  state.solveAnimation.active = true;
  state.solveAnimation.lock.acquire();
  const startingPuzzle = checkPuzzleBeforeAnimating();
  if (!startingPuzzle) {
    return;
  }

  // Get our algorithm
  const selectedAlgorithm = document.getElementById("algorithmsDropdown").value;
  const algorithm = algorithmMappings[selectedAlgorithm];

  // Solve using algorithm
  const originalPuzzle = Puzzle.fromPuzzle(startingPuzzle);
  let solution = algorithm(startingPuzzle, state.goalPuzzle);
  let solutionMoves = [];
  if (solution["solutionMoves"]) {
    // Strategic algorithm keeps track of solution moves for us
    solutionMoves = solution["solutionMoves"];
  } else {
    // Get inverse of our slide Directions so we can get the key from the value
    let solutionPuzzle = solution["solutionPuzzle"];
    Object.keys(slideDirections).forEach((key) => {
      slideDirections[slideDirections[key]] = key;
    });

    // Build move list from Puzzle state working backwards
    while (solutionPuzzle) {
      solutionMoves.push(slideDirections[solutionPuzzle.lastSlideDirection]);
      solutionPuzzle = solutionPuzzle.cameFrom;
    }

    // Started from end to finish, so reverse moves and remove INITIAL state
    solutionMoves = solutionMoves.reverse();
    solutionMoves.shift();
  }

  // Output summary to screen
  summaryOutput.value = "";
  summaryOutput.value += `Runtime: ${solution["runtimeMs"].toFixed(3)}ms\n`;
  summaryOutput.value += `Moves: ${solutionMoves.length} ${
    selectedAlgorithm !== "Strategic" ||
    solutionMoves.length === 0 ||
    solutionMoves.length === 1
      ? "(optimal)"
      : "(nonoptimal)"
  }\n`;
  summaryOutput.value += `Max puzzles in memory: ${solution["maxPuzzlesInMemory"]}`;
  console.log(
    algorithm.name,
    "SOLUTION:",
    solutionMoves.length - 1,
    solutionMoves
  );

  // Output move list to screen
  let moveList = "Move list:\n";
  for (const [index, move] of solutionMoves.slice(0, 20000).entries()) {
    moveList += `${index + 1}: ${move}\n`;
  }
  solutionOutput.value = moveList;
  solutionOutput.value +=
    solutionMoves.length > 20000 ? "See console for full move list...\n" : "";

  // Animate the solution
  animateMoveList(originalPuzzle, solutionMoves);
};
