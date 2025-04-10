const TOP_BIRD_INFO = {
  'American Crow': {
    imageUrl:
      'https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/american_crow.jpg?v=1744300414058',
    palettePoints: { start: [1534, 1296], end: [2079, 491] },
    image: null,
    palette: null,
  },
  'American Robin': {
    imageUrl:
      'https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/american_robin.jpg?v=1744300413633',
    palettePoints: { start: [712, 812], end: [1059, 280] },
    image: null,
    palette: null,
  },
  'Black-capped Chickadee': {
    imageUrl:
      'https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/black_capped_chickadee.jpeg?v=1744300413387',
    palettePoints: { start: [471, 422], end: [528, 137] },
    image: null,
    palette: null,
  },
  'American Goldfinch': {
    imageUrl:
      'https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/american_goldfinch.jpg?v=1744300413049',
    palettePoints: { start: [734, 469], end: [920, 437] },
    image: null,
    palette: null,
  },
  'Blue Jay': {
    imageUrl:
      'https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/blue_jay.jpeg?v=1744300412701',
    palettePoints: { start: [536, 475], end: [958, 628] },
    image: null,
    palette: null,
  },
  'Canada Goose': {
    imageUrl:
      'https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/canada_goose.jpg?v=1744300382453',
    palettePoints: { start: [838, 654], end: [1016, 31] },
    image: null,
    palette: null,
  },
};

let hoveredBirdName = null;
let maximumData;

// -----------------------------------
// ------- Lifecycle functions -------
// -----------------------------------

function preload() {
  loadTable('./data/wi_histogram.tsv', 'tsv', (data) => {
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

  renderRadialChart(maximumData);
}

function windowResized() {}

function draw() {}

// -----------------------------------
// ---------- Render functions ---------
// -----------------------------------

function renderRadialChart(preppedData) {
  const absoluteMaximum = max(preppedData.map((m) => m.maximum));
  const absoluteMinimum = min(preppedData.map((m) => m.maximum));

  background('plum');

  const donutHole = 0.2;
  const chartDiameter = window.width / 2;

  for (const birdName in TOP_BIRD_INFO) {
    const metadata = TOP_BIRD_INFO[birdName];

    metadata.palette = createPalette(
      metadata.image,
      50,
      metadata.palettePoints.start,
      metadata.palettePoints.end
    );
  }

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
      absoluteMinimum, // This looks better, but gives us a 0 at the lowest
      absoluteMaximum,
      10,
      chartDiameter / 2
    );

    push();

    translate(chartDiameter / 2, chartDiameter / 2);

    // QUESTION: why did I have to do this instead of theta - PI/2 to get a
    // normal "clock" alignment?
    rotate(theta - PI);

    // this bumps the feathers to outside of the inner implicit circle
    translate(0, (chartDiameter * donutHole) / 2);

    const points = calculateFeatherPoints(radius, metadata.palette);

    drawFeatherFromPoints(points, radius);

    pop();
  }
}


function drawFeatherFromPoints(pointsArray, radius) {
  const lengthDivider = floor(pointsArray.length / 2);
  const leftHalf = pointsArray.slice(0, lengthDivider);
  const rightHalf = pointsArray.slice(lengthDivider);

  scale(1, 2);

  for (const { first, second } of leftHalf) {
    push();

    strokeWeight(getRandomStrokeWeight());
    stroke(first.strokeColor);

    beginShape();
    vertex(first.x, first.y);
    vertex(second.x, second.y);
    endShape();

    pop();
  }

  scale(-2, 1);

  for (const { first, second } of rightHalf) {
    push();

    strokeWeight(getRandomStrokeWeight());
    stroke(first.strokeColor);

    beginShape();
    vertex(first.x, first.y);
    vertex(second.x, second.y);
    endShape();

    pop();
  }

  strokeWeight(map(radius, 10, window.width / 2 / 2, 0.5, 1.5));
  stroke([
    leftHalf[0].first.strokeColor[0] / 1.25,
    leftHalf[0].first.strokeColor[1] / 1.25,
    leftHalf[0].first.strokeColor[2] / 1.25,
    leftHalf[0].first.strokeColor[3] * 0.95,
  ]);
  line(0, -2, 0, radius / 2);
}

function getRandomStrokeWeight() {
  const randomNumber = Math.random();
  const strokeWeight = map(randomNumber, 0, 1, 0.25, 1.5);

  return strokeWeight;
}

function calculateFeatherPoints(length, colors) {
  const firstSide = calculateFeatherSidePoints(length, colors);
  const secondSide = calculateFeatherSidePoints(length, colors);

  return firstSide.concat(secondSide);
}

function calculateFeatherSidePoints(length, colors = [[0, 0, 0, 255]]) {
  // Thank you to Jer Thorp for the original version of this!

  const heightScale = 0.5;
  const featherWidth = length * 0.15;
  const featherHeight = length * heightScale;
  const step = floor(map(Math.random(), 0, 1, 3, 5));
  const end = createVector(0, featherHeight);

  let stack = 0;
  let stuck = false;

  const featherPoints = [];

  for (let i = 0; i < length; i += step) {
    let strokeColor;
    if (colors) {
      strokeColor = colors[floor(map(i, 0, length, 0, colors.length))];
    }

    if (!stuck && random(100) < 10) {
      stuck = true;
    }

    if (stuck && random(100) < 20) {
      stuck = !stuck;
    }

    //three points
    let aw = sin(map(i, 0, length, 0, PI)) * featherWidth;

    if (!stuck) {
      stack += step * heightScale + pow(i, 0.2) * 0.75 * heightScale;
    }

    let p0 = createVector(0, i * heightScale * 0.75);
    let p1 = createVector(aw, stack);
    let p2 = p1.lerp(end, map(i, 0, length, 0, 1));

    if (i < length * 0.1) {
      p2.x *= random(0.8, 1.2);
      p2.y *= random(0.8, 1.2);
    }

    featherPoints.push({
      first: { x: p0.x, y: p0.y, strokeColor },
      second: { x: p1.x, y: p1.y, strokeColor },
    });
  }

  return featherPoints;
}

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

function createPalette(_img, _num, _start, _end) {
  let _pal = [];
  for (let i = 0; i < _num; i++) {
    let x = map(i, 0, _num, _start[0], _end[0]);
    let y = map(i, 0, _num, _start[1], _end[1]);
    _pal.push(_img.get(floor(x), floor(y)));
  }
  return _pal;
}
