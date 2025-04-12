/*
  Debug notes:
  * pages
    * debug.html uses the basic translation and point translation/checking code,
      and works as intended
    * index.html is the actual bird code, and is broken
  * we're calling the script once in `setup`
  * a fake mouse point is being used so we don't need the `draw` loop; it IS
    within the smallest circle at the top of the feather
  * the `isPointWithinCircle`, `translatePoint`, and `TranslationCoordinates` all work as intended in the `debug.html` file
  *  we're only rendering 2 feathers intentionally (so we can hardcode a fake mouse point we know is within bounds)

  The thing that is broken is that when we click with the mouse (this is
  currently a hardcoded fake mouse click within the top circle), the x
  coordinate translates correctly, but the y coordinate is super off.

  Specifically, the issue appears to be in Feather#_drawAnnotation.
*/

const BACKGROUND = 'lemonchiffon';
const DONUT_HOLE = 0.2;

// upper limit is half the length of
const CHUNK_SIZE = 24;
const COLOR_COUNT = 50;

let hoveredBirdName = null;

let maximumData = null;

/** @type {Array<Feather>} */
let cachedFeathers = [];
let loadedTableData = null;

// NOTE: windowHeight will exist by the time this is called
// const getCanvasHeight = () => windowWidth / 2;
const getCanvasHeight = () => 800;
// const getCanvasWidth = () => windowWidth / 2;
const getCanvasWidth = () => 800;
const getMaximumChartDiameter = () => getCanvasWidth();

const GRID_COUNT = getCanvasHeight() / 100;

let FAKE_MOUSE_POINT = { x: 410, y: 130 };

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

  drawGrid(GRID_COUNT);

  maximumData = toMaximumInfoColumns(loadedTableData, CHUNK_SIZE);
  initPalettes();

  const transCoords = TranslationCoordinates.createCoordinates();
  cachedFeathers = createFeathers(TOP_BIRD_INFO, maximumData, transCoords);
  // doing this so we can focus on 1
  cachedFeathers = [cachedFeathers[0]];

  const chartDiameter = getMaximumChartDiameter();
  drawFeathers(chartDiameter);

  alert('honk')

  push()
  stroke('magenta')
  strokeWeight(4)
  point(FAKE_MOUSE_POINT.x, FAKE_MOUSE_POINT.y);
  pop()
}

function draw() {
  // background(BACKGROUND);
  // // this is a singleton, so fine to call over and over
  // const transCoords = TranslationCoordinates.createCoordinates();
  // const chartDiameter = getChartDiameter();
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

/**
 * @param {number} chartDiameter
 * @param {TranslationCoordinates} transCoords
 */
function drawFeathers(chartDiameter) {
  drawCoordinatePoints('red');

  for (const feather of cachedFeathers) {
    push();

    const translationToCanvasCenter = {
      x: width / 2,
      y: height / 2,
    };

    // hmmmm, not sure this should be on feather, but does make it easier
    feather.translationCoordinates.addTranslation(translationToCanvasCenter);
    drawCoordinatePoints('orange');

    push();
    noFill();
    circle(0, 0, chartDiameter * DONUT_HOLE);
    pop();

    feather.translationCoordinates.addRotation(PI);
    drawCoordinatePoints('yellow');

    // translates us to the outside of the circle above
    const translationToDonutHoleEdge = {
      x: 0,
      y: (chartDiameter * DONUT_HOLE) / 2,
    };
    feather.translationCoordinates.addTranslation(translationToDonutHoleEdge);
    drawCoordinatePoints('lime');

    feather.draw();

    pop();
  }
}

function createFeathers(birdInfo, preppedData, transCoords) {
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
      translationCoordinates: transCoords,
    });

    // QUESTION: why are we doing this twice
    feather.createBarbs();
    feather.createBarbs();

    feathers.push(feather);
  }

  return feathers;
}
