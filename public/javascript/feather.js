const ALPHA = 0.9;

class Feather {
  // these are mostly for clarity
  barbs = [];
  angle = -1;
  colors = [[]];
  length = -1;

  /**
   * @param {Object} options
   * @param {Array<Barb>} options.barbs
   * @param {number} options.angle in radians
   * @param {number} options.length
   */
  constructor(options) {
    const { barbs, angle, colors, length, translationCoordinates } = options;
    // this is awkward but types!
    const defaultBarbs = /** @type {Array<Barb>} */ ([]);

    this.barbs = barbs ?? defaultBarbs;
    this.angle = angle;
    this.colors = colors;
    this.length = length;
  }

  draw() {
    const lengthDivider = floor(this.barbs.length / 2);

    const leftBarbs = this.barbs.slice(0, lengthDivider);
    const rightBarbs = this.barbs.slice(lengthDivider);

    push();
    scale(1, 2);

    for (const barb of leftBarbs) {
      barb.draw();
    }

    scale(-2, 1);

    for (const barb of rightBarbs) {
      barb.draw();
    }
    pop();

    this._drawRachis();

    this._drawAnnotation();
  }

  _getRachisColor() {
    const exemplarBarb = this.barbs[0];

    const red = exemplarBarb.color[0] / 1.25;
    const green = exemplarBarb.color[1] / 1.25;
    const blue = exemplarBarb.color[2] / 1.25;
    const alpha = exemplarBarb.color[3] * 0.95;

    return [red, green, blue, alpha];
  }

  // THIS is the failure spot
  _drawAnnotation() {
    /* REMEMBER: isMousePressed won't work if you aren't using `draw`! */

    // translate to the tip of the feather
    const translationToFeatherTip = { x: 0, y: this.length };
    translate(translationToFeatherTip.x, translationToFeatherTip.y);

    // https://stackoverflow.com/a/72160964
    // a c e
    // b d f
    // 0 0 1
    // x_new = a x + c y + e
    // y_new = b x + d y + f
    // origin - current point - is then at:
    // x = a.0 + c.0 + e = e
    // y = b.0 + d.0 + f = f
    let matrix = drawingContext.getTransform();
    let x_0 = matrix['e'];
    let y_0 = matrix['f'];
    let x_1 = matrix['a'] + matrix['e'];
    let y_1 = matrix['b'] + matrix['f'];

    // However, the context has media coordinates, not p5. taking
    // the distance between points lets use determine the
    // scale assuming x and y scaling is the same.
    let media_per_unit = dist(x_0, y_0, x_1, y_1);
    // p5_current_x, p5_current_y is the p5 coords of our origin
    let p5_current_x = x_0 / media_per_unit;
    let p5_current_y = y_0 / media_per_unit;

    // we're still not in canvas coordinates, but our axes are back to normal now
    drawCoordinatePoints('cyan');

    const featherCircleCenter = { x: 0, y: 0 };
    const radius = this.length / 10;

    push();
    noFill();
    stroke('cyan');
    circle(featherCircleCenter.x, featherCircleCenter.y, radius * 2);
    pop();

    rotate(-GRAPH_ROTATION);

    if (mouseIsPressed) {
      const mousePoint = { x: mouseX, y: mouseY };

      const originInCanvasCoords = getCurrentOriginInCanvasCoords();

      const isMouseWithinCircle = isPointInsideCircle(
        mousePoint,
        originInCanvasCoords,
        radius
      );

      if (isMouseWithinCircle) {
        text('hello world', 20, 20);
      }
    }
  }

  _drawRachis() {
    const sw = map(this.length, 10, window.width / 4, 0.5, 1);
    strokeWeight(sw);
    stroke(this._getRachisColor());

    const rachisLength = this.length / 2;

    // draw a line from the outer circle to halfway up the feather
    line(0, 0, 0, rachisLength);
  }

  createBarbs() {
    const pointCount = this.length;
    const points = generatePoints(pointCount);

    for (const { p0, p2, index } of points) {
      const currentColor = getColorAtIndex(index, this.length, this.colors);
      const [r, g, b, _alpha] = currentColor;

      const scaledAlpha = map(ALPHA, 0, 1, 0, 255);
      const barb = new Barb({
        start: { x: p0.x, y: p0.y },
        end: { x: p2.x, y: p2.y },
        color: [r, g, b, scaledAlpha],
        thickness: getRandomStrokeWeight(),
      });

      this.barbs.push(barb);
    }
  }
}
