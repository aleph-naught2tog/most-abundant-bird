/**
 * @typedef {{x: number, y: number}} Point
 */

function createPalette(image, num, start, end) {
  // h/t to Jer Thorp for this!

  let palette = [];

  for (let i = 0; i < num; i++) {
    let x = map(i, 0, num, start[0], end[0]);
    let y = map(i, 0, num, start[1], end[1]);

    palette.push(image.get(floor(x), floor(y)));
  }

  return palette;
}

function getColorAtIndex(index, value, colors) {
  const colorIndex = floor(map(index, 0, value, 0, colors.length));

  return colors[colorIndex];
}

/**
 *
 * @returns {number} the random stroke weight
 */
function getRandomStrokeWeight() {
  const randomNumber = Math.random();
  const strokeWeight = map(randomNumber, 0, 1, 0.25, 1.5);

  return strokeWeight;
}

/**
 * Creates an object of useful information for generating a feather.
 *
 * @param {number} length
 *
 * @returns {{
 *  heightScale: number,
 *  featherWidth: number,
 *  featherHeight: number,
 *  step: number
 * }} a config of information about a feather
 */
function getFeatherConfig(length) {
  const heightScale = 0.5;
  const featherWidth = length * 0.15;
  const featherHeight = length * heightScale;
  const step = floor(map(Math.random(), 0, 1, 3, 5, true));
  // const step = 2;

  return {
    heightScale,
    featherWidth,
    featherHeight,
    step,
  };
}

/**
 * @param {{x: number, y: number}} point the point we're checking
 * @param {{x: number, y: number}} circleCenter the center of the circle
 * @param {number} circleRadius the radius of the circle
 *
 * @returns {boolean} whether the point is within the circle
 */
function isPointInsideCircle(point, circleCenter, circleRadius) {
  const distanceToPointFromCenter = dist(
    point.x,
    point.y,
    circleCenter.x,
    circleCenter.y
  );

  return distanceToPointFromCenter < circleRadius;
}

function drawProbablyGreenCanvasPoint({ x, y }, desiredColor) {
  push();
  strokeWeight(15);
  const strokeC = desiredColor ?? color(0, 255, 0, 120);
  stroke(strokeC);

  point(x, y);
  pop();
}

function drawProbablyBlueCirclePoint({ x, y }, desiredColor) {
  push();
  strokeWeight(25);
  const strokeC = desiredColor ?? color(0, 0, 255, 60);
  stroke(strokeC);

  point(x, y);
  pop();
}

const vecToPoint = ([x, y]) => ({ x, y });

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

function getCurrentOriginInCanvasCoords() {
  // https://stackoverflow.com/a/72160964
  // a c e
  // b d f
  // 0 0 1
  // x_new = a x + c y + e
  // y_new = b x + d y + f
  // origin - current point - is then at:
  // x = a.0 + c.0 + e = e
  // y = b.0 + c.0 + f = f
  let matrix = drawingContext.getTransform();

  let x_0 = matrix['e'];
  let y_0 = matrix['f'];

  let x_1 = matrix['a'] + matrix['e'];
  let y_1 = matrix['b'] + matrix['f'];
  // However, the context has media coordinates, not p5. taking
  // the distance between points lets use determine the
  // scale assuming x and y scaling is the same.
  let media_per_unit = dist(x_0, y_0, x_1, y_1);

  let p5_current_x = x_0 / media_per_unit;
  let p5_current_y = y_0 / media_per_unit;

  return { x: p5_current_x, y: p5_current_y };
}
