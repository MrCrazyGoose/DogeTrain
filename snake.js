// -------------------- game settings --------------------
const SIZE = 30;       // px
const DELAY = 75;      // ms
const FOOD_COUNT = 5;


// -------------------- DOM (Document Object Model = HTML) and other JS stuff --------------------
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let scoreElement = document.querySelector("#score");
let hsElement = document.querySelector("#highscore");
let intervalId = null;

// load images
const dedImg = document.createElement("img");
const moneysImg = document.createElement("img");
const dogeRight = document.createElement("img");

dedImg.src = "assets/gameover.jpg";
moneysImg.src = "assets/dogecoin.png";
dogeRight.src = "assets/dogeright.png";

// load song(s) and sound(s)
const bestSong = new Audio("assets/bestsong.mp3");
bestSong.loop = true;
bestSong.volume = 1;  // 1 is max, 0 is muted.
// bestSong.addEventListener("canplaythrough", function() {});


// -------------------- other constants --------------------
const H = canvas.height / SIZE;  // height in blocks
const W = canvas.width / SIZE;   // width in blocks

// enum ("enumeration")
const RIGHT = 1;
const DOWN = 2
const LEFT = 3;
const UP = 4;


// -------------------- variables representing the game state --------------------
let dir = null;
let snake = [];
let moneys = [];
let nextDir = null;  // the direction the snake should change to on next "frame", or null if no change in direction
let score = 420;
let highScore = 0;


// -------------------- graphics/UI functions --------------------
function drawBackground() {
	ctx.fillStyle = "lightblue";
	ctx.fillRect(0, 0, 600, 600);
}


// -------------------- game functions --------------------
function spawnCoin() {
	let x = Math.floor(Math.random() * W);
	let y = Math.floor(Math.random() * H);

	// food on snake bad
	for (let piece of snake) {
		if (piece.x === x && piece.y === y) {
			spawnCoin();
			return;  // end this function
		}
	}

	// food on food bad
	for (let piece of moneys) {
		if (piece.x === x && piece.y === y) {
			spawnCoin();
			return;  // end this function
		}
	}
	moneys.push({x: x, y: y});
}

function deyDed() {
	clearInterval(intervalId);  // stop the "setInterval" loop
	console.log("dey ded");
	drawBackground();
	ctx.drawImage(dedImg, 0, 0, 600, 600);

	// update high score, maybe
	if (score > highScore) {
		highScore = score;
		localStorage.setItem("highScore", highScore);
		hsElement.innerText = highScore;
		console.log("New High Score: " + highScore);
	}
}

function updateAndDraw() {
	// ----- Draw -----
	drawBackground();

	const N = SIZE/4;  // how many extra pixels on each side?

	// draw food
	for (let piece of moneys) {
		ctx.drawImage(moneysImg, piece.x * SIZE - N, piece.y * SIZE - N, SIZE + 2 * N, SIZE + 2 * N);
	}

	// draw doge
	// draw head
	let piece = snake[0];
	ctx.drawImage(dogeRight, piece.x * SIZE - N, piece.y * SIZE - 2, SIZE + 2 * N, SIZE + 2 *N);
	
	// draw body
	ctx.strokeStyle = "red";
	ctx.lineWidth = SIZE / 3;
	ctx.beginPath();
	ctx.moveTo(SIZE * (snake[0].x + snake[1].x + 1)/2, SIZE * (snake[0].y + snake[1].y + 1)/2);
	for(let i=1; i+1 < snake.length; i++) {
		ctx.lineTo(SIZE * (snake[i].x + snake[i+1].x + 1)/2, SIZE * (snake[i].y + snake[i+1].y + 1)/2);
	}
	ctx.stroke();


	// ----- Music -----
	if (dir !== null)
		bestSong.play();

	// ---- Update -----
	if (nextDir !== null) {
		dir = nextDir;   // update direction (only once per frame)
		nextDir = null;  // clear nextDir "buffer"
	}

	let tail = {
		x: snake[snake.length - 1].x,
		y: snake[snake.length - 1].y
	};

	if (dir !== null) {
		// move body of snake
		for (let i = snake.length - 1; i >= 1; i--) {
			snake[i].x = snake[i - 1].x;
			snake[i].y = snake[i - 1].y;
		}

		// move head snake
		if (dir == RIGHT)
			snake[0].x = snake[0].x + 1;
		else if (dir == LEFT)
			snake[0].x = snake[0].x - 1;
		else if (dir == UP)
			snake[0].y = snake[0].y - 1;
		else if (dir == DOWN)
			snake[0].y = snake[0].y + 1;
		
		//boom with self?
		for(let i = 1; i < snake.length; i++) {
			if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
				deyDed();
				return;  // nothing after deth
			}
		}
		//you did not look at the road!!! (boring version: you hit the edge of the screen)
		if (snake[0].y < 0 || snake[0].x < 0 || snake[0].y >= H || snake[0].x >= W) {
			deyDed();
			return;
		}
	}
	
	// boom with food?
	for (let i = 0; i < moneys.length; i++) {
		if (moneys[i].x === snake[0].x && moneys[i].y === snake[0].y) {
			moneys.splice(i, 1);
			snake.push(tail);
			spawnCoin()
			score += 69;
			scoreElement.innerText = score;
			break;
		}
	}
}

// -------------------- controlls --------------------
document.addEventListener("keydown", function(event) {
	// console.log(event.key);
	if ((event.key === "w" || event.key === "W" || event.key === "ArrowUp") && dir !== DOWN)
		nextDir = UP;
	else if ((event.key === "a" || event.key === "A" || event.key === "ArrowLeft") && dir !== RIGHT)
		nextDir = LEFT;
	else if ((event.key === "s" || event.key === "S" || event.key === "ArrowDown") && dir !== UP)
		nextDir = DOWN;
	else if ((event.key === "d" || event.key === "D" || event.key === "ArrowRight") && dir !== LEFT)
		nextDir = RIGHT;
});


// -------------------- Initialize game --------------------

// high score
highScore = localStorage.getItem("highScore");
if (highScore === null)
	highScore = -Infinity;  // if there is no high score yet
else
	highScore = Number(highScore);  // convert string into Number
hsElement.innerText = highScore;
console.log("High Score: " + highScore);

// spawn "snake"
snake.push({ x: 5, y: Math.floor(H/2) });  // doge head: snake[0]
snake.push({ x: 4, y: Math.floor(H/2) });  // doge body: snake[i] where i > 0
snake.push({ x: 3, y: Math.floor(H/2) });

// spawn inital food
for (let i=1;i<=FOOD_COUNT;i++)
	spawnCoin();

// -------------------- start game --------------------
updateAndDraw();
intervalId = setInterval(updateAndDraw, DELAY);