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
  drawFeathers(chartDiameter);
  // drawGrid();
  // extraCircleCase();
}

function draw() {
  const chartDiameter = getChartDiameter();
  background(BACKGROUND);
  drawFeathers(chartDiameter);
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

    // // this bumps the feathers to outside of the inner implicit circle
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

function drawGrid() {
  push();
  stroke('darkgray');
  strokeWeight(2);

  for (let x = 0; x <= width; x += width / 8) {
    for (let y = 0; y <= width; y += height / 8) {
      line(x, 0, x, height);
      line(0, y, height, y);
    }
  }

  pop();
}

function drawCanvasPoint(x, y, desiredColor) {
  push();
  strokeWeight(15);
  const strokeC = desiredColor ?? color(0, 0, 255, 126);
  stroke(strokeC);

  point(x, y);
  pop();
}

function drawCirclePoint(x, y, desiredColor) {
  push();
  strokeWeight(25);
  const strokeC = desiredColor ?? color(0, 255, 0, 126);
  stroke(strokeC);

  point(x, y);
  pop();
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

  drawCanvasPoint(...circleCenterInCanvasCoords);
  drawCanvasPoint(...outInCanvasCoords);

  translate(translation.x, translation.y);

  drawCirclePoint(...circleCenterInCircleCoords);
  drawCirclePoint(outInCircleCoords.x, outInCircleCoords.y);

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

  drawCanvasPoint(...circleCenterInCanvasCoords);
  drawCanvasPoint(...outInCanvasCoords);

  // to circle coords
  translate(translation.x, translation.y);

  drawCirclePoint(...circleCenterInCircleCoords);
  drawCirclePoint(outInCircleCoords.x, outInCircleCoords.y);

  // BACK to canvas coords
  translate(-translation.x, -translation.y);
}

function extraCircleCase() {
  let coreCircleCenterInCanvasCoords = [width / 2, height / 2];
  let coreCircleCenterInCircleCoords = [0, 0];
  let coreCircleRadius = 200;

  let translation = {
    x: coreCircleCenterInCanvasCoords[0],
    y: coreCircleCenterInCanvasCoords[1],
  };

  const outInCanvasCoords = [200, 300];
  const outInCircleCoords = translatePoint(
    { x: outInCanvasCoords[0], y: outInCanvasCoords[1] },
    translation
  );

  const withinInCanvasCoords = [300, 500];
  const withinInCircleCoords = translatePoint(
    {
      x: withinInCanvasCoords[0],
      y: withinInCanvasCoords[1],
    },
    translation
  );

  drawCanvasPoint(...coreCircleCenterInCanvasCoords);
  drawCanvasPoint(...outInCanvasCoords);
  drawCanvasPoint(...withinInCanvasCoords);

  // to circle coords
  translate(translation.x, translation.y);

  noFill();
  circle(...coreCircleCenterInCircleCoords, coreCircleRadius * 2);
  drawCirclePoint(...coreCircleCenterInCircleCoords);
  drawCirclePoint(outInCircleCoords.x, outInCircleCoords.y);
  drawCirclePoint(withinInCircleCoords.x, withinInCircleCoords.y);

  const circles = [
    {
      x: coreCircleCenterInCircleCoords[0],
      y: coreCircleCenterInCircleCoords[1],
    },
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
        {
          x: coreCircleCenterInCircleCoords[0],
          y: coreCircleCenterInCircleCoords[1],
        },
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
  translate(anotherTranslation.x, anotherTranslation.y);
  // 0,0 is now at 100,300

  const extraCircleCenterPoint = { x: 100, y: -200 };
  // canvas coords: 600,500
  // move right 100, down 200 from 100,300
  const extraCircleRadius = 100;
  push();
  stroke('red');
  circle(
    extraCircleCenterPoint.x,
    extraCircleCenterPoint.y,
    extraCircleRadius * 2
  );
  pop();

  let totalTranslation = {
    x: translation.x + anotherTranslation.x,
    y: translation.y + anotherTranslation.y,
  };

  // expected:
  // x: 400 + 100, y: 400 + 300
  // x: 500, y: 700
  console.debug({ totalTranslation });

  drawCirclePoint(extraCircleCenterPoint.x, extraCircleCenterPoint.y, 'red');
  const translated = translatePoint(
    { x: 600, y: 500 },
    { x: totalTranslation.x, y: totalTranslation.y }
  );
  console.debug({ translated });

  drawCirclePoint(translated.x, translated.y, 'magenta');
  console.debug({ translated });

  const imaginedMousePoint = { x: 550, y: 450 };
  // console.debug(isPointInsideCircle(translated, extraCirclePoint, extraCircleRadius)) // true thank goodness
  const imaginedMousePointInCircleCoords = translatePoint(
    imaginedMousePoint,
    totalTranslation
  );

  drawCirclePoint(
    imaginedMousePointInCircleCoords.x,
    imaginedMousePointInCircleCoords.y,
    'plum'
  );

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

  drawCanvasPoint(100, 100);
}
