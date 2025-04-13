const BACKGROUND_COLOR = 'lemonchiffon';
const DONUT_HOLE = 0.2;

// upper limit is half the length of
const CHUNK_SIZE = 2;
const COLOR_COUNT = 50;
const GRAPH_ROTATION = Math.PI;

let hoveredBirdName = null;

let maximumData = null;

/** @type {Array<Feather>} */
let cachedFeathers = [];
let loadedTableData = null;

// NOTE: windowHeight will exist by the time this is called
// const getCanvasHeight = () => windowWidth / 2;
const getCanvasHeight = () => 700;
// const getCanvasWidth = () => windowWidth / 2;
const getCanvasWidth = () => 800;
const getMaximumChartDiameter = () => getCanvasWidth();

// -----------------------------------
// ------- Lifecycle functions -------
// -----------------------------------

function preload() {
  loadTable('/data/wi_histogram.tsv', (data) => {
    loadedTableData = data;
  });

  for (const birdName in BIRD_INFO) {
    const metadata = BIRD_INFO[birdName];

    metadata.image = loadImage(metadata.imageUrl);
  }
}

// BUG/PERFORMANCE: the first one you hover over takes the longest
function setup() {
  // this is the default, but good for clarity
  angleMode(RADIANS);

  const canvasHeight = getCanvasHeight();
  const canvasWidth = getCanvasWidth();

  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas_container');

  background(BACKGROUND_COLOR);

  maximumData = toMaximumInfoColumns(loadedTableData, CHUNK_SIZE);
  initPalettes();

  cachedFeathers = createFeathers(BIRD_INFO, maximumData);

  const chartDiameter = getMaximumChartDiameter();
  drawFeathers(chartDiameter);
}

function draw() {
  background(BACKGROUND_COLOR);

  const chartDiameter = getMaximumChartDiameter();
  drawFeathers(chartDiameter);
}

// -----------------------------------
// ---------- Render functions ---------
// -----------------------------------

function initPalettes() {
  for (const birdName in BIRD_INFO) {
    const metadata = BIRD_INFO[birdName];

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
 */
function drawFeathers(chartDiameter) {
  for (const feather of cachedFeathers) {
    push();

    const translationToCanvasCenter = {
      x: width / 2,
      y: height / 2,
    };

    // hmmmm, not sure this should be on feather, but does make it easier
    translate(translationToCanvasCenter.x, translationToCanvasCenter.y);

    push();
    noFill();
    circle(0, 0, chartDiameter * DONUT_HOLE);
    pop();

    rotate(feather.angle);

    const offset = 10;
    // translates us to the outside of the circle above
    const translationToDonutHoleEdge = {
      x: 0,
      y: (chartDiameter * DONUT_HOLE) / 2 + offset,
    };

    translate(translationToDonutHoleEdge.x, translationToDonutHoleEdge.y);

    feather.draw();

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
    const rotationAngle = theta - GRAPH_ROTATION;

    const feather = new Feather({
      angle: rotationAngle,
      colors: metadata.palette,
      length: radius,
      data: {
        label: closestBirdName,
        value: num
      }
    });

    // QUESTION: why are we doing this twice
    feather.createBarbs();
    feather.createBarbs();

    feathers.push(feather);
  }

  return feathers;
}
