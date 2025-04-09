// load up a hotspot tsv
// act columnarily on it
// for each COLUMN, find the ROW with the MAX value
// graph that (start with bar, then radial)
// stretch: bird name on hover

let maximumData;
const EXCLUDE_BIRDS = [
  "American Crow",
  "American Robin",
  "Black-capped chickadee",
  "American goldfinch",
  "blue jay",
  "canada goose",
];

// -----------------------------------
// ------- Lifecycle functions -------
// -----------------------------------

function preload() {
  loadTable("./wi_histogram.tsv", "tsv", (data) => {
    maximumData = toMaximumInfoColumns(data);
  });
}

function setup() {
  const canvas = createCanvas(600, 400);
  canvas.parent("canvas_container");

  renderBarChart();
}


// -----------------------------------
// ---------- Render functions ---------
// -----------------------------------

// function renderBarChart() {
//   for (const {  } of maximumData) {
    
//   }
// }

// -----------------------------------
// ---------- Data functions ---------
// -----------------------------------

function toMaximumInfoColumns(tableData) {
  const [birdNames, ...columns] = parseToColumns(tableData);

  const maxInfo = columns.map((col) =>
    calculateMaximumFromColumn(col, birdNames)
  );
  
  console.debug({ maxInfo })

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
        // if (datumAsFloat > 0.5) {
        //   continue;
        // }
        
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
    { maximum: -1, maximumIndex: -1, birdName: null }
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
