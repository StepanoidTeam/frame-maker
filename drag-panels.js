// todo(vmyshko): unused, to delete?

///////////////////////////////
/////     drag panels     /////
///////////////////////////////

let boardIsMoving = false;

let initialDistance = 0;
let initialZoom = 100;
let initialX = 0;
let initialY = 0;

document.body.addEventListener('mousemove', moveBoard);
document.body.addEventListener('touchmove', moveBoard);

function moveBoard(e) {
  if (boardIsMoving) {
    const newX = e.clientX - initialX;
    const newY = e.clientY - initialY;
    $board.style.setProperty('--x', `${newX}px`);
    $board.style.setProperty('--y', `${newY}px`);
  }
}

$board.addEventListener('mousedown', (e) => {
  e.preventDefault();

  boardIsMoving = true;
  initialX =
    e.clientX - parseFloat(getComputedStyle($board).getPropertyValue('left'));
  initialY =
    e.clientY - parseFloat(getComputedStyle($board).getPropertyValue('top'));
  $board.classList.add('panning-active');

  document.body.addEventListener(
    'mouseup',
    (e) => {
      e.preventDefault();
      if (boardIsMoving) {
        boardIsMoving = false;
        $board.classList.remove('panning-active');
      }
    },
    { once: true }
  );
});
