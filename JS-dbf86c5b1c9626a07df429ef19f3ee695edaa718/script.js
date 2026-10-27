// ---------------------------------------------------------------------------
// Gameboard: stores the 9 cells and knows how to place a mark / reset.
// IIFE (module pattern) -> only one instance can ever exist.
// ---------------------------------------------------------------------------
const Gameboard = (function () {
  const SIZE = 9;
  let board = Array(SIZE).fill("");

  const getBoard = () => [...board]; // copy, so the outside can't change it

  const placeMark = (index, mark) => {
    const isValidIndex = Number.isInteger(index) && index >= 0 && index < SIZE;
    if (!isValidIndex || board[index] !== "") return false; // taken or invalid
    board[index] = mark;
    return true;
  };

  const reset = () => {
    board = Array(SIZE).fill("");
  };

  return { getBoard, placeMark, reset };
})();

// ---------------------------------------------------------------------------
// Player factory: many players can be created.
// ---------------------------------------------------------------------------
function createPlayer(name, mark) {
  return { name, mark };
}

// ---------------------------------------------------------------------------
// GameController: game flow, turns, win / tie detection. No DOM here,
// so the whole game can be played from the console:
//   GameController.start("Ann", "Bob");
//   GameController.playRound(4);
// ---------------------------------------------------------------------------
const GameController = (function () {
  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],            // diagonals
  ];

  let players = [];
  let activePlayer = null;
  let gameOver = false;
  let result = null; // { type: "win", winner, line } | { type: "tie" }

  const printBoard = () => {
    const b = Gameboard.getBoard().map((cell) => cell || " ");
    console.log(
      `\n ${b[0]} | ${b[1]} | ${b[2]}\n---+---+---\n ${b[3]} | ${b[4]} | ${b[5]}\n---+---+---\n ${b[6]} | ${b[7]} | ${b[8]}\n`
    );
  };

  const findWinningLine = (board) =>
    WIN_LINES.find(
      ([a, b, c]) => board[a] !== "" && board[a] === board[b] && board[a] === board[c]
    ) || null;

  const start = (nameX = "", nameO = "") => {
    Gameboard.reset();
    players = [
      createPlayer(nameX.trim() || "Player X", "X"),
      createPlayer(nameO.trim() || "Player O", "O"),
    ];
    activePlayer = players[0];
    gameOver = false;
    result = null;
    printBoard();
    console.log(`${activePlayer.name} (${activePlayer.mark}) starts.`);
  };

  // Returns the outcome: "invalid" | "continue" | "win" | "tie"
  const playRound = (index) => {
    if (gameOver || !activePlayer) return "invalid";
    if (!Gameboard.placeMark(index, activePlayer.mark)) return "invalid";

    printBoard();
    const board = Gameboard.getBoard();
    const line = findWinningLine(board);

    if (line) {
      gameOver = true;
      result = { type: "win", winner: activePlayer, line };
      console.log(`${activePlayer.name} wins!`);
      return "win";
    }

    if (board.every((cell) => cell !== "")) {
      gameOver = true;
      result = { type: "tie" };
      console.log("It's a tie!");
      return "tie";
    }

    activePlayer = activePlayer === players[0] ? players[1] : players[0];
    console.log(`${activePlayer.name}'s turn (${activePlayer.mark}).`);
    return "continue";
  };

  const getActivePlayer = () => activePlayer;
  const isGameOver = () => gameOver;
  const getResult = () => result;

  return { start, playRound, getActivePlayer, isGameOver, getResult };
})();

// ---------------------------------------------------------------------------
// DisplayController: everything that touches the DOM.
// ---------------------------------------------------------------------------
const DisplayController = (function () {
  const boardEl = document.querySelector("#board");
  const statusEl = document.querySelector("#status");
  const setupForm = document.querySelector("#setup-form");
  const inputX = document.querySelector("#player-x");
  const inputO = document.querySelector("#player-o");
  const startBtn = document.querySelector("#start-btn");

  const buildBoard = () => {
    const cells = Gameboard.getBoard().map((_, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.index = index;
      cell.setAttribute(
        "aria-label",
        `Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}`
      );
      return cell;
    });
    boardEl.replaceChildren(...cells);
  };

  const renderStatus = () => {
    const result = GameController.getResult();
    if (!result) {
      const player = GameController.getActivePlayer();
      statusEl.textContent = `${player.name}'s turn (${player.mark})`;
    } else if (result.type === "win") {
      statusEl.textContent = `${result.winner.name} wins! 🎉`;
    } else {
      statusEl.textContent = "It's a tie!";
    }
  };

  const render = () => {
    const board = Gameboard.getBoard();
    const result = GameController.getResult();
    const winLine = result && result.type === "win" ? result.line : [];
    const gameOver = GameController.isGameOver();

    boardEl.querySelectorAll(".cell").forEach((cell, i) => {
      cell.textContent = board[i];
      cell.dataset.mark = board[i];
      cell.disabled = board[i] !== "" || gameOver;
      cell.classList.toggle("win", winLine.includes(i));
    });
    renderStatus();
  };

  const startGame = () => {
    GameController.start(inputX.value, inputO.value);
    startBtn.textContent = "Restart Game";
    render();
  };

  boardEl.addEventListener("click", (event) => {
    const cell = event.target.closest(".cell");
    if (!cell) return;
    GameController.playRound(Number(cell.dataset.index));
    render();
  });

  setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    startGame();
  });

  const init = () => {
    buildBoard();
    startGame();
    startBtn.textContent = "Start Game"; // first game is already running with default names
  };

  return { init };
})();

DisplayController.init();
