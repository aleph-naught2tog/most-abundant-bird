/**
 * @typedef {{x: number, y: number}} Point
 */

/**
 * @param {P5Image} image
 * @param {number} colorCount
 * @param {[x: number, x: number]} start
 * @param {[y: number, y: number]} end
 * @returns {RGBColor[]} the array of colors
 */
function createPaletteFromImageByGet(image, colorCount, start, end) {
  // h/t to Jer Thorp for this!

  let palette = [];

  for (let i = 0; i < colorCount; i++) {
    let x = map(i, 0, colorCount, start[0], end[0]);
    let y = map(i, 0, colorCount, start[1], end[1]);

    palette.push(image.get(floor(x), floor(y)));
  }

  return palette;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} imageWidth
 * @returns
 */
const getStartIndex = (x, y, imageWidth) => (x + y * imageWidth) * 4;

/**
 *
 * @param {[number, number]} startPoint
 * @param {[number, number]} endPoint
 * @returns {(x: number) => number}
 */
const getLinearEquation = ([startX, startY], [endX, endY]) => {
  const slope = (endY - startY) / (endX - startX);
  const b = startY - slope * startX;
  const getYOnLine = (/** @type {number} */ x) => slope * x + b;

  return getYOnLine;
};

/**
 * @param {P5Image} image
 * @param {number} colorCount
 * @param {[x: number, y: number]} firstPoint
 * @param {[x: number, y: number]} secondPoint
 * @returns {RGBColor[]} the array of colors
 */
function createPaletteFromImageByPixelLoad(
  image,
  colorCount,
  firstPoint,
  secondPoint,
) {
  image.loadPixels();

  const imageWidth = image.width;
  const imagePixels = image.pixels;

  let startPoint;
  let endPoint;

  if (firstPoint[0] < secondPoint[0]) {
    startPoint = firstPoint;
    endPoint = secondPoint;
  } else {
    startPoint = secondPoint;
    endPoint = firstPoint;
  }

  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  const length = dist(startX, startY, endX, endY);

  const getYOnLine = getLinearEquation(startPoint, endPoint);

  const palette = [];

  const step = floor(length / (colorCount - 1)) || 1;

  for (let x = startX, index = 0; x < endX; x += step, index += 1) {
    const y = floor(getYOnLine(x));
    const startIndex = floor(getStartIndex(x, y, imageWidth));

    /** @type {RGBColor} */
    const color = [
      imagePixels[startIndex],
      imagePixels[startIndex + 1],
      imagePixels[startIndex + 2],
      imagePixels[startIndex + 3],
    ];

    palette[index] = color;
  }

  return palette;
}

/**
 * @param {number} index
 * @param {number} value
 * @param {RGBColor[]} colors
 */
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
  const strokeWeight = map(randomNumber, 0, 1, 0.1, 1);

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
