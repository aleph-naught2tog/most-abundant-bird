// load up a hotspot tsv
// act columnarily on it
// for each COLUMN, find the ROW with the MAX value
// graph that (start with bar, then radial)
// stretch: bird name on hover

let maximumData;
const EXCLUDE_BIRDS = [
  'American Crow',
  'American Robin',
  'Black-capped chickadee',
  'American goldfinch',
  'blue jay',
  'canada goose',
];

let hoveredBirdName = null;

// -----------------------------------
// ------- Lifecycle functions -------
// -----------------------------------

function preload() {
  loadTable('./wi_histogram.tsv', 'tsv', (data) => {
    maximumData = toMaximumInfoColumns(data);
  });
}

function setup() {
  init()

  const canvasHeight = windowHeight - 128;
  const canvasWidth = windowWidth - 64;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas_container');

  // renderBarChart();
}

function windowResized() {
  const canvasHeight = windowHeight - 128;
  const canvasWidth = windowWidth - 64;

  resizeCanvas(canvasWidth, canvasHeight)

}

function draw() {
  renderBarChart();
}

// -------
function init() {
  class P5Interoperator extends EventTarget {

  }

  const op = new P5Interoperator();
  op.addEventListener('honk', (event) => {
    console.debug('honk from inside p5', event.detail)
  })

  window.__secret_p5_interop = op;
}

// -----------------------------------
// ---------- Render functions ---------
// -----------------------------------

function renderBarChart() {
  background('lemonchiffon');

  const maxWidth = width / maximumData.length;
  const gap = 0;
  const barWidth = maxWidth - gap;
  textAlign(CENTER)

  const rectData = []

  for (let index = 0; index < maximumData.length; index += 1) {
    const { maximum, birdName } = maximumData[index];

    const xStart = maxWidth * index;
    const barHeight = -1 * map(maximum, 0, 1, 0, height);

    let tooltipText = ''

    if (mouseX > xStart && mouseX < xStart + barWidth) {
      if (mouseY < height && mouseY > barHeight) {
        hoveredBirdName = birdName;
        tooltipText = birdName;
      }
    }

    if (mouseX > width || mouseY > height || mouseY < 0 || mouseX < 0) {
      // reset view state
      tooltipText = '';
      hoveredBirdName = null
    }

    // console.debug({mouseX, mouseY})

    text(tooltipText, width / 2, height / 6);

    rectData.push({ xStart, height, barWidth, barHeight, birdName  });
  }

  for (const {xStart, height, barWidth, barHeight, birdName } of rectData) {
    push()

    if (birdName === hoveredBirdName) {
      fill('orange')
    } else {
      fill('white')
    }

    rect(xStart, height, barWidth, barHeight)

    pop()
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
        // idea: let user pick maximum abundance
        if (datumAsFloat > 0.5) {
          continue;
        }

        currentColumns.push(datumAsFloat);
      } else {
        // // idea: let user pick which birds to exclude
        // if (EXCLUDE_BIRDS.some(ebn => datum.toLowerCase().startsWith(ebn.toLowerCase()))) {
        //   continue;
        // }

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
