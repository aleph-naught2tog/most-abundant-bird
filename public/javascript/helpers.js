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

function getCurrentOriginInCanvasCoords() {
  // https://stackoverflow.com/a/72160964
  const currentMatrix = drawingContext.getTransform();

  const x_0 = currentMatrix['e'];
  const y_0 = currentMatrix['f'];

  const x_1 = currentMatrix['a'] + currentMatrix['e'];
  const y_1 = currentMatrix['b'] + currentMatrix['f'];

  const scaleFactor = dist(x_0, y_0, x_1, y_1);

  let xOfOrigin = x_0 / scaleFactor;
  let yOfOrigin = y_0 / scaleFactor;

  return { x: xOfOrigin, y: yOfOrigin };
}
