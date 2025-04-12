// const BACKGROUND = 'lemonchiffon';
const BACKGROUND = 'lightgray';
const DONUT_HOLE = 0.2;

// upper limit is half the length
const CHUNK_SIZE = 24;
const COLOR_COUNT = 50;

let hoveredBirdName = null;

let maximumData;
let cachedFeathers;
let loadedTableData;
let translationCoordinates = { x: 0, y: 0 };

// TODO: center at center
// TODO: is mouse within canvas

// end point of feather -- draw from there and do bird name
// pop the feather

// windowHeight will exist by the time this is called
// const getCanvasHeight = () => windowWidth / 2;
const getCanvasHeight = () => 800;
// const getCanvasWidth = () => windowWidth / 2;
const getCanvasWidth = () => 800;
const getChartDiameter = () => getCanvasWidth();

const GRID_COUNT = 8;

// -----------------------------------
// ------- Lifecycle functions -------
// -----------------------------------

function preload() {
  loadTable('/data/wi_histogram.tsv', 'tsv', (data) => {
    loadedTableData = data;
  });

  for (const birdName in TOP_BIRD_INFO) {
    const metadata = TOP_BIRD_INFO[birdName];

    metadata.image = loadImage(metadata.imageUrl);
  }
}

function setup() {
  // this is the default, but good for clarity
  angleMode(RADIANS);

  const canvasHeight = getCanvasHeight();
  const canvasWidth = getCanvasWidth();

  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas_container');

  background(BACKGROUND);

  maximumData = toMaximumInfoColumns(loadedTableData, CHUNK_SIZE);
  initPalettes();

  cachedFeathers = createFeathers(TOP_BIRD_INFO, maximumData);
  const chartDiameter = getChartDiameter();
  // drawFeathers(chartDiameter);
  // drawGrid();
  // drawFeathersInlineVersion()
  extraCircleCase();
}

function draw() {
  // const chartDiameter = getChartDiameter();
  // background(BACKGROUND);
  // drawFeathersInlineVersion(chartDiameter);
  // drawFeathers(chartDiameter)
}

// -----------------------------------
// ---------- Render functions ---------
// -----------------------------------

function initPalettes() {
  for (const birdName in TOP_BIRD_INFO) {
    const metadata = TOP_BIRD_INFO[birdName];

    metadata.palette = createPalette(
      metadata.image,
      COLOR_COUNT,
      metadata.palettePoints.start,
      metadata.palettePoints.end
    );
  }
}

function drawFeathers(chartDiameter) {
  for (const feather of cachedFeathers) {
    push();

    const firstTranslation = { x: chartDiameter / 2, y: chartDiameter / 2 };
    translate(firstTranslation.x, firstTranslation.y);
    translationCoordinates = {
      x: translationCoordinates.x + firstTranslation.x,
      y: translationCoordinates.y + firstTranslation.y,
    };

    rotate(feather.angle);

    // this bumps the feathers to outside of the inner implicit circle
    // const secondTranslationCoords = {
    //   x: 0,
    //   y: (chartDiameter * DONUT_HOLE) / 2,
    // };
    // translate(secondTranslationCoords.x, secondTranslationCoords.y)
    // translationCoordinates = {
    //   x: translationCoordinates.x + secondTranslationCoords.x,
    //   y: translationCoordinates.y + secondTranslationCoords.y,
    // };

    feather.draw();

    // reset the translation coordinates
    // if we weren't storing them, push/pop would take care of it, but we use these later
    translationCoordinates = {
      x: 0,
      y: 0,
    };

    pop();
  }
}

