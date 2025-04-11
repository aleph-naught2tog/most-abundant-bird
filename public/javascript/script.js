const BACKGROUND = 'lemonchiffon';
const DONUT_HOLE = 0.2;

let hoveredBirdName = null;
let maximumData;

let cachedFeathers;

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
  const canvasHeight = windowHeight - 128;
  const canvasWidth = windowWidth - 64;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas_container');

  maximumData = toMaximumInfoColumns(loadedTableData, 2);
  initPalettes();

  cachedFeathers = createFeathers(maximumData);

  background('lemonchiffon');

  const chartDiameter = window.width / 2;
  renderFeathers(chartDiameter);
}

function draw() {
  background('lemonchiffon');

  const chartDiameter = window.width / 2;

  renderFeathers(chartDiameter);
}

// -----------------------------------
// ---------- Render functions ---------
// -----------------------------------

function initPalettes() {
  for (const birdName in TOP_BIRD_INFO) {
    const metadata = TOP_BIRD_INFO[birdName];

    metadata.palette = createPalette(
      metadata.image,
      50,
      metadata.palettePoints.start,
      metadata.palettePoints.end
    );
  }
}

function renderFeathers(chartDiameter) {
  for (const feather of cachedFeathers) {
    push();

    translate(chartDiameter / 2, chartDiameter / 2);

    rotate(feather.angle);

    // this bumps the feathers to outside of the inner implicit circle
    translate(0, (chartDiameter * DONUT_HOLE) / 2);

    feather.draw();

    pop();
  }
}

function createFeathers(preppedData) {
  const absoluteMaximum = max(preppedData.map((m) => m.maximum));
  const absoluteMinimum = min(preppedData.map((m) => m.maximum));

  const feathers = [];

  const chartDiameter = window.width / 2;

  for (let index = 0; index < preppedData.length; index++) {
    const num = preppedData[index].maximum;
    const closestBirdName = Object.keys(TOP_BIRD_INFO).find((key) =>
      preppedData[index].birdName.toLowerCase().startsWith(key.toLowerCase())
    );

    if (!closestBirdName) {
      throw new Error(`Unexpected bird name: ${preppedData[index].birdName}`);
    }

    const metadata = TOP_BIRD_INFO[closestBirdName];

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

    // FIXME: why are we doing this twice
    feather.createBarbs(metadata.palette);
    feather.createBarbs(metadata.palette);

    feathers.push(feather);
  }

  return feathers;
}

function getRandomStrokeWeight() {
  const randomNumber = Math.random();
  const strokeWeight = map(randomNumber, 0, 1, 0.25, 1.5);

  return strokeWeight;
}

function getFeatherConfig (length) {
  const heightScale = 0.5;
  const featherWidth = length * 0.15;
  const featherHeight = length * heightScale;
  const step = floor(map(Math.random(), 0, 1, 3, 5, true));

  return {
    heightScale,
    featherWidth,
    featherHeight,
    step,
  };
};

// -----------------------------------
// ---------- Data functions ---------
// -----------------------------------

function toMaximumInfoColumns(tableData, chunkSize) {
  const [birdNames, ...columns] = parseToColumns(tableData, chunkSize);

  const maxInfo = columns.map((col) =>
    calculateMaximumFromColumn(col, birdNames)
  );

  return maxInfo;
}

function parseToColumns(tableData, chunkSize) {
  const columnCount = tableData.getColumnCount();
  const rowCount = tableData.getRowCount();

  const columnarData = [];

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const currentColumns = [];
    let monthlyTotal = 0;

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      let datum = tableData.get(rowIndex, columnIndex);

      if (columnIndex > 0) {
        const datumAsFloat = parseFloat(datum, 10);
        monthlyTotal += datumAsFloat;

        if (columnIndex % chunkSize === 0) {
          currentColumns.push(monthlyTotal);
          monthlyTotal = 0;
        }
      } else {
        currentColumns.push(datum);
      }
    }

    if (currentColumns.length > 0) {
      columnarData.push(currentColumns);
    }
  }

  return columnarData.filter((arr) => arr.length);
}

function calculateMaximumFromColumn(col, birdNames) {
  return col.reduce(
    ({ maximum, maximumIndex, birdName }, currentValue, currentIndex) => {
      if (currentValue >= maximum) {
        return {
          maximum: currentValue,
          maximumIndex: currentIndex,
          birdName: birdNames[currentIndex],
        };
      } else {
        return { maximum, maximumIndex, birdName };
      }
    },
    { maximum: -1, maximumIndex: -1, birdName: '' }
  );
}

////////// Not my functions

function createPalette(image, num, start, end) {
  let palette = [];

  for (let i = 0; i < num; i++) {
    let x = map(i, 0, num, start[0], end[0]);
    let y = map(i, 0, num, start[1], end[1]);

    palette.push(image.get(floor(x), floor(y)));
  }

  return palette;
}
