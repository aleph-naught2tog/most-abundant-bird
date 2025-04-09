// load up a hotspot tsv
// act columnarily on it
// for each COLUMN, find the ROW with the MAX value
// graph that (start with bar, then radial)
// stretch: bird name on hover

let table;
let totalColumnCount;
let dataColumnCount;
let maxAbundanceData;

// -----------------------------------
// ------- Lifecycle functions -------
// -----------------------------------

function preload() {
  table = loadTable("./wi_histogram.tsv", "TSV", toColumns);
}

function setup() {
  const canvas = createCanvas(600, 400);
  canvas.parent("canvas_container");
}

// -----------------------------------
// -------- Custom functions ---------
// -----------------------------------

function toColumns() {
  columnCount = table.getColumnCount();
  rowCount = table.getRowCount();

  let columnarData = [];

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    let currentColumns = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const datum = table.get(rowIndex, columnIndex);
      console.debug({ datum });
      currentColumns.push(datum);
    }

    columnarData.push(currentColumns);
  }

  console.debug({ columnarData });
}
