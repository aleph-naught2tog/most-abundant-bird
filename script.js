let hoveredBirdName = null;
let maximumData;

const cachedPoints = [];

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
    const rotationAngle = theta - PI;
    rotate(rotationAngle);

    const feather = new Feather({
      angle: theta,
      colors: metadata.palette,
      length: radius,
    });

    // this bumps the feathers to outside of the inner implicit circle
    translate(0, (chartDiameter * donutHole) / 2);

    const points = calculateFeatherPoints(feather, radius, metadata.palette);
    console.debug({ points })

    drawFeatherFromPoints(feather, radius);

    pop();
  }
}

function drawFeatherFromPoints(feather, radius) {
  const lengthDivider = floor(feather.barbs.length / 2);

  // TODO: put this on feather
  const leftBarbs = feather.barbs.slice(0, lengthDivider);
  const rightBarbs = feather.barbs.slice(lengthDivider);

  scale(1, 2);

  for (const { start, end, color, thickness } of leftBarbs) {
    push();

    strokeWeight(thickness);
    stroke(color);

    beginShape();
    vertex(start.x, start.y);
    vertex(end.x, end.y);
    endShape();

    pop();
  }

  scale(-2, 1);

  for (const { start, end, color, thickness } of rightBarbs) {
    push();

    strokeWeight(thickness);
    stroke(color);

    beginShape();
    vertex(start.x, start.y);
    vertex(end.x, end.y);
    endShape();

    pop();
  }

  strokeWeight(map(radius, 10, window.width / 2 / 2, 0.5, 1.5));
  stroke([
    leftBarbs[0].color[0] / 1.25,
    leftBarbs[0].color[1] / 1.25,
    leftBarbs[0].color[2] / 1.25,
    leftBarbs[0].color[3] * 0.95,
  ]);
  line(0, -2, 0, radius / 2);
}

function getRandomStrokeWeight() {
  const randomNumber = Math.random();
  const strokeWeight = map(randomNumber, 0, 1, 0.25, 1.5);

  return strokeWeight;
}

function calculateFeatherPoints(feather, length, colors) {
  const firstSide = calculateFeatherSidePoints(feather, length, colors);
  const secondSide = calculateFeatherSidePoints(feather, length, colors);

  return firstSide.concat(secondSide);
}

const getFeatherConfig = (length) => {
  const heightScale = 0.5;
  const featherWidth = length * 0.15;
  const featherHeight = length * heightScale;
  const step = floor(map(Math.random(), 0, 1, 3, 5));

  return {
    heightScale,
    featherWidth,
    featherHeight,
    step,
  };
};

function calculateFeatherSidePoints(feather, length, colors) {
  console.debug({ colors })
  // Thank you to Jer Thorp for the original version of this!

  console.debug({ feather, length })
  const { heightScale, featherWidth, featherHeight, step } =
    getFeatherConfig(length);
  let end = createVector(0, featherHeight);

  let stack = 0;
  let stuck = false;

  for (let i = 0; i < length; i += step) {
    console.debug({ i })
    let strokeColor;
    if (colors) {
      strokeColor = colors[floor(map(i, 0, length, 0, colors.length))];
    }
    console.debug({ strokeColor })

    if (!stuck && random(100) < 30) {
      stuck = true;
    }

    if (stuck && random(100) < 20) {
      stuck = !stuck;
    }

    // this tweaks the fullness of the feather / also a... twist
    const angle = map(i, 0, length, 0, PI);
    const aw = sin(angle) * featherWidth;

    if (!stuck) {
      stack += step * heightScale + pow(i, 0.2) * 0.75 * heightScale;
    }

    //three points
    const p0 = createVector(0, i * heightScale * 0.75);
    const p1 = createVector(aw, stack);
    const p2 = p1.lerp(end, map(i, 0, length, 0, 1));

    if (i < length * 0.1) {
      p2.x *= random(0.8, 1.2);
      p2.y *= random(0.8, 1.2);
    }
    console.debug({ i })

    const barb = new Barb({
      start: { x: p0.x, y: p0.y },
      end: { x: p1.x, y: p1.y },
      color: strokeColor,
      thickness: getRandomStrokeWeight(),
    });

    console.debug({ feather, barb })

    feather.barbs.push(barb);
  }

  console.debug({ feather });

  return feather.barbs;
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

// what does a feather have?
// points
// a rotation
// colors
// length
// a linear core
// BARBS

// what do barbs have?
// start point, end point
// a color
// a stroke weight
class Barb {
  start = { x: -1, y: -1 };
  end = { x: -1, y: -1 };
  color = [];
  thickness = -1;

  constructor(options) {
    if (options) {
      const { start, end, color, thickness } = options;
      this.start = start;
      this.end = end;
      this.color = color;
      this.thickness = thickness;
    }
  }
}

class Feather {
  barbs = [];
  angle = -1;
  colors = [[]];
  length = -1;

  constructor(options) {
    if (options) {
      const { barbs, angle, colors, length } = options;
      this.barbs = barbs ?? [];
      this.angle = angle ?? -1;
      this.colors = colors ?? [[]];
      this.length = length ?? -1;
    }
  }
}
