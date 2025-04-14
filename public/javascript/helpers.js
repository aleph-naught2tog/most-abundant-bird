/**
 * @typedef {{x: number, y: number}} Point
 */

/**
 *
 * @param {P5Image} image
 * @param {number} num
 * @param {number} start
 * @param {number} end
 * @returns {RGBColor[]} the array of colors
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

// TODO: if we track the transform matrix ourself, we can get rid of the context
// call here
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

/**
 */
function drawGradientLine(optionsOrGradient, { start, end }, thickness = 1) {
  let gradient;

  if (optionsOrGradient instanceof CanvasGradient) {
    gradient = optionsOrGradient;
  } else {
    const { startColor, endColor } = optionsOrGradient;

    gradient = createGradient(start, end, startColor, endColor);
  }

  const ctx = drawingContext;
  const originalStrokeStyle = ctx.strokeStyle;

  push();

  ctx.strokeStyle = gradient;

  strokeWeight(thickness);
  line(start.x, start.y, end.x, end.y);

  ctx.strokeStyle = originalStrokeStyle;

  pop();
}

function createGradient(
  { x: x_0, y: y_0 },
  { x: x_1, y: y_1 },
  startColor,
  endColor
) {
  const ctx = drawingContext;

  const gradient = ctx.createLinearGradient(x_0, y_0, x_1, y_1);
  const cssStartColor = `rgba(${startColor[0]}, ${startColor[1]}, ${
    startColor[2]
  }, ${map(startColor[3], 0, 255, 0, 1)})`;

  const cssEndColor = `rgba(${endColor[0]}, ${endColor[1]}, ${
    endColor[2]
  }, ${map(endColor[3], 0, 255, 0, 1)})`;

  gradient.addColorStop(0.5, cssStartColor);
  gradient.addColorStop(
    0.75,
    lerpColor(color(startColor), color(endColor), 0.5).toString()
  );
  gradient.addColorStop(1, cssEndColor);

  return gradient;
}
