const BACKGROUND = 'lemonchiffon';
const DONUT_HOLE = 0.2;
const CHUNK_SIZE = 2;
const COLOR_COUNT = 50;

let hoveredBirdName = null;
let maximumData;

let cachedFeathers;

// windowHeight will exist by the time this is called
const getCanvasHeight = () => windowHeight - 128;
const getCanvasWidth = () => windowWidth - 64;
const getChartDiameter = () => windowWidth / 2;

// -----------------------------------
// ------- Lifecycle functions -------
// -----------------------------------

// TODO: highlight chunk of circle -> pop out those feathers, dim other feathers

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
  const maxLength =  max(cachedFeathers.map(f => f.length))


  const chartDiameter = getChartDiameter()
  // push()
  // translate(chartDiameter / 2, chartDiameter / 3)
  // noFill()
  // circle(0, 0, DONUT_HOLE * maxLength * 2 - 20)
  // pop()


  // window.width is a p5 thing
  // const chartDiameter = getChartDiameter();
  drawFeathers(chartDiameter);
}

function draw() {
  // background(BACKGROUND);
  // const chartDiameter = getChartDiameter();
  // drawFeathers(chartDiameter);
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

    translate(chartDiameter / 2, chartDiameter / 3);

    rotate(feather.angle);

    // this bumps the feathers to outside of the inner implicit circle
    translate(0, (chartDiameter * DONUT_HOLE) / 2);

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
    const rotationAngle = theta - PI;

    const feather = new Feather({
      angle: rotationAngle,
      colors: metadata.palette,
      length: radius,
    });

    // QUESTION: why are we doing this twice
    feather.createBarbs(metadata.palette);
    feather.createBarbs(metadata.palette);

    feathers.push(feather);
  }

  return feathers;
}
