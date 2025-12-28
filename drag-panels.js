///////////////////////////////
/////     drag panels     /////
///////////////////////////////

const body = document.querySelector("body");
const board = document.getElementById('canvas-panel');

let activatedMoving = true;
let boardIsMoving = false;

let initialDistance = 0;
let initialZoom = 100;
let initialX = 0;
let initialY = 0;

body.addEventListener('mousemove', moveBoard);
body.addEventListener('touchmove', moveBoard);

board.addEventListener('mousedown', (e) => {
  e.preventDefault();
  if (activatedMoving) {
    boardIsMoving = true;
    initialX = e.clientX - parseFloat(getComputedStyle(board).getPropertyValue('left'));
    initialY = e.clientY - parseFloat(getComputedStyle(board).getPropertyValue('top'));
    board.classList.add("panning-active");
  }
});

body.addEventListener('mouseup', (e) => {
  e.preventDefault();
  if (boardIsMoving) {
    boardIsMoving = false;
    board.classList.remove("panning-active");
  }
});

function moveBoard(e) {
  if (boardIsMoving) {
    const newX = e.clientX - initialX;
    const newY = e.clientY - initialY;
    board.style.setProperty('--x', `${newX}px`);
    board.style.setProperty('--y', `${newY}px`);
  }
}