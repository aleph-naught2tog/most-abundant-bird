const ASPECT_RATIO = 7 / 5;
const BACKGROUND_COLOR = 'lemonchiffon';

const DONUT_HOLE = 0.2;
const EXTRA_DIAMETER = 100;
const OFFSET_FROM_INTERNAL_CIRCLE = 10;

const TOTAL_COUNT = 48;
// upper limit is half of TOTAL_COUNT
const CHUNK_SIZE = 2;
const COLOR_COUNT = 50;
const GRAPH_ROTATION = Math.PI;
const ANGLE_SLICED_WIDTH = (Math.PI * 2) / (TOTAL_COUNT / CHUNK_SIZE);

let internalCircleDiameter = -1;

let hoveredBirdName = null;

let maximumData = null;

/** @type {Array<Feather>} */
let cachedFeathers = [];
let loadedTableData = null;

const getCanvasHeight = () => {
  return windowHeight - 32;
};
const getCanvasWidth = () => {
  return getCanvasHeight() * ASPECT_RATIO;
};
const getMaximumChartRadius = () => {
  const baseWidth = (getCanvasHeight() / 2) * (1 - DONUT_HOLE);
  return baseWidth + (ANNOTATION_RADIUS - ANNOTATION_LINE_LENGTH);
};

const getTranslationToCircleCenter = () => ({
  x: width / 2,
  y: height / 2,
});

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
}

function draw() {
  background(BACKGROUND_COLOR);

  const maximumChartRadius = getMaximumChartRadius();
  drawMonths();
  drawFeathers(maximumChartRadius * 2);
}

function mouseMoved() {}

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
  internalCircleDiameter = chartDiameter * DONUT_HOLE;

  for (const feather of cachedFeathers) {
    push();

    const translationToCanvasCenter = getTranslationToCircleCenter();

    // hmmmm, not sure this should be on feather, but does make it easier
    translate(translationToCanvasCenter.x, translationToCanvasCenter.y);

    push();
    noFill();
    circle(0, 0, internalCircleDiameter);
    // circle(0, 0, getMaximumChartRadius() * 2 + EXTRA_DIAMETER);
    pop();

    rotate(feather.angle);

    // translates us to the outside of the circle above
    const translationToDonutHoleEdge = {
      x: 0,
      y: internalCircleDiameter / 2 + OFFSET_FROM_INTERNAL_CIRCLE,
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

  const maximumChartRadius = getMaximumChartRadius();

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
      maximumChartRadius,
      true
    );

    // we rotate back by PI because the feathers start at 0º
    const rotationAngle = theta - GRAPH_ROTATION;

    const feather = new Feather({
      angle: rotationAngle,
      colors: metadata.palette,
      length: radius,
      data: {
        label: closestBirdName,
        value: num,
      },
    });

    // QUESTION: why are we doing this twice
    feather.createBarbs();
    feather.createBarbs();

    feathers.push(feather);
  }

  return feathers;
}

function drawMonths() {
  const numberOfMonths = 12;
  const circleCenter = getTranslationToCircleCenter();

  for (let monthIndex = 1; monthIndex <= numberOfMonths; monthIndex += 1) {
    push();

    const theta = map(monthIndex, 0, numberOfMonths, 0, TAU) - PI / 2

    const date = new Date(1990, monthIndex, 10);  // 2009-11-10
    const month = date.toLocaleString('default', { month: 'short' }).slice(0,1);

    strokeWeight(2);
    text(
      month,
      circleCenter.x + cos(theta) * (internalCircleDiameter / 2),
      circleCenter.y + sin(theta) * (internalCircleDiameter / 2),
    );

    pop();
  }
}

/*
  const numberOfMonths = 12;
  const circleCenter = getTranslationToCircleCenter();
  translate(circleCenter.x, circleCenter.y)
  const angleVariation = TAU / 12;

  for (let index = 1; index <= numberOfMonths; index += 1) {
    push()

    const angle = index * angleVariation;
    rotate(angle);

    strokeWeight(4)
    stroke('magenta')
    text(index.toString(), 0,0)

    rotate(-angle);

    pop()
  }

  translate(-circleCenter.x, -circleCenter.y)
*/
