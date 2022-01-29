// enum ("enumeration")
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;
const UP = 4;

// load images
const dedImg = document.createElement("img");
dedImg.src = "assets/gameover.jpg";
const moneysImg = document.createElement("img");
moneysImg.src = "assets/dogecoin.png";
const dogeRight = document.createElement("img");
dogeRight.src = "assets/dogeright.png";

// load song
const bestSong = new Audio("assets/bestsong.mp3");
bestSong.loop = true;
bestSong.volume = 0.75;  // 1 is max, 0 is muted.
// bestSong.addEventListener("canplaythrough", function() {});

// // load sound effects
const airhornSound = new Audio("assets/airhorn.mp3");
bestSong.loop = false;
bestSong.volume = 0.75;

const coinSound = new Audio("assets/coin.mp3");
bestSong.loop = false;
bestSong.volume = 0.75;

const youCantSeeMe = new Audio("assets/jhoncena.mp3");
bestSong.loop = false;
bestSong.volume = 0.75;

const moneySound = new Audio("assets/money.mp3");
bestSong.loop = false;
bestSong.volume = 0.75;

const oofSound = new Audio("assets/oof.mp3");
bestSong.loop = false;
bestSong.volume = 1;

// ----------------------------------- CLASSES -----------------------------------

// Logic for a game of DogeTrain
class DogeTrain {

	constructor(W, H, initialFoodCount) {
		// variables representing the game state
		this.dir = null;
		this.nextDir = null;  // the direction the snake should change to on next "frame", or null if no change in direction
		this.snake = [];  // head and body pieces of "snake"
		this.moneys = [];  // positions of "coins"
		this.score = 420;
		this.highScore = 0;
		this.gameOver = false;
		this.W = W;  // width of game board/grid measured in cell
		this.H = H;  // height of game board/grid measured in cell

		// event handlers
		this.onBoomWithFood = null;

		// load high score from "localStorage"
		this.highScore = localStorage.getItem("highScore");
		if (this.highScore === null)
			this.highScore = -Infinity;  // if there is no high score yet
		else
			this.highScore = Number(this.highScore);  // convert string into Number
		
		// spawn "snake"
		this.snake.push({ x: 5, y: Math.floor(H/2) });  // doge head: snake[0]
		this.snake.push({ x: 4, y: Math.floor(H/2) });  // doge body: snake[i] where i > 0
		this.snake.push({ x: 3, y: Math.floor(H/2) });

		// spawn inital food
		for (let i = 1; i <= initialFoodCount; i++)
			this.spawnCoin();
	}

	spawnCoin() {
		let x = Math.floor(Math.random() * this.W);
		let y = Math.floor(Math.random() * this.H);

		// food on snake bad
		for (let piece of this.snake) {
			if (piece.x === x && piece.y === y) {
				this.spawnCoin();
				return;  // end this function
			}
		}

		// food on food bad
		for (let piece of this.moneys) {
			if (piece.x === x && piece.y === y) {
				this.spawnCoin();
				return;  // end this function
			}
		}
		this.moneys.push({x: x, y: y});
	}

	deyDed() {
		this.gameOver = true;

		// update high score, maybe
		if (this.score > this.highScore) {
			this.highScore = this.score;
			localStorage.setItem("highScore", this.highScore);
			// console.log("New High Score: " + this.highScore);
		}
	}

	// called once per frame (before "draw") to update game state
	update() {
		// console.log(this.snake[0], this.dir, " <-- ", this.nextDir);
		let snake = this.snake;

		if (this.nextDir !== null) {
			this.dir = this.nextDir;   // update direction (only once per frame)
			this.nextDir = null;  // clear nextDir "buffer"
		}

		let tail = {
			x: snake[snake.length - 1].x,
			y: snake[snake.length - 1].y
		};

		if (this.dir !== null) {
			// move body of snake
			for (let i = snake.length - 1; i >= 1; i--) {
				snake[i].x = snake[i - 1].x;
				snake[i].y = snake[i - 1].y;
			}

			// move head snake
			if (this.dir == RIGHT)
				snake[0].x = snake[0].x + 1;
			else if (this.dir == LEFT)
				snake[0].x = snake[0].x - 1;
			else if (this.dir == UP)
				snake[0].y = snake[0].y - 1;
			else if (this.dir == DOWN)
				snake[0].y = snake[0].y + 1;
			
			//boom with self?
			for(let i = 1; i < snake.length; i++) {
				if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
					this.deyDed();
					return;  // nothing after deth
				}
			}
			//you did not look at the road!!! (boring version: you hit the edge of the screen)
			if (snake[0].y < 0 || snake[0].x < 0 || snake[0].y >= this.H || snake[0].x >= this.W) {
				this.deyDed();
				return;
			}
		}
		
