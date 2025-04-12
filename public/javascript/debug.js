/**
 * @typedef {{x: number, y: number}} Point
 */

const translationCoordinates = {
  x: 0,
  y: 0,
};

class TranslationCoordinates {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  addTranslation({ x, y }) {
    // We must translate first or we end up translating too far
    translate(x, y);

    this.x += x;
    this.y += y;
  }

  getCurrentTranslation() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  revertTranslation() {
    const { x, y } = { x: -this.x, y: -this.y };

    translate(x, y);

    this.x += x;
    this.y += y;
  }
}

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

  const transCoords = new TranslationCoordinates();

  // NO TRANSLATION
  let coreCircleCenterInCanvasCoords = { x: width / 2, y: height / 2 };
  let coreCircleCenterInCircleCoords = { x: 0, y: 0 };
  let coreCircleRadius = 200;

  const outInCanvasCoords = { x: 200, y: 300 };
  const withinInCanvasCoords = { x: 300, y: 500 };

  drawProbablyGreenCanvasPoint(coreCircleCenterInCanvasCoords);
  drawProbablyGreenCanvasPoint(outInCanvasCoords);
  drawProbablyGreenCanvasPoint(withinInCanvasCoords);

  const firstTranslation = {
    x: width / 2,
    y: height / 2,
  };

  // return;
  // FIRST TRANSLATION: center us in the grid
  transCoords.addTranslation(firstTranslation);

  const outInCircleCoords = translatePoint(
    outInCanvasCoords,
    transCoords.getCurrentTranslation()
  );

  const withinInCircleCoords = translatePoint(
    withinInCanvasCoords,
    transCoords.getCurrentTranslation()
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
  const anotherTranslation = { x: 100, y: 300 };

  // END FIRST TRANSLATION ONLY

  // FIRST TRANSLATION + SECOND TRANSLATION
  transCoords.addTranslation(anotherTranslation);

  // current translation: { x: 500, y: 700 }
  // the translations in both files are equal at this point
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

  drawProbablyBlueCirclePoint(extraCircleCenterPoint, 'red');

  const translated = translatePoint(
    { x: 600, y: 500 },
    transCoords.getCurrentTranslation()
  );

  drawProbablyBlueCirclePoint(translated, 'magenta');

  const imaginedMousePoint = { x: 550, y: 450 };

  const imaginedMousePointInCircleCoords = translatePoint(
    imaginedMousePoint,
    transCoords.getCurrentTranslation()
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
  transCoords.revertTranslation();

  drawProbablyGreenCanvasPoint({ x: 100, y: 100 });
}

// ---------
