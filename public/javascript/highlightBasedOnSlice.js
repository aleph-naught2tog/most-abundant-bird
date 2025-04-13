function highlightBasedOnSlice() {
  cachedFeathers.forEach((f) => (f.highlighted = false));
  const mousePoint = { x: mouseX, y: mouseY };

  drawOrigin();

  const isMouseWithinBigFeatherCircle = isPointInsideCircle(
    mousePoint,
    getTranslationToCircleCenter(),
    getMaximumChartRadius() + EXTRA_DIAMETER / 2
  );

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

  const feather = cachedFeathers[floor(hoveredFeatherIndex)];

  // subtracting ANGLE_SLICED_WIDTH / 2 centers us, like the feather
  const angleBounds = {
    start: hoveredFeatherIndex * ANGLE_SLICED_WIDTH - ANGLE_SLICED_WIDTH / 2,
    end:
      (hoveredFeatherIndex + 1) * ANGLE_SLICED_WIDTH - ANGLE_SLICED_WIDTH / 2,
  };

  feather.highlighted =
    isMouseWithinBigFeatherCircle &&
    angleOfMouse < angleBounds.end &&
    angleOfMouse > angleBounds.start;
}
