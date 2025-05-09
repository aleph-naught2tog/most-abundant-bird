const ASPECT_RATIO = 6 / 4;
const BACKGROUND_COLOR = 'lemonchiffon';

const DONUT_HOLE = 0.2;
const EXTRA_DIAMETER = 100;
const OFFSET_FROM_INTERNAL_CIRCLE = 10;

const TOTAL_COUNT = 48;
// upper limit is half of TOTAL_COUNT
const CHUNK_SIZE = 2;
const COLOR_COUNT = 1000;
const GRAPH_ROTATION = Math.PI;
const ANGLE_SLICED_WIDTH = (2 * Math.PI) / (TOTAL_COUNT / CHUNK_SIZE);

let COLOR_BLIND_MODE = false;

let internalCircleDiameter = -1;

let maximumData = null;

/** @type {Array<Feather>} */
let cachedFeathers = [];

/** * @type {P5Table} */
let loadedTableData;

/** @type {P5Element} */
let dataDisplayDiv;

/** @type {P5Element} */
let commonNameEl;

/** @type {P5Element} */
let scientificNameEl;

const getCanvasHeight = () => {
  return windowHeight;
};

const getCanvasWidth = () => {
  return windowWidth;
};

const getMaximumChartRadius = () => {
  const baseWidth = (getCanvasHeight() / 2) * (1 - DONUT_HOLE);
  return baseWidth + (ANNOTATION_RADIUS - ANNOTATION_LINE_LENGTH) + 100;
};

// TODO: deal with smaller sizes; can do conditionally
const getTranslationToCircleCenter = () => {
  return {
    x: width / 4,
    y: height / 3.25,
  };
};

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

function setup() {
  // this is the default, but good for clarity
  angleMode(RADIANS);

  textSize(20);
  textFont('Amarante');

  const canvasHeight = getCanvasHeight();
  const canvasWidth = getCanvasWidth();


  const getButtonText = () => COLOR_BLIND_MODE
  ? 'Bird-color mode'
  : 'Colorblind mode';
  const buttonText = getButtonText();

  let button = createButton(buttonText);
  button.position(24, canvasHeight - 128);

  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas_container');

  maximumData = toMaximumInfoColumns(loadedTableData, CHUNK_SIZE);
  initPalettes();

  cachedFeathers = createFeathers(BIRD_INFO, maximumData);

  button.mousePressed(() => {
    COLOR_BLIND_MODE = !COLOR_BLIND_MODE;
    cachedFeathers = createFeathers(BIRD_INFO, maximumData);
    button.elt.innerText = getButtonText();
  });

  const leftPos = getMaximumChartRadius() * 2 - 100;
  const section = createElement('section');
  section.position(leftPos, 50);

  const topHeader = createDiv(html`
    <header>
      <h1>Which birds are most observed over a year?</h1>
      <p>Wisconsin, 1900–2025</p>
    </header>
  `);

  section.child(topHeader);

  dataDisplayDiv = createDiv();
  section.child(dataDisplayDiv);

  dataDisplayDiv.class('data-display-container');

  commonNameEl = createElement('h2');
  commonNameEl.class('common-name');

  scientificNameEl = createElement('h3');
  scientificNameEl.class('scientific-name');

  dataDisplayDiv.child(commonNameEl);
  dataDisplayDiv.child(scientificNameEl);

  describe('a radial graph made out of feathers. In the center of the graph are the months, and each feather corresponds to a portion of the year. The feathers are colored to look like the feathers of the bird they represent -- blue jay feathers have lots of blue, white and black, goldfinch feathers much yellow, etc. On the right side, the text reads "Which birds are most observed over a years? Wisconsin, 1900 - 2025." When a feather is selected, the common name and scientific name of the bird are shown.');
}

function draw() {
  const maximumChartRadius = getMaximumChartRadius();
  background(BACKGROUND_COLOR);

  drawMonths();
  drawFeathers(maximumChartRadius * 2);
}

function mouseMoved() {
  highlightFeatherBasedOnSlice();
}

// -----------------------------------
// ---------- Render functions ---------
// -----------------------------------

function initPalettes() {
  const birdNames = Object.keys(BIRD_INFO);
  for (let index = 0; index < birdNames.length; index += 1) {
    const birdName = birdNames[index];
    const metadata = BIRD_INFO[birdName];
    if (metadata.image) {
      const colorBlindColor = COLOR_BLIND_PALETTE[index];

      if (!colorBlindColor) {
        throw new Error(`No colorblind color for index ${index}`);
      }

      metadata.colorBlindPalette = [colorBlindColor];

      metadata.imagePalette = createPaletteFromImageByPixelLoad(
        metadata.image,
        COLOR_COUNT,
        metadata.palettePoints.start,
        metadata.palettePoints.end
      );
    }
  }
}

