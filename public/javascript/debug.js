/**
 * @typedef {{x: number, y: number}} Point
 */

const translationCoordinates = {
  x: 0,
  y: 0,
};

/**
 * @param {Point} point
 */
const addTranslation = ({ x, y }) => {
  translationCoordinates.x += x;
  translationCoordinates.y += y;

  _doTranslation();
};

/**
 * Sets the translation coordinates back to 0,0 (aka a noop).
 */
const resetTranslationCoordinates = () => {
  translationCoordinates.x = 0;
  translationCoordinates.y = 0;
};

/**
 * Sets the translation to the INVERSE of the current translation and applies.
 */
const invertTranslation = () => {
  translationCoordinates.x = -1 * translationCoordinates.x;
  translationCoordinates.y = -1 * translationCoordinates.y;

  _doTranslation();
};

const resetTranslation = () => {
  invertTranslation();
  resetTranslationCoordinates();
};

const getCurrentTranslation = () => translationCoordinates;

const _doTranslation = () => {
  const { x, y } = translationCoordinates;

  translate(x, y);
};

// --------

const BACKGROUND = 'lightgray';
const GRID_COUNT = 8;

function setup() {
  angleMode(RADIANS);

  const canvasHeight = 800;
  const canvasWidth = 800;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas_container');

  background(BACKGROUND);
  debugDraw();
}

function draw() {
  // debugDraw()
}

function debugDraw() {
  background(BACKGROUND);
  drawGrid(GRID_COUNT);

  // NO TRANSLATION
  const coreCircleCenterInCanvasCoords = { x: width / 2, y: height / 2 };
  const coreCircleCenterInCircleCoords = { x: 0, y: 0 };
  const coreCircleRadius = 200;

  const outInCanvasCoords = { x: 200, y: 300 };

  const withinInCanvasCoords = { x: 300, y: 500 };

  drawProbablyGreenCanvasPoint(coreCircleCenterInCanvasCoords);
  drawProbablyGreenCanvasPoint(outInCanvasCoords);
  drawProbablyGreenCanvasPoint(withinInCanvasCoords);

  // FIRST TRANSLATION: center us in the grid
  addTranslation({
    x: width / 2,
    y: height / 2,
  });

  const outInCircleCoords = translatePoint(
    outInCanvasCoords,
    getCurrentTranslation()
  );

  const withinInCircleCoords = translatePoint(
    withinInCanvasCoords,
    getCurrentTranslation()
  );

  noFill();
  circle(
    coreCircleCenterInCircleCoords.x,
    coreCircleCenterInCircleCoords.y,
    coreCircleRadius * 2
  );

  drawProbablyBlueCirclePoint(coreCircleCenterInCircleCoords);
  drawProbablyBlueCirclePoint(outInCircleCoords);
  drawProbablyBlueCirclePoint(withinInCircleCoords);

  const circles = [
    coreCircleCenterInCircleCoords,
    outInCircleCoords,
    withinInCircleCoords,
  ];

  for (const { x, y } of circles) {
    push();

    textSize(20);
    fill('black');

    const isPointWithin = isPointInsideCircle(
      { x, y },
      coreCircleCenterInCircleCoords,
      coreCircleRadius
    );

    if (isPointWithin) {
      text('in', x, y);
    } else {
      text('out', x, y);
    }

    pop();
  }

  // END FIRST TRANSLATION ONLY

  // FIRST TRANSLATION + SECOND TRANSLATION
  // DEBUG: this is where things are falling apart
  addTranslation({ x: 100, y: 300 });
  console.debug(translatePoint({ x: 0, y: 0 }, getCurrentTranslation()));

  const extraCircleCenterPoint = { x: 100, y: -200 };
  const extraCircleRadius = 100;

  push();
  stroke('red');
  circle(
    extraCircleCenterPoint.x,
    extraCircleCenterPoint.y,
    extraCircleRadius * 2
  );
  pop();

  drawProbablyBlueCirclePoint(
    extraCircleCenterPoint,
    'red'
  );

  const translated = translatePoint(
    { x: 600, y: 500 },
    getCurrentTranslation()
  );

  drawProbablyBlueCirclePoint(translated, 'magenta');

  const imaginedMousePoint = { x: 550, y: 450 };

  const imaginedMousePointInCircleCoords = translatePoint(
    imaginedMousePoint,
    getCurrentTranslation()
  );

  drawProbablyBlueCirclePoint(imaginedMousePointInCircleCoords, 'plum');

  if (
    isPointInsideCircle(
      imaginedMousePointInCircleCoords,
      extraCircleCenterPoint,
      extraCircleRadius
    )
  ) {
    push();

    fill('rebeccapurple');
    textSize(20);
    text(
      "I'M IN",
      imaginedMousePointInCircleCoords.x,
      imaginedMousePointInCircleCoords.y
    );

    pop();
  }

  // BACK to canvas coords
  // resetTranslation();
  translate(0, 0);
  translationCoordinates.x = 0;
  translationCoordinates.y = 0;

  drawProbablyGreenCanvasPoint({ x: 100, y: 100 });
}

// ---------
