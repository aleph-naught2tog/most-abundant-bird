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

  const transCoords = TranslationCoordinates.createCoordinates();
  cachedFeathers = createFeathers(TOP_BIRD_INFO, maximumData, transCoords);

  const chartDiameter = getMaximumChartDiameter();
  drawFeathers(chartDiameter);
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
  for (const feather of cachedFeathers) {
    push();

    const translationToCanvasCenter = {
      x: width / 2,
      y: height / 2,
    };

    // hmmmm, not sure this should be on feather, but does make it easier
    feather.translationCoordinates.addTranslation(translationToCanvasCenter);

    push();
    noFill();
    circle(0, 0, chartDiameter * DONUT_HOLE);
    pop();

    rotate(feather.angle);

    // translates us to the outside of the circle above
    const translationToDonutHoleEdge = {
      x: 0,
      y: (chartDiameter * DONUT_HOLE) / 2,
    };
    feather.translationCoordinates.addTranslation(translationToDonutHoleEdge);

    feather.draw();

    pop();

    feather.translationCoordinates.revertTranslation();
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
