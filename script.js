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

  const columnarData = [];

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    let currentColumns = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      let datum = table.get(rowIndex, columnIndex);
      
      // this SHOULD just work where we parseFloat only if index > 0, but it... doesn't
      if (rowIndex === 0) {
        // // if we throw the datum here, we DO get the name of the bird
        // throw new Error(datum)
        // // if we do NOTHING, we get NaN, implying that we tried to parse the bird name
      } else {
        // when we log, we only ever see the numbers....
        // console.debug(datum);
        // 10 represents the base
        datum = parseFloat(datum, 10);
      }
      
      // when we do this, we only ever see the very first row's bird name
      // and then the rest of the time it's NaN
      isNaN(datum) && console.log({ datum });
      
      currentColumns.push(datum);
    }

    columnarData.push(currentColumns);
  }
  
  const [birdNames, ...columns] = columnarData;

  // skip the first column, it's all bird names
  for (const col of columns) {
    // find the index of the max
    // get the max
    // get the bird name for which the index corresponds
    const maximum = col.reduce(({ maximum, maximumIndex, birdName }, currentValue, currentIndex) => {
      if (currentValue >= maximum) {
        return {maximum: currentValue, maximumIndex: currentIndex, birdName: birdNames[currentIndex]};
      } else {
        return {maximum, maximumIndex, birdName };
      }
    }, {maximum: -1, maximumIndex: -1, birdName: null});
    
    // `birdName` is NaN
    console.debug({ maximum });
  }
}
