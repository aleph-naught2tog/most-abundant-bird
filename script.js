// load up a hotspot tsv
// act columnarily on it
// for each COLUMN, find the ROW with the MAX value
// graph that (start with bar, then radial)
// stretch: bird name on hover

let maximumData;

const TOP_BIRD_INFO = {
  'American Crow': {
    imageUrl: './images/american_crow.jpg',
    palette: null,
    palettePoints: { start: [], end: [] },
  },
  'American Robin': {
    imageUrl: './images/american_robin.jpg',
    palettePoints: { start: [], end: [] },
  },
  'Black-capped Chickadee': {
    imageUrl: './images/black_capped_chickadee.jpg',
    palettePoints: { start: [], end: [] },
  },
  'American Goldfinch': {
    imageUrl: './images/american_goldfinch.jpg',
    palettePoints: { start: [], end: [] },
  },
  'Blue Jay': {
    imageUrl: './images/blue_jay.jpg',
    palettePoints: { start: [536, 475], end: [958, 628] },
  },
  'Canada Goose': {
    imageUrl: './images/canada_goose.jpg',
    palettePoints: { start: [], end: [] },
  },
};

let hoveredBirdName = null;

let blueJayImage;

// -----------------------------------
// ------- Lifecycle functions -------
// -----------------------------------

function preload() {
  loadTable('./data/wi_histogram.tsv', 'tsv', (data) => {
    maximumData = toMaximumInfoColumns(data);
    console.debug(groupByBirdName(maximumData));
  });

  blueJayImage = loadImage('./images/blue_jay.jpeg');

  const blueJayPalette = createPalette(
    blueJayImage,
    20,
    [536, 475],
    [958, 628]
  );
}

function setup() {
  const canvasHeight = windowHeight - 128;
  const canvasWidth = windowWidth - 64;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas_container');

  renderRadialChart();
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

function renderRadialChart() {
  const absoluteMaximum = max(maximumData.map((m) => m.maximum));
  const absoluteMinimum = min(maximumData.map((m) => m.maximum));
  console.debug({ absoluteMaximum, absoluteMinimum });

  background('lemonchiffon');
  // fill('plum');

  const donutHole = 0.2;
  const chartDiameter = window.width / 2;
  textAlign(CENTER);

  const palette = createPalette(blueJayImage, 20, [536, 475], [958, 628]);
  console.debug({ palette });

  for (let index = 0; index < maximumData.length; index++) {
    const num = maximumData[index].maximum;
    const theta = map(index, 0, 48, 0, TAU);
    const radius = map(num, 0, 1, 0, chartDiameter / 2);

    push();
    // going from 0 to absoluteMaximum is much tamer
    // but who wants that
    const strokeColor = color(
      map(num, absoluteMinimum, absoluteMaximum, 0, 360),
      100,
      100
    );
    stroke(strokeColor);
    translate(chartDiameter / 2, chartDiameter / 2);

    // go back a quarter circle
    rotate(theta - PI / 2);

    // this bumps the feathers to outside of the inner implicit circle
    translate(0, (chartDiameter * donutHole) / 2);

    drawFeather(radius, palette);
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

function toMaximumInfoColumns(tableData) {
  const [birdNames, ...columns] = parseToColumns(tableData);

  const maxInfo = columns.map((col) =>
    calculateMaximumFromColumn(col, birdNames)
  );

  return maxInfo;
}

function parseToColumns(tableData) {
  const columnCount = tableData.getColumnCount();
  const rowCount = tableData.getRowCount();

  const columnarData = [];

  for (let columnIndex = 0; columnIndex < columnCount - 1; columnIndex += 1) {
    let currentColumns = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      let datum = tableData.get(rowIndex, columnIndex);

      if (columnIndex > 0) {
        const datumAsFloat = parseFloat(datum, 10);
        currentColumns.push(datumAsFloat);
      } else {
        currentColumns.push(datum);
      }
    }

    columnarData.push(currentColumns);
  }

  return columnarData;
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

// this is just to see if there are any that just dominate everything
// like, say, a goose
function groupByBirdName(columnMaxes) {
  const result = columnMaxes.reduce((birdGrouping, currentMaxInfo) => {
    // I hate how the negation of `in` looks
    if (!(currentMaxInfo.birdName in birdGrouping)) {
      birdGrouping[currentMaxInfo.birdName] = 0;
    }

    birdGrouping[currentMaxInfo.birdName] += 1;

    return birdGrouping;
  }, {});

  return result;
}

//////////

function drawFeather(_length, _colors) {
  push();
  scale(1, 2);
  drawFeatherSide(_length, _colors);
  scale(-1, 1);
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
    // let vh = 200;
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
