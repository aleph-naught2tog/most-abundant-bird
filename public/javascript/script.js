const BACKGROUND_COLOR = 'lemonchiffon';

const DONUT_HOLE = 0.2;
const EXTRA_DIAMETER = 100;

// upper limit is half the length of
const TOTAL_COUNT = 48;
const CHUNK_SIZE = 2;
const COLOR_COUNT = 50;
const GRAPH_ROTATION = Math.PI;
const ANGLE_SLICED_WIDTH = (Math.PI * 2) / (TOTAL_COUNT / CHUNK_SIZE);

let internalCircleDiameter = -1;

let hoveredBirdName = null;

let maximumData = null;
let maximumFeatherRadius = -1;

/** @type {Array<Feather>} */
let cachedFeathers = [];
let loadedTableData = null;

// NOTE: windowHeight will exist by the time this is called
// const getCanvasHeight = () => windowWidth / 2;
const getCanvasHeight = () => 700;
// const getCanvasWidth = () => windowWidth / 2;
const getCanvasWidth = () => 800;
const getMaximumChartRadius = () => {
  const baseWidth = (getCanvasWidth() / 2) * (1 - DONUT_HOLE);
  return baseWidth + (ANNOTATION_RADIUS - ANNOTATION_LINE_LENGTH);
};

const getTranslationToCanvasCenter = () => ({
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
  drawFeathers(maximumChartRadius * 2);

  doMouseMove();
}

function mouseMoved() {
  // doMouseMove();
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

    const translationToCanvasCenter = getTranslationToCanvasCenter();

    // hmmmm, not sure this should be on feather, but does make it easier
    translate(translationToCanvasCenter.x, translationToCanvasCenter.y);

    internalCircleDiameter = chartDiameter * DONUT_HOLE;

    push();
    noFill();
    circle(0, 0, internalCircleDiameter);
    circle(0, 0, getMaximumChartRadius() * 2 + EXTRA_DIAMETER);
    pop();

    rotate(feather.angle);

    const offset = 10;
    // translates us to the outside of the circle above
    const translationToDonutHoleEdge = {
      x: 0,
      y: internalCircleDiameter / 2 + offset,
    };

    translate(translationToDonutHoleEdge.x, translationToDonutHoleEdge.y);

    feather.draw();

    pop();
  }
}

function doMouseMove() {
  cachedFeathers.forEach((f) => (f.highlighted = false));
  const mousePoint = { x: mouseX, y: mouseY };

  drawOrigin();

  const isMouseWithinBigFeatherCircle = isPointInsideCircle(
    mousePoint,
    getTranslationToCanvasCenter(),
    getMaximumChartRadius() + EXTRA_DIAMETER / 2
  );

  const trans = getTranslationToCanvasCenter();
  translate(trans.x, trans.y);
  // Get the mouse's coordinates relative to the origin.
  const x = mouseX - trans.x;
  const y = mouseY - trans.y;

  // Calculate the angle between the mouse and the origin. we need to rotate
  // by PI/2 because of how the unit circle differs from cartesian
  // coordinates doing the + TAU % TAU skips the discontinuities in atan2
  const angleOfMouse = (atan2(y, x) + TAU + PI / 2) % TAU;

  const hoveredFeatherIndex = map(
    angleOfMouse,
    0,
    TAU,
    0,
    cachedFeathers.length,
    true
  );

  const feather = cachedFeathers[floor(hoveredFeatherIndex)];

  // subtracting ANGLE_SLICED_WIDTH / 2 centers us, like the feather
  const angleBounds = {
    start: hoveredFeatherIndex * ANGLE_SLICED_WIDTH - ANGLE_SLICED_WIDTH / 2,
    end:
      (hoveredFeatherIndex + 1) * ANGLE_SLICED_WIDTH - ANGLE_SLICED_WIDTH / 2,
  };

  feather.highlighted =
    isMouseWithinBigFeatherCircle &&
    angleOfMouse < angleBounds.end &&
    angleOfMouse > angleBounds.start;
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
      10,
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
