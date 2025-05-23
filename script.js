const buttonColors = ["red", "blue", "green", "yellow"];
let gamePattern = [];
let userClickedPattern = [];

let started = false;
let level = 0;
let highScore = 0;
let soundEnabled = true;
let newHighCelebrated = false;

const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const soundBtn = document.getElementById("sound-btn");
const moveCount = document.getElementById("move-count");
const highScoreDisplay = document.getElementById("high-score");
const addRowBtn = document.getElementById("add-row-btn");

startBtn.addEventListener("click", () => {
  if (!started) {
    removeTryAgainHint();
    nextSequence();
    started = true;
  }
});

resetBtn.addEventListener("click", startOver);

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
});

addRowBtn.addEventListener("click", addColorRow);

function addColorRow() {
  const row = document.createElement("div");
  row.className = "row";

  for (let i = 0; i < 2; i++) {
    const color = getNextNewColor();
    if (!color) break;

    const btn = document.createElement("div");
    btn.className = `btn ${color}`;
    btn.id = color;
    btn.addEventListener("click", handleButtonClick);
    row.appendChild(btn);
    buttonColors.push(color);
  }

  document.getElementById("button-container").appendChild(row);
}

function getNextNewColor() {
  const possibleColors = ["orange", "purple", "pink", "cyan", "lime", "magenta", "teal", "brown"];
  for (const color of possibleColors) {
    if (!buttonColors.includes(color)) return color;
  }
  return null;
}

document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", handleButtonClick);
});

function handleButtonClick() {
  if (!started) return;

  const userChosenColor = this.id;
  userClickedPattern.push(userChosenColor);

  playSound(userChosenColor);
  animatePress(userChosenColor);
  updateMoveCount();

  checkAnswer(userClickedPattern.length - 1);
}

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      if (level < 99) {
        setTimeout(() => nextSequence(), 1000);
      } else {
        alert("Congratulations! You've reached level 99!");
        startOver();
      }
    }
  } else {
    playSound("wrong");
    document.body.classList.add("game-over");
    document.querySelector("h1").textContent = "Game Over";
    showTryAgainHint();

    setTimeout(() => {
      document.body.classList.remove("game-over");
    }, 200);

    startOver();
  }
}

function nextSequence() {
  userClickedPattern = [];
  level++;
  document.querySelector("h1").textContent = `Level ${level}`;
  updateMoveCount();
  updateHighScore();

  let i = 0;
  function playSequenceStep() {
    if (i < gamePattern.length) {
      const color = gamePattern[i];
      flashButton(color);
      playSound(color);
      i++;
      setTimeout(playSequenceStep, 600);
    } else {
      const newColor = buttonColors[Math.floor(Math.random() * buttonColors.length)];
      gamePattern.push(newColor);
      setTimeout(() => {
        flashButton(newColor);
        playSound(newColor);
      }, 600);
    }
  }

  playSequenceStep();
}

function flashButton(color) {
  const button = document.getElementById(color);
  if (!button) return;
  button.classList.add("pressed");
  setTimeout(() => button.classList.remove("pressed"), 300);
}

function playSound(name) {
  if (!soundEnabled) return;
  let soundIndex = buttonColors.indexOf(name) + 1;
  const soundMap = {
    "wrong": "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"
  };
  const audio = new Audio(soundMap[name] || `https://s3.amazonaws.com/freecodecamp/simonSound${soundIndex}.mp3`);
  audio.play();
}

function animatePress(currentColor) {
  const btn = document.getElementById(currentColor);
  btn.classList.add("pressed");
  setTimeout(() => btn.classList.remove("pressed"), 100);
}

function updateMoveCount() {
  moveCount.textContent = `Moves: ${userClickedPattern.length}`;
}

function updateHighScore() {
  if (level > highScore) {
    highScore = level;
    highScoreDisplay.textContent = `High Score: ${highScore}`;

    if (!newHighCelebrated && highScore >= 7) {
      newHighCelebrated = true;
      celebrateHighScore();
    }
  }
}

function celebrateHighScore() {
  // Play Hooray sound
  const hooraySound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_3f4d80d1d8.mp3");
  hooraySound.play();

  // Launch confetti
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 }
  });
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
  userClickedPattern = [];
  newHighCelebrated = false;
  document.querySelector("h1").textContent = "Simon Game";
  moveCount.textContent = "Moves: 0";
}

function showTryAgainHint() {
  removeTryAgainHint();
  const hint = document.createElement("div");
  hint.id = "try-again-hint";
  hint.className = "try-again-hint";
  hint.textContent = "❗ Try again — press Start";
  startBtn.insertAdjacentElement("afterend", hint);
}

function removeTryAgainHint() {
  const existing = document.getElementById("try-again-hint");
  if (existing) existing.remove();
}
function playSound(name) {
  if (!soundEnabled) return;

  const colorFrequencies = {
    red: 261.6,     // C4
    blue: 329.6,    // E4
    green: 392.0,   // G4
    yellow: 523.3,  // C5
    orange: 587.3,  // D5
    purple: 659.3,  // E5
    pink: 698.5,    // F5
    cyan: 783.9,    // G5
    lime: 880.0,    // A5
    magenta: 987.8, // B5
    teal: 1046.5,   // C6
    brown: 1174.7,  // D6
    wrong: 110.0    // low buzz
  };

  const frequency = colorFrequencies[name];
  if (!frequency) return;

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = name === "wrong" ? "sawtooth" : "sine";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.4);
}