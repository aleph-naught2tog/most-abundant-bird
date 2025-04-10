let hoveredBirdName = null;
let maximumData;

const donutHole = 0.2;
let cachedFeathers;

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
  initPalettes();

  cachedFeathers = createFeathers(maximumData);

  background('plum');

  const chartDiameter = window.width / 2;
  renderFeathers(chartDiameter);
}

function draw() {
  background('plum');

  const chartDiameter = window.width / 2;
  console.debug({ chartDiameter })
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
    translate(0, (chartDiameter * donutHole) / 2);

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
      absoluteMinimum, // This looks better, but gives us a 0 at the lowest
      absoluteMaximum,
      10,
      chartDiameter / 2
    );

    // QUESTION: why did I have to do this instead of theta - PI/2 to get a
    // normal "clock" alignment?
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

  draw() {
    push();

    strokeWeight(this.thickness);
    stroke(this.color);

    beginShape();
    vertex(this.start.x, this.start.y);
    vertex(this.end.x, this.end.y);
    endShape();

    pop();
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

  draw() {
    const lengthDivider = floor(this.barbs.length / 2);

    const leftBarbs = this.barbs.slice(0, lengthDivider);
    const rightBarbs = this.barbs.slice(lengthDivider);

    scale(1, 2);

    for (const barb of leftBarbs) {
      barb.draw();
    }

    scale(-2, 1);

    for (const barb of rightBarbs) {
      barb.draw();
    }
  }

  drawRachis() {
    const exemplarBarb = this.barbs[0];

    strokeWeight(map(this.length, 10, window.width / 2 / 2, 0.5, 1.5));
    stroke([
      exemplarBarb.color[0] / 1.25,
      exemplarBarb.color[1] / 1.25,
      exemplarBarb.color[2] / 1.25,
      exemplarBarb.color[3] * 0.95,
    ]);

    line(0, -2, 0, this.length / 2);
  }

  getColorAtIndex(i) {
    return this.colors[floor(map(i, 0, this.length, 0, this.colors.length))];
  }

  createBarbs() {
    const points = generatePoints(this.length);

    for (const { p0, p2, index } of points) {
      const barb = new Barb({
        start: { x: p0.x, y: p0.y },
        end: { x: p2.x, y: p2.y },
        color: this.getColorAtIndex(index),
        thickness: getRandomStrokeWeight(),
      });

      this.barbs.push(barb);
    }
  }
}

function* generatePoints(length) {
  const { heightScale, featherWidth, featherHeight, step } =
    getFeatherConfig(length);

  let end = createVector(0, featherHeight);

  let stack = 0;
  let stuck = false;

  for (let index = 0; index < length; index += step) {
    if (!stuck && random(100) < 30) {
      stuck = true;
    }

    if (stuck && random(100) < 20) {
      stuck = !stuck;
    }

    // this tweaks the fullness of the feather / also a... twist
    const angle = map(index, 0, length, 0, PI);
    const aw = sin(angle) * featherWidth;

    if (!stuck) {
      stack += step * heightScale + pow(index, 0.2) * 0.75 * heightScale;
    }

    //three points
    const p0 = createVector(0, index * heightScale * 0.75);
    const p1 = createVector(aw, stack);
    const p2 = p1.lerp(end, map(index, 0, length, 0, 1));

    if (index < this.length * 0.1) {
      p2.x *= random(0.8, 1.2);
      p2.y *= random(0.8, 1.2);
    }

    yield { p0, p2, index };
  }
}
