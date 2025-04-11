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

function getRandomStrokeWeight() {
  const randomNumber = Math.random();
  const strokeWeight = map(randomNumber, 0, 1, 0.25, 1.5);

  return strokeWeight;
}

/**
 * Creates an object of useful information for generating a feather.
 *
 * @param {number} length
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
 * The equation for a circle at (0,0) with radius `r` is:
  ```
  x**2 + y**2 === r**2
  ```

  The equation for a circle centered at `(centerX, centerY)` with radius `r` is:
  ```
  (x - centerX)**2 + (y - centerY)**2 === r**2
  ```

  We can also figure out the radius given a point on the line and the circle
  center by imagining a right triangle with two sides, one of the absolute value
  of `x` and one of the absolute value of `y`. That makes the radius the
  hypotenuse.

  In that case, by the Pythagorean theorem, we know we can find `r` by:
  ```
  sqrt( (x - centerX)**2 + (y - centerY)**2 ) === r
  ```

  If we have a point, we can make a line from that point to the center, since
  two points define a line. We can find the length of the line using the left
  half of the previous equation, and compare it to `r`. If it is greater than
  `r`, then we are outside the circle; if it's less than `r`, we are within the
  circle.

 * @param {Point} point the point we're checking
 * @param {Point} circleCenter the center of the circle
 * @param {number} circleRadius the radius of the circle
 *
 * @returns {boolean} whether the point is within the circle
 */
function isPointInsideCircle(point, circleCenter, circleRadius) {
  const { x: pointX, y: pointY } = point;
  const { x: centerX, y: centerY } = circleCenter;

  const xDistance = pointX - centerX;
  const yDistance = pointY - centerY;
  const distanceToPointFromCenter = sqrt(xDistance ** 2 + yDistance ** 2);

  return distanceToPointFromCenter < circleRadius;
}
