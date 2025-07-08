// DOM Elements
const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const toggleThemeButton = document.getElementById("toggle-theme");
const bestMovesDisplay = document.getElementById("best-moves");
const bestTimeDisplay = document.getElementById("best-time");

let cards;
let interval;
let firstCard = false;
let secondCard = false;

// Items array
const items = [
  { name: "bee", image: "bee.png" },
  { name: "crocodile", image: "crocodile.png" },
  { name: "macaw", image: "macaw.png" },
  { name: "gorilla", image: "gorilla.png" },
  { name: "tiger", image: "tiger.png" },
  { name: "monkey", image: "monkey.png" },
  { name: "chameleon", image: "chameleon.png" },
  { name: "piranha", image: "piranha.png" },
  { name: "anaconda", image: "anaconda.png" },
  { name: "sloth", image: "sloth.png" },
  { name: "cockatoo", image: "cockatoo.png" },
  { name: "toucan", image: "toucan.png" },
];

// Initial state
let seconds = 0, minutes = 0;
let movesCount = 0, winCount = 0;
let isGameActive = false;

// Load high score and best time from localStorage
let bestMovesValue = localStorage.getItem("bestMoves") || Infinity;
let bestTimeValue = localStorage.getItem("bestTime") || Infinity;

// Utilities
const formatTime = (totalSeconds) => {
  if (totalSeconds === Infinity || isNaN(totalSeconds)) return "--:--";
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
};

const updateDisplays = () => {
  bestMovesDisplay.textContent = bestMovesValue === Infinity ? "--" : bestMovesValue;
  bestTimeDisplay.textContent = formatTime(bestTimeValue);
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
  timeValue.innerHTML = `<span>Time:</span> ${formatTime(minutes * 60 + seconds)}`;
};

// Timer
const timeGenerator = () => {
  seconds += 1;
  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }
  timeValue.innerHTML = `<span>Time:</span> ${formatTime(minutes * 60 + seconds)}`;
};

// Moves Counter
const movesCounter = () => {
  movesCount += 1;
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
};

// Card Generation
const generateRandom = (size = 4) => {
  let tempArray = [...items];
  let cardValues = [];
  size = (size * size) / 2;
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValues.push(tempArray[randomIndex]);
    tempArray.splice(randomIndex, 1);
  }
  return cardValues;
};

const matrixGenerator = (cardValues, size = 4) => {
  gameContainer.innerHTML = "";
  let allCards = [...cardValues, ...cardValues];
  allCards.sort(() => Math.random() - 0.5);

  for (let item of allCards) {
    gameContainer.innerHTML += `
      <div class="card-container" data-card-value="${item.name}">
        <div class="card-before">?</div>
        <div class="card-after">
          <img src="${item.image}" class="image"/>
        </div>
      </div>`;
  }
  gameContainer.style.gridTemplateColumns = `repeat(${size}, auto)`;
  cards = document.querySelectorAll(".card-container");

  cards.forEach((card) => {
    card.addEventListener("click", () => handleCardClick(card));
  });
};

// Card Click Logic
const handleCardClick = (card) => {
    if (!isGameActive || card.classList.contains("flipped") || card.classList.contains("matched")) {
        return;
    }

    card.classList.add("flipped");

    if (!firstCard) {
        firstCard = card;
    } else {
        movesCounter();
        secondCard = card;
        let firstCardValue = firstCard.getAttribute("data-card-value");
        let secondCardValue = secondCard.getAttribute("data-card-value");

        if (firstCardValue === secondCardValue) {
            // Cards match
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            firstCard = false;
            secondCard = false;
            winCount += 1;
            if (winCount === Math.floor(cards.length / 2)) {
                endGame(true);
            }
        } else {
            // Cards don't match
            let [tempFirst, tempSecond] = [firstCard, secondCard];
            firstCard = false;
            secondCard = false;
            setTimeout(() => {
                tempFirst.classList.remove("flipped");
                tempSecond.classList.remove("flipped");
            }, 900);
        }
    }
};


// Game Controls
const startGame = () => {
  isGameActive = true;
  movesCount = 0;
  winCount = 0;
  seconds = 0;
  minutes = 0;

  stopButton.classList.remove("hide");
  resetButton.classList.remove("hide");
  startButton.classList.add("hide");

  result.innerHTML = "";
  updateDisplays();

  clearInterval(interval);
  interval = setInterval(timeGenerator, 1000);

  let cardValues = generateRandom();
  matrixGenerator(cardValues);
};

const stopGame = (isWin = false) => {
  isGameActive = false;
  clearInterval(interval);
  stopButton.classList.add("hide");
  resetButton.classList.remove("hide"); // Keep reset visible
  startButton.classList.remove("hide");

  if (isWin) {
    let totalTime = minutes * 60 + seconds;
    result.innerHTML = `<h2>You Won!</h2><h4>Moves: ${movesCount} | Time: ${formatTime(totalTime)}</h4>`;

    if (movesCount < bestMovesValue) {
      bestMovesValue = movesCount;
      localStorage.setItem("bestMoves", bestMovesValue);
    }
    if (totalTime < bestTimeValue) {
      bestTimeValue = totalTime;
      localStorage.setItem("bestTime", totalTime);
    }
    updateDisplays();
  }
};

const resetGame = () => {
  gameContainer.innerHTML = "";
  result.innerHTML = "";
  startGame();
};

const endGame = (isWin) => {
    stopGame(isWin);
    // You could add logic here to make all cards briefly visible on loss, etc.
};


// Theme Toggle
const applyTheme = (theme) => {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    toggleThemeButton.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.body.classList.remove("dark-mode");
    toggleThemeButton.innerHTML = '<i class="fas fa-moon"></i>';
  }
};

toggleThemeButton.addEventListener("click", () => {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  const theme = isDarkMode ? "dark" : "light";
  localStorage.setItem("theme", theme);
  applyTheme(theme);
});


// Event Listeners
startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", () => stopGame(false));
resetButton.addEventListener("click", resetGame);

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  updateDisplays();
});