function createFeathers(birdInfo, preppedData) {
  const absoluteMaximum = max(preppedData.map((m) => m.maximum));
  const absoluteMinimum = min(preppedData.map((m) => m.maximum));

  const feathers = [];

  const chartDiameter = window.width / 2;

  for (let index = 0; index < preppedData.length; index++) {
    const num = preppedData[index].maximum;
    const closestBirdName = Object.keys(birdInfo).find((key) => {
      const birdName = preppedData[index].birdName;

      return birdName.toLowerCase().startsWith(key.toLowerCase());
    });

    if (!closestBirdName) {
      throw new Error(`Unexpected bird name: ${preppedData[index].birdName}`);
    }

    const metadata = birdInfo[closestBirdName];

    const theta = map(index, 0, preppedData.length, 0, TAU);
    const radius = map(
      num,
      absoluteMinimum,
      absoluteMaximum,
      10, // we start here so that even no feathers have a small indicator
      chartDiameter / 2
    );

    // we rotate back by PI because the feathers start at 0º
    const rotationAngle = theta - PI;

    const feather = new Feather({
      angle: rotationAngle,
      colors: metadata.palette,
      length: radius,
    });

    // QUESTION: why are we doing this twice
    feather.createBarbs();
    feather.createBarbs();

    feathers.push(feather);
  }

  return feathers;
}

function centeredCase() {
  let circleCenterInCanvasCoords = [width / 2, height / 2];
  let circleCenterInCircleCoords = [0, 0];

  let translation = { x: width / 2, y: height / 2 };
  const outInCanvasCoords = [200, 300];
  const outInCircleCoords = translatePoint(
    { x: outInCanvasCoords[0], y: outInCanvasCoords[1] },
    translation
  );

  drawProbablyGreenCanvasPoint(...circleCenterInCanvasCoords);
  drawProbablyGreenCanvasPoint(...outInCanvasCoords);

  translate(translation.x, translation.y);

  drawProbablyBlueCirclePoint(...circleCenterInCircleCoords);
  drawProbablyBlueCirclePoint(outInCircleCoords.x, outInCircleCoords.y);

  translate(-translation.x, -translation.y);
}

function uncenteredCase() {
  let circleCenterInCanvasCoords = [width / 2, height / 4];
  let circleCenterInCircleCoords = [0, 0];

  let translation = {
    x: circleCenterInCanvasCoords[0],
    y: circleCenterInCanvasCoords[1],
  };

  const outInCanvasCoords = [200, 300];
  const outInCircleCoords = translatePoint(
    { x: outInCanvasCoords[0], y: outInCanvasCoords[1] },
    translation
  );

  drawProbablyGreenCanvasPoint(...circleCenterInCanvasCoords);
  drawProbablyGreenCanvasPoint(...outInCanvasCoords);

  // to circle coords
  translate(translation.x, translation.y);

  drawProbablyBlueCirclePoint(...circleCenterInCircleCoords);
  drawProbablyBlueCirclePoint(outInCircleCoords.x, outInCircleCoords.y);

  // BACK to canvas coords
  translate(-translation.x, -translation.y);
}

function extraCircleCase() {
  drawGrid(GRID_COUNT);

  let coreCircleCenterInCanvasCoords = { x: width / 2, y: height / 2 };
  let coreCircleCenterInCircleCoords = { x: 0, y: 0 };
  let coreCircleRadius = 200;

  const outInCanvasCoords = { x: 200, y: 300 };
  const withinInCanvasCoords = { x: 300, y: 500 };

  drawProbablyGreenCanvasPoint(coreCircleCenterInCanvasCoords);
  drawProbablyGreenCanvasPoint(outInCanvasCoords);
  drawProbablyGreenCanvasPoint(withinInCanvasCoords);

  let translation = {
    x: coreCircleCenterInCanvasCoords.x,
    y: coreCircleCenterInCanvasCoords.y,
  };

  console.debug({ translation })
  // to circle coords
  translate(translation.x, translation.y);

  const outInCircleCoords = translatePoint(outInCanvasCoords, translation);
  const withinInCircleCoords = translatePoint(
    withinInCanvasCoords,
    translation
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
    if (
      isPointInsideCircle(
        { x, y },
        coreCircleCenterInCircleCoords,
        coreCircleRadius
      )
    ) {
      text('in', x, y);
    } else {
      text('out', x, y);
    }
    pop();
  }

  let anotherTranslation = { x: 100, y: 300 };

  let totalTranslation = {
    x: translation.x + anotherTranslation.x,
    y: translation.y + anotherTranslation.y,
  };

  translate(anotherTranslation.x, anotherTranslation.y);

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
    { x: totalTranslation.x, y: totalTranslation.y }
  );
  console.debug({ translated });

  drawProbablyBlueCirclePoint(translated, 'magenta');
  console.debug({ translated });

  const imaginedMousePoint = { x: 550, y: 450 };
  // console.debug(isPointInsideCircle(translated, extraCirclePoint, extraCircleRadius)) // true thank goodness
  const imaginedMousePointInCircleCoords = translatePoint(
    imaginedMousePoint,
    totalTranslation
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
  // we have to fold in ALL translations here
  translate(
    -translation.x - anotherTranslation.x,
    -translation.y - anotherTranslation.y
  );

  drawProbablyGreenCanvasPoint({x: 100, y: 100});
}

