// -----------------------------------
// ---------- Data functions ---------
// -----------------------------------
/**
 *
 * @param {P5Table} tableData
 * @param {number} chunkSize
 * @returns {{ maximum: number; maximumIndex: number; birdName: string; }[]}}
 */
function toMaximumInfoColumns(tableData, chunkSize) {
  const { birdNames, columns } = parseToColumns(tableData, chunkSize);

  const maxInfo = columns.map((col) => {
    return calculateMaximumFromColumn(col, birdNames);
  });

  return maxInfo;
}

/**
 * @param {P5Table} tableData
 * @param {number} chunkSize
 * @returns {{ birdNames: string[], columns: number[][] }}
 */
function parseToColumns(tableData, chunkSize) {
  const columnCount = tableData.getColumnCount();
  const rowCount = tableData.getRowCount();

  const columnarData = [];

  const birdNames = [];

  // not sure why we need to do - 1 here, but
  for (let columnIndex = 0; columnIndex < columnCount - 1; columnIndex += 1) {
    const numericColumns = [];

    let monthlyTotal = 0;

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const datum = tableData.get(rowIndex, columnIndex);

      if (columnIndex > 0) {
        const datumAsFloat = parseFloat(datum.toString());
        monthlyTotal += datumAsFloat;

        if (columnIndex % chunkSize === 0) {
          numericColumns.push(monthlyTotal);
          monthlyTotal = 0;
        }
      } else {
        birdNames.push(datum.toString());
      }
    }

    if (numericColumns.length > 0) {
      columnarData.push(numericColumns);
    }
  }

  return { birdNames, columns: columnarData.filter((arr) => arr.length) };
}

/**
 *
 * @param {number[]} column
 * @param {string[]} birdNames
 * @returns {{ maximum: number; maximumIndex: number; birdName: string; }}
 */
function calculateMaximumFromColumn(column, birdNames) {
  return column.reduce(
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
