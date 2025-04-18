/**
 * @param {{x: number, y: number}} point to draw
 * @param {P5Color} desiredColor
 */
function drawProbablyGreenCanvasPoint({ x, y }, desiredColor) {
  push();
  strokeWeight(15);
  const strokeC = desiredColor ?? color(0, 255, 0, 120);
  stroke(strokeC);

  point(x, y);
  pop();
}

/**
 * @param {{x: number, y: number}} point to draw
 * @param {P5Color} desiredColor
 */
function drawProbablyBlueCirclePoint({ x, y }, desiredColor) {
  push();
  strokeWeight(25);
  const strokeC = desiredColor ?? color(0, 0, 255, 60);
  stroke(strokeC);

  point(x, y);
  pop();
}

/**
 * @param {number} gridCount
 */
function drawGrid(gridCount) {
  push();

  stroke('darkgray');
  strokeWeight(2);

  for (let x = 0; x <= width; x += width / gridCount) {
    for (let y = 0; y <= width; y += height / gridCount) {
      line(x, 0, x, height);
      line(0, y, height, y);
    }
  }

  pop();
}

/**
 * @param {ColorValue} strokeColor
 */
function drawCoordinatePoints(strokeColor) {
  push();

  stroke(strokeColor);
  strokeWeight(5);

  text('x=0,y=0', 0, 0);
  text('x=1,y=0', 100, 0);
  text('x=0,y=1', 0, 100);
  text('x=-1,y=0', -100, 0);
  text('x=0,y=-1', 0, -100);

  pop();
}

function drawOrigin() {
  push();
  noStroke()
  fill('orange');
  circle(0, 0, 4);
  pop();
}