		// boom with food?
		for (let i = 0; i < this.moneys.length; i++) {
			if (this.moneys[i].x === snake[0].x && this.moneys[i].y === snake[0].y) {
				this.moneys.splice(i, 1);
				snake.push(tail);
				this.spawnCoin()
				this.score += 69;
				if (this.onBoomWithFood !== null)
					this.onBoomWithFood({x: snake[0].x, y: snake[0].y});
				break;
			}
		}
	}

}

// Provides a GUI for a DogeTrain object
class DogeTrainGUI {

	constructor(dogeTrain, parentElement) {
		this.train = dogeTrain;
		
		// DOM (Document Object Model = HTML) and other JS stuff
		let canvas = parentElement.querySelector("#DogeTrain canvas");
		this.SIZE = {
			x: canvas.width / this.train.W,  // size of each "block" in px (horizontal)
			y: canvas.height / this.train.H  // size of each "block" in px (vertical)
		};
		this.SIZE.min = Math.min(this.SIZE.x, this.SIZE.y);
		this.SIZE.max = Math.max(this.SIZE.x, this.SIZE.y);
		this.SIZE.avg = (this.SIZE.x + this.SIZE.y) / 2;
		
		this.ctx = canvas.getContext("2d");

		this.scoreElement = parentElement.querySelector(".score");
		
		this.hsElement = parentElement.querySelector(".highscore");
		this.hsElement.innerText = this.train.highScore;

		this.intervalId = null;

		this.bestSongPlaying = false;
		this.nextMoney = 1000;  // score goal to play next MoneySound
		
		// controls
		let self = this;
		let train = this.train;
		document.addEventListener("keydown", function(event) {
			console.log(event.key);
			if (train.gameOver)
				location.reload();  // TODO
			
			if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") {
				if (train.dir !== DOWN) {
					train.nextDir = UP;
				}
				event.preventDefault();
			}
			else if ((event.key === "a" || event.key === "A" || event.key === "ArrowLeft")) {
				if (train.dir !== RIGHT) {
					train.nextDir = LEFT;
				}
				event.preventDefault();
			}
			else if ((event.key === "s" || event.key === "S" || event.key === "ArrowDown")) {
				if (train.dir !== UP) {
					train.nextDir = DOWN;
				}
				event.preventDefault();
			}
			else if ((event.key === "d" || event.key === "D" || event.key === "ArrowRight")) {
				if (train.dir !== LEFT) {
					train.nextDir = RIGHT;
				}
				event.preventDefault();
			}
			else if (event.key === " ") {
				self.playSound(airhornSound)
				event.preventDefault();
			}
			else {
				train.deyDed();
				self.stop();
			}
		});

		// event handlers
		this.train.onBoomWithFood = function(event) {
			self.boomWithFood(event);
		};
	}

	drawBackground() {
		this.ctx.fillStyle = "lightblue";
		this.ctx.fillRect(0, 0, 600, 600);
	}

	playSound(sound, startTime) {
		// if (sound !== oofSound)
		// 	return;
		
		if (startTime === undefined)
			startTime = 0;
		
		sound.pause();
		sound.currentTime = startTime;
		sound.play();
	}

	start(delay) {
		this.draw();

		let self = this;
		this.intervalId = setInterval(function() {
			self.train.update();
			self.draw();
		}, delay);
	}

	// called once per frame (after "update") to redraw GUI elements that may have changed
	draw() {
		this.hsElement.innerText = this.train.highScore;  // update hish score each frame. (TODO: make more efficient with "callback"/"event listener")

		if (this.train.gameOver) {
			this.stop();
			return;
		}

		let snake = this.train.snake;
		
		this.drawBackground();

		// how many extra pixels on each side?
		const MARGIN = {
			x: this.SIZE.x / 4,
			y: this.SIZE.y / 4
		};

		// draw food
		for (let piece of this.train.moneys) {
			this.ctx.drawImage( moneysImg,
					piece.x * this.SIZE.x - MARGIN.x,
					piece.y * this.SIZE.y - MARGIN.y,
					this.SIZE.x + 2 * MARGIN.x,
					this.SIZE.y + 2 * MARGIN.y );
		}

		// draw doge
		// draw head
		let piece = snake[0];
		this.ctx.drawImage( dogeRight,
				piece.x * this.SIZE.x - MARGIN.x,
				piece.y * this.SIZE.y - MARGIN.y,
				this.SIZE.x + 2 * MARGIN.x,
				this.SIZE.y + 2 * MARGIN.y );
		
		// draw body
		this.ctx.strokeStyle = "red";
		this.ctx.lineWidth = this.SIZE.avg / 3;
		this.ctx.beginPath();
		this.ctx.moveTo(this.SIZE.x * (snake[0].x + snake[1].x + 1)/2, this.SIZE.y * (snake[0].y + snake[1].y + 1)/2);
		for(let i=1; i+1 < snake.length; i++) {
			this.ctx.lineTo(this.SIZE.x * (snake[i].x + snake[i+1].x + 1)/2, this.SIZE.y * (snake[i].y + snake[i+1].y + 1)/2);
		}
		this.ctx.stroke();

		// update score every frame
		this.scoreElement.innerText = this.train.score;

		// ----- Music -----
		if (!this.bestSongPlaying && this.train.dir !== null) {
			this.playSound(bestSong, 0);
			this.playSound(youCantSeeMe)
			this.bestSongPlaying = true;
		}
		
		if (this.train.score >= this.nextMoney) {
			this.nextMoney += 1000;
			this.playSound(moneySound, 0);
		}
	}

	boomWithFood(event) {
		console.log(this);
		this.playSound(coinSound, 0.13);
	}

	stop() {
		clearInterval(this.intervalId);  // stop the "setInterval" loop
		if (this.train.gameOver) {
			this.drawBackground();
			this.ctx.drawImage(dedImg, 0, 0, 600, 600);
			
			this.playSound(oofSound, 0.5)
		}
	}
}