/**
 * @param {number} chartDiameter
 */
function drawFeathers(chartDiameter) {
  internalCircleDiameter = chartDiameter * DONUT_HOLE;

  /** @type {Feather|null} */
  let highlightedFeather = null;

  for (const feather of cachedFeathers) {
    push();

    const translationToCanvasCenter = getTranslationToCircleCenter();

    translate(translationToCanvasCenter.x, translationToCanvasCenter.y);

    rotate(feather.angle);

    // translates us to the outside of the circle above
    const offset = feather.highlighted ? 10 : 0;
    const translationToDonutHoleEdge = {
      x: 0,
      y: internalCircleDiameter / 2 + OFFSET_FROM_INTERNAL_CIRCLE + offset,
    };

    translate(translationToDonutHoleEdge.x, translationToDonutHoleEdge.y);

    if (feather.highlighted) {
      highlightedFeather = feather;
      pop();
      continue;
    }

    feather.draw();

    translate(-translationToCanvasCenter.x, -translationToCanvasCenter.y);
    rotate(-feather.angle);

    pop();
  }

  if (highlightedFeather) {
    const featherOrigin = highlightedFeather.originInCanvasCoords;

    if (!featherOrigin) {
      return;
    }

    const theta = highlightedFeather.angle + PI / 2;
    const circleCenter = getTranslationToCircleCenter();

    const x =
      circleCenter.x +
      cos(theta) * (internalCircleDiameter / 2 + OFFSET_FROM_INTERNAL_CIRCLE);
    const y =
      circleCenter.y +
      sin(theta) * (internalCircleDiameter / 2 + OFFSET_FROM_INTERNAL_CIRCLE);

    translate(x, y);
    rotate(theta - PI / 2);

    highlightedFeather.draw();

    rotate(-theta - PI / 2);
    translate(-x, -y);

    commonNameEl.html(highlightedFeather.commonName);
    scientificNameEl.html(highlightedFeather.scientificName);
  }
}

/**
 * @param {Record<string, BirdMetadata>} birdInfo
 * @param {{ maximum: number, maximumIndex: number, birdName: string}[]} preppedData
 * @returns
 */
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
      colors: COLOR_BLIND_MODE
        ? metadata.colorBlindPalette
        : metadata.imagePalette,
      length: radius,
      highlightColor: metadata.highlightColor,
      data: {
        commonName: closestBirdName,
        value: num,
        scientificName: metadata.scientificName,
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

  describeElement('Months', 'A small circle showing each month as if around a clock, with rays radiating out from it.')

  for (let monthIndex = 1; monthIndex <= numberOfMonths; monthIndex += 1) {
    push();

    const theta = map(monthIndex, 0, numberOfMonths, 0, TAU) - PI / 2;

    const date = new Date(1990, monthIndex, 10); // 2009-11-10
    const month = date
      .toLocaleString('default', { month: 'long' })
      .slice(0, 1);

    describeElement(month, month)
    strokeWeight(2);
    textAlign(CENTER, CENTER);
    text(
      month,
      circleCenter.x + cos(theta) * (internalCircleDiameter / 2) * 0.8,
      circleCenter.y + sin(theta) * (internalCircleDiameter / 2) * 0.8
    );

    pop();
  }

  const bigDiameter = getMaximumChartRadius() * 2 + EXTRA_DIAMETER;

  push();
  stroke('#ffdea0');

  for (
    let theta = -ANGLE_SLICED_WIDTH / 2;
    theta < TAU;
    theta += ANGLE_SLICED_WIDTH / 4
  ) {
    const length = dist(circleCenter.x, circleCenter.y, 0, height);

    const xStart = circleCenter.x + cos(theta) * (internalCircleDiameter / 2);
    const yStart = circleCenter.y + sin(theta) * (internalCircleDiameter / 2);

    const xEnd = circleCenter.x + cos(theta) * (bigDiameter / 2) * length;
    const yEnd = circleCenter.y + sin(theta) * (bigDiameter / 2) * length;

    line(xStart, yStart, xEnd, yEnd);
  }

  noFill();
  circle(circleCenter.x, circleCenter.y, internalCircleDiameter);

  pop();
}
