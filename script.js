const DIRECTION = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
};

class Snake {
  boardSize = 0;
  speed = null;
  bodySnake = [{ x: -1, y: -1 }];
  foodPosition = {
    x: -1,
    y: -1,
  };
  direction = null;
  gameStarted = false;
  score = 0;
  gameOver = false;

  constructor(boardSize, speed) {
    this.boardSize = boardSize;
    this.speed = speed;
    const middle = Math.floor(boardSize / 2);
    this.bodySnake[0] = { x: middle, y: middle };
    this._generateFood();
  }

  isGameStarted() {
    return this.gameStarted;
  }

  startGame() {
    this.gameStarted = true;
  }

  getBodySnake() {
    return this.bodySnake;
  }

  getFoodPosition() {
    return this.foodPosition;
  }

  getScore() {
    return this.score;
  }

  getSpeed() {
    return this.speed;
  }

  isGameOver() {
    return this.gameOver;
  }

  stopGame() {
    this.gameOver = true;
  }

  // nu ii este permis sarpelui daca are lungimea mai mare decat 1 sa se intoarca pe directia
  // din care vine
  setDirections(direction) {
    if (this.bodySnake.length > 1 && this._isOppositeDirection(direction))
      return;
    this.direction = direction;
  }

  //
  moveSnake() {
    const head = { ...this.bodySnake[0] };
    if (this.direction === DIRECTION.UP) {
      head.x--;
    }
    if (this.direction === DIRECTION.DOWN) {
      head.x++;
    }
    if (this.direction === DIRECTION.LEFT) {
      head.y--;
    }
    if (this.direction === DIRECTION.RIGHT) {
      head.y++;
    }
    if (!this._checkCurrentPosition(head)) {
      this.stopGame();
    }
    if (!(head.x === this.foodPosition.x && head.y === this.foodPosition.y)) {
      this.bodySnake.pop();
      this.bodySnake.unshift(head);
    } else {
      this.bodySnake.unshift(head);
      this._generateFood();
      ++this.score;
    }
  }

  // in aceasta functie nu ii permit sarpelui sa se intoarca pe directie de unde a venit
  _isOppositeDirection(newDirection) {
    if (this.direction === DIRECTION.UP && newDirection === DIRECTION.DOWN)
      return true;
    if (this.direction === DIRECTION.DOWN && newDirection === DIRECTION.UP)
      return true;
    if (this.direction === DIRECTION.LEFT && newDirection === DIRECTION.RIGHT)
      return true;
    if (this.direction === DIRECTION.RIGHT && newDirection === DIRECTION.LEFT)
      return true;
    return false;
  }

  // in aceasta functie generez aleator o noua mancare dupa ce a fost mancata de sarpe
  _generateFood() {
    let fpx = Math.floor(Math.random() * this.boardSize);
    let fpy = Math.floor(Math.random() * this.boardSize);
    while (this.bodySnake.find((value) => value.x === fpx && value.y === fpy)) {
      fpx = Math.floor(Math.random() * this.boardSize);
      fpy = Math.floor(Math.random() * this.boardSize);
    }
    this.foodPosition.x = fpx;
    this.foodPosition.y = fpy;
  }

  // aceasta functie o folosesc pentru a verifica daca sarpele a atins cu capul
  // marginea tablei de jos sau daca si-a atins cu capul coada
  _checkCurrentPosition(head) {
    if (
      head.x < 0 ||
      head.x === this.boardSize ||
      head.y < 0 ||
      head.y === this.boardSize
    )
      return false;
    if (
      !!this.bodySnake.find((value) => value.x === head.x && value.y === head.y)
    )
      return false;
    return true;
  }
}

const playBoardEl = document.getElementById("play-board");
const scoreTextEl = document.getElementById("score-text");
const scoreGameEl = document.getElementById("score");

const startButtonsEl = document.getElementById("start-buttons");
const easyStartEl = document.getElementById("easy-start");
const mediumStartEl = document.getElementById("medium-start");
const hardStartEl = document.getElementById("hard-start");
const restartButtonEl = document.getElementById("restart-button");

const BOARDSIZE = 40;
let snake;

// folosesc functia asta ca sa redesenz jocul dupa fiecare miscare a sarpelui,
// altfel nu vom putea vedea urmatoarea pozitie a sarpelui
const drawGameBoard = () => {
  const bodySnake = snake.getBodySnake();
  const foodPosition = snake.getFoodPosition();
  const score = snake.getScore();

  playBoardEl.innerHTML = "";
  playBoardEl.textContent = "";
  scoreGameEl.innerHTML = score;
  for (let i = 0; i < BOARDSIZE; i++) {
    for (let j = 0; j < BOARDSIZE; j++) {
      let cellElement = document.createElement("div");
      if (foodPosition.x === i && foodPosition.y === j) {
        cellElement.classList.add("food");
      }
      if (
        bodySnake.find((value, index) => {
          return value.x === i && value.y === j && index === 0;
        })
      ) {
        cellElement.classList.add("snakeHead");
      }
      if (
        bodySnake.find((value, index) => {
          return value.x === i && value.y === j && index > 0;
        })
      ) {
        cellElement.classList.add("snake");
      }
      cellElement.id = `${i}_${j}`;
      playBoardEl.append(cellElement);
    }
  }
};

const startGame = () => {
  startButtonsEl.style.display = "none";
  playBoardEl.style.gridTemplate =
    "repeat(" + BOARDSIZE + ", 1fr) / repeat(" + BOARDSIZE + ", 1fr)";
  playBoardEl.style.display = "grid";
  scoreTextEl.style.display = "block";
  drawGameBoard();
};

const stopGameLoop = (interval) => {
  clearInterval(interval);
};

const gameLoop = () => {
  const interval = setInterval(() => {
    snake.moveSnake();
    if (snake.isGameOver()) {
      const gameOverEl = document.getElementById("game-over");
      gameOverEl.style.display = "flex";
      restartButtonEl.style.display = "flex";
      document.removeEventListener("keydown", onKeyDown);
      stopGameLoop(interval);
      return;
    }
    drawGameBoard();
  }, snake.getSpeed());
};

// initializam obiectul snake in functie de gradul de dificultate
const easyStart = () => {
  snake = new Snake(BOARDSIZE, 300);
  startGame();
};

const mediumStart = () => {
  snake = new Snake(BOARDSIZE, 150);
  startGame();
};
const hardStart = () => {
  snake = new Snake(BOARDSIZE, 50);
  startGame();
};

// folosind aceasta functie am setat directia sarpelui sa corespunda cu sagetile
// de la tastatura
const onKeyDown = (event) => {
  if (event.key === "ArrowDown") snake.setDirections(DIRECTION.DOWN);
  if (event.key === "ArrowUp") snake.setDirections(DIRECTION.UP);
  if (event.key === "ArrowLeft") snake.setDirections(DIRECTION.LEFT);
  if (event.key === "ArrowRight") snake.setDirections(DIRECTION.RIGHT);
  if (!snake.isGameStarted()) {
    snake.startGame();
    gameLoop();
  }
};

document.addEventListener("keydown", onKeyDown);

easyStartEl.addEventListener("click", easyStart);
mediumStartEl.addEventListener("click", mediumStart);
hardStartEl.addEventListener("click", hardStart);