// -------------------- Extra stuff --------------------
function lerp(x_val, x0, y0, x1, y1) {
	let rate = (y1 - y0) / (x1 - x0);  // slope formula
	return rate * (x_val - x0) + y0;   // point-slope form
}

// settings
class Setting {
	constructor(name, initValue, onChange, valueTransform) {
		if (!valueTransform)
			valueTransform = (x) => x;  // identity function

		this.name = name;
		this.itemName = "setting." + this.name;  // name of this setting in "localStorage"
		this.initValue = initValue;
		this.valueTransform = valueTransform;
		this.slider = document.querySelector("#" + name);  // input type=range Element
		this.vis = document.querySelector(`label[for=${name}] .value`);  // "visible value" Element
		this.value = valueTransform(initValue);

		let self = this;
		function updateValue(event) {
			let value = event.currentTarget.value;
			self.vis.innerText = value;
			self.value = valueTransform(Number(value));
			localStorage.setItem(self.itemName, value);  // save new value to "localStorage"
			console.log(name, self.vis.innerText, self.value, localStorage.getItem(self.itemName));  // DEBUG
			if (onChange)
				onChange();
		}
		for (let eventType of ["mousemove", "change"]) {
			this.slider.addEventListener(eventType, updateValue);
		}
		
		// load previous setting value from "localStorage" or use default
		let storedValue = localStorage.getItem(this.itemName);
		if (storedValue !== null) {
			this.change(storedValue);
		} else {
			this.slider.value = initValue;
			this.vis.innerText = initValue;
		}
	}

	change(value) {
		this.slider.value = value;
		this.slider.dispatchEvent(new Event("change"));
	}

	reset() {
		this.change(this.initValue);
	}
}

let sizeSetting = null;
let speedSetting = null;
let foodSetting = null;

sizeSetting = new Setting("size", 20, function() {
	if (foodSetting !== null)
		foodSetting.updateMax();
	if (speedSetting !== null)
		speedSetting.value = speedSetting.valueTransform(Number(speedSetting.slider.value));
});

speedSetting = new Setting("speed", 20, null, function(x) {
	// x (parameter): value in slider, e.g. 1 to 100
	// y: time to travel across to world (in Hz = 1/seconds), e.g. (1/20, 4)
	// return: delay (in ms) for "setInterval()"
	let y = lerp(x, 1, 1/20.0, 100, 1/0.25);
	return 1000 / (sizeSetting.value * y);
});

foodSetting = new Setting("food", 10);
foodSetting.updateMax = function() {
	foodSetting.slider.max = sizeSetting.value * sizeSetting.value - 4;
	foodSetting.slider.value = Math.min(foodSetting.slider.value, foodSetting.slider.max);
	foodSetting.vis.innerText = foodSetting.slider.value;
	foodSetting.value = foodSetting.valueTransform(Number(foodSetting.slider.value));
};
foodSetting.updateMax();


// start game button
document.querySelector("#start").addEventListener("click", function() {
	let logic = new DogeTrain(sizeSetting.value, sizeSetting.value, foodSetting.value);
	let gui = new DogeTrainGUI(logic, document.querySelector("#DogeTrain"));
	gui.start(speedSetting.value);
	let button = document.querySelector("#start")
	button.disabled = true
});

// reset settings button
document.querySelector("#resetSettings").addEventListener("click", function() {
	for (let setting of [sizeSetting, speedSetting, foodSetting])
		setting.reset();
});

// Inital drawing on Canvas before "new DogeTrainGUI()" is instantiated (i.e. before the user clicks "start")
const dogeTrain = document.createElement("img");
dogeTrain.addEventListener("load", function() {
	let canvas = document.querySelector("#DogeTrain canvas")
	canvas.getContext("2d").drawImage(dogeTrain, 0, 0, canvas.width, canvas.height);
});

dogeTrain.src = "assets/DogeTrain.png";






// LINE 420