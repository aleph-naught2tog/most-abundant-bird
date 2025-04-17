// BUG: we only seem to care about the feather for half of it

function highlightFeatherBasedOnSlice() {
  cachedFeathers.forEach((f) => (f.highlighted = false));
  const mousePoint = { x: mouseX, y: mouseY };

  const isMouseWithinBigFeatherCircle = isPointInsideCircle(
    mousePoint,
    getTranslationToCircleCenter(),
    getMaximumChartRadius() + EXTRA_DIAMETER / 2
  );

  if (!isMouseWithinBigFeatherCircle) {
    return;
  }

  const trans = getTranslationToCircleCenter();
  translate(trans.x, trans.y);
  // Get the mouse's coordinates relative to the origin.
  const x = mouseX - trans.x;
  const y = mouseY - trans.y;

  // Calculate the angle between the mouse and the origin. we need to rotate
  // by PI/2 because of how the unit circle differs from cartesian
  // coordinates doing the + TAU % TAU skips the discontinuities in atan2
  const angleOfMouse = (atan2(y, x) + TAU + PI / 2) % TAU;

  const hoveredFeatherIndex = map(
    angleOfMouse,
    0,
    TAU,
    0,
    cachedFeathers.length,
    true
  );

  const feather =
    cachedFeathers[round(hoveredFeatherIndex) % cachedFeathers.length];

  if (!feather) {
    console.debug({
      mouseX,
      mouseY,
      hoveredFeatherIndex,
      r: round(hoveredFeatherIndex),
    });
    throw new Error('no feather');
  }

  const startAngle =
    hoveredFeatherIndex * ANGLE_SLICED_WIDTH - ANGLE_SLICED_WIDTH / 2;
  const endAngle = (hoveredFeatherIndex + 1) * ANGLE_SLICED_WIDTH;

  const angleBounds = {
    start: startAngle,
    end: endAngle,
  };

  feather.highlighted =
    isMouseWithinBigFeatherCircle &&
    angleOfMouse <= angleBounds.end &&
    angleOfMouse >= angleBounds.start;
}