function drawFeathersInlineVersion(chartDiameter) {
  push();
  noFill();
  circle(
    getCanvasWidth() / 2,
    getCanvasHeight() / 2,
    chartDiameter * DONUT_HOLE
  );
  pop();

  for (const feather of cachedFeathers) {
    push();

    const firstTranslation = { x: chartDiameter / 2, y: chartDiameter / 2 };
    translate(firstTranslation.x, firstTranslation.y);
    translationCoordinates = {
      x: translationCoordinates.x + firstTranslation.x,
      y: translationCoordinates.y + firstTranslation.y,
    };

    rotate(feather.angle);

    // this bumps the feathers to outside of the inner implicit circle
    // This seems to be what messes things up.
    const secondTranslationCoords = {
      x: 0,
      y: (chartDiameter * DONUT_HOLE) / 2,
    };
    translate(secondTranslationCoords.x, secondTranslationCoords.y);
    translationCoordinates = {
      x: translationCoordinates.x + secondTranslationCoords.x,
      y: translationCoordinates.y + secondTranslationCoords.y,
    };

    const lengthDivider = floor(feather.barbs.length / 2);

    const leftBarbs = feather.barbs.slice(0, lengthDivider);
    const rightBarbs = feather.barbs.slice(lengthDivider);

    push();
    scale(1, 2);

    for (const barb of leftBarbs) {
      // --- barb.draw()
      push();

      strokeWeight(barb.thickness);
      stroke(barb.color);

      beginShape();
      vertex(barb.start.x, barb.start.y);
      vertex(barb.end.x, barb.end.y);
      endShape();

      pop();
    }

    scale(-2, 1);

    for (const barb of rightBarbs) {
      // ---- barb.draw()
      push();

      strokeWeight(barb.thickness);
      stroke(barb.color);

      beginShape();
      vertex(barb.start.x, barb.start.y);
      vertex(barb.end.x, barb.end.y);
      endShape();

      pop();
    }
    pop();

    // --- feather._drawRachis();
    const sw = map(feather.length, 10, window.width / 4, 0.5, 1);
    strokeWeight(sw);

    stroke(feather._getRachisColor());

    const yTranslation = feather.length;
    const translationToAnnotationCircleCenter = {
      x: 0,
      y: yTranslation,
    };

    translate(
      translationToAnnotationCircleCenter.x,
      translationToAnnotationCircleCenter.y
    );

    translationCoordinates = {
      x: translationCoordinates.x + translationToAnnotationCircleCenter.x,
      y: translationCoordinates.y + translationToAnnotationCircleCenter.y,
    };

    push();
    strokeWeight(5);
    stroke('magenta');
    point(0, 0);
    pop();

    noFill();
    line(0, 0, 0, -yTranslation);

    // --- feather._drawAnnotation();
    const featherCircleCenter = { x: 0, y: 0 };
    const radius = feather.length / 15;

    noFill();
    circle(featherCircleCenter.x, featherCircleCenter.y, radius * 2);

    const mousePoint = { x: mouseX, y: mouseY };
    const mousePointInCircleTerms = translatePoint(
      mousePoint,
      translationCoordinates
    );

    const isMouseWithinCircle = isPointInsideCircle(
      mousePointInCircleTerms,
      featherCircleCenter,
      radius
    );

    if (mouseIsPressed) {
      console.debug(radius, {
        mousePoint,
        mousePointInCircleTerms,
      });

      if (isMouseWithinCircle) {
        throw new Error('we did it!');
      }
    }

    // reset the translation coordinates
    // if we weren't storing them, push/pop would take care of it, but we use these later
    translate(0, 0);
    translationCoordinates = {
      x: 0,
      y: 0,
    };

    pop();
  }
}
