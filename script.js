// load up a hotspot tsv
// act columnarily on it
// for each COLUMN, find the ROW with the MAX value
// graph that (start with bar, then radial)
// stretch: bird name on hover

let maximumData;

const TOP_BIRD_INFO = {
  'American Crow': {
    imageUrl: './images/american_crow.jpg',
    palettePoints: { start: [1534, 1296], end: [2079, 491] },
    image: null,
    palette: null,
  },
  'American Robin': {
    imageUrl: './images/american_robin.jpg',
    palettePoints: { start: [712, 812], end: [1059, 280] },
    image: null,
    palette: null,
  },
  'Black-capped Chickadee': {
    imageUrl: './images/black_capped_chickadee.jpg',
    palettePoints: { start: [471, 422], end: [528, 137] },
    image: null,
    palette: null,
  },
  'American Goldfinch': {
    imageUrl: './images/american_goldfinch.jpg',
    // palettePoints: { start: [1088, 564], end: [793, 443] },
    palettePoints: { start: [734, 469], end: [920, 437] },
    image: null,
    palette: null,
  },
  'Blue Jay': {
    imageUrl: './images/blue_jay.jpg',
    palettePoints: { start: [536, 475], end: [958, 628] },
    image: null,
    palette: null,
  },
  'Canada Goose': {
    imageUrl: './images/canada_goose.jpg',
    palettePoints: { start: [838, 654], end: [1016, 31] },
    image: null,
    palette: null,
  },
};

let hoveredBirdName = null;

let blueJayImage;

// -----------------------------------
// ------- Lifecycle functions -------
// -----------------------------------

function preload() {
  loadTable('./data/wi_histogram.tsv', 'tsv', (data) => {
    maximumData = toMaximumInfoColumns(data, 2);
    console.debug({ maximumData })
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

  renderRadialChart(maximumData);
}

function windowResized() {
  const canvasHeight = windowHeight - 128;
  const canvasWidth = windowWidth - 64;

  resizeCanvas(canvasWidth, canvasHeight);
}

function draw() {
  // renderBarChart();
  // renderRadialChart();
}

// -----------------------------------
// ---------- Render functions ---------
// -----------------------------------

function renderRadialChart(preppedData) {
  const absoluteMaximum = max(preppedData.map((m) => m.maximum));
  const absoluteMinimum = min(preppedData.map((m) => m.maximum));

  background('lemonchiffon');

  const donutHole = 0.1;
  const chartDiameter = window.width / 2;
  textAlign(CENTER);

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
    console.debug(preppedData[index])
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
      0,
      chartDiameter / 2
    );

    console.debug(closestBirdName, { index, radius })

    push();

    translate(chartDiameter / 2, chartDiameter / 2);

    // go back a quarter circle
    rotate(theta - PI / 2);

    // this bumps the feathers to outside of the inner implicit circle
    translate(0, (chartDiameter * donutHole) / 2);

    // console.debug({ metadata })
    drawFeather(radius, metadata.palette);
    pop();
  }
}

function renderBarChart() {
  background('lemonchiffon');

  const maxWidth = width / maximumData.length;
  const gap = 2;
  const barWidth = maxWidth - gap;
  textAlign(CENTER);

  const rectData = [];

  // translate(50,50)
  // const absoluteMaximum = max(maximumData.map(m => m.maximum))

  for (let index = 0; index < maximumData.length; index += 1) {
    const { maximum, birdName } = maximumData[index];

    const xStart = maxWidth * index;
    const barHeight = -1 * map(maximum, 0, 1, 0, height);

    let tooltipText = '';

    if (mouseX > xStart && mouseX < xStart + barWidth) {
      if (mouseY < height && mouseY > barHeight) {
        hoveredBirdName = birdName;
        tooltipText = birdName;
      }
    }

    if (mouseX > width || mouseY > height || mouseY < 0 || mouseX < 0) {
      // reset view state
      tooltipText = '';
      hoveredBirdName = null;
    }

    text(tooltipText, width / 2, height / 6);

    rectData.push({ xStart, height, barWidth, barHeight, birdName });
  }

  for (const { xStart, height, barWidth, barHeight, birdName } of rectData) {
    push();

    if (birdName === hoveredBirdName) {
      fill('orange');
    } else {
      fill('plum');
    }

    // translate(xStart, 0)

    rect(xStart, height, barWidth, barHeight);
    // drawFeather(barHeight * -1 / 2);

    pop();
  }
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

  for (let columnIndex = 0; columnIndex < columnCount - 1; columnIndex += 1) {
    let currentColumns = [];
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

    columnarData.push(currentColumns);
  }

  // TODO: this shouldn't be necessary but it's fine for now
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

function drawFeather(_length, _colors) {
  push();
  scale(1, 2);
  drawFeatherSide(_length, _colors);
  scale(-2, 1);
  drawFeatherSide(_length, _colors);
  pop();
}

function drawFeatherSide(_length, _colors) {
  let hf = 0.5;
  let w = _length * 0.15;
  let h = _length * hf;
  let step = 5;
  let end = createVector(0, h);

  let stack = 0;
  let stuck = false;

  for (let i = 0; i < _length; i += step) {
    if (_colors) {
      stroke(_colors[floor(map(i, 0, _length, 0, _colors.length))]);
    }

    if (!stuck && random(100) < 10) {
      stuck = true;
    }

    if (stuck && random(100) < 20) {
      stuck = !stuck;
    }

    //three points
    let aw = sin(map(i, 0, _length, 0, PI)) * w;

    if (!stuck) {
      stack += step * hf + pow(i, 0.2) * 0.75 * hf;
    }

    let p0 = createVector(0, i * hf * 0.75);
    let p1 = createVector(aw, stack);
    let p2 = p1.lerp(end, map(i, 0, _length, 0, 1));

    if (i < _length * 0.1) {
      p2.x *= random(0.8, 1.2);
      p2.y *= random(0.8, 1.2);
    }

    noFill();

    beginShape();
    vertex(p0.x, p0.y);
    vertex(p1.x, p1.y);
    endShape();
  }
}

function createPalette(_img, _num, _start, _end) {
  let _pal = [];
  for (let i = 0; i < _num; i++) {
    let x = map(i, 0, _num, _start[0], _end[0]);
    let y = map(i, 0, _num, _start[1], _end[1]);
    _pal.push(_img.get(floor(x), floor(y)));
  }
  return _pal;
}
