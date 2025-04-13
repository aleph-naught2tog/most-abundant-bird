const ALPHA = 0.8;

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
   * @param {Object} options.data
   * @param {string} options.data.label
   * @param {number} options.data.value
   */
  constructor(options) {
    const {
      barbs,
      angle,
      colors,
      length,
      data: { label, value },
    } = options;
    // this is awkward but types!
    const defaultBarbs = /** @type {Array<Barb>} */ ([]);

    this.barbs = barbs ?? defaultBarbs;
    this.angle = angle;
    this.colors = colors;
    this.length = length;

    this.label = label;
    this.value = value;

    this.highlighted = false;
  }

  draw() {
    this._drawRachis();

    this._drawBarbs();

    this._drawAnnotation();
  }

  _drawBarbs() {
    const lengthDivider = floor(this.barbs.length / 2);

    const leftBarbs = this.barbs.slice(0, lengthDivider).reverse();
    const rightBarbs = this.barbs.slice(lengthDivider).reverse();

    push();
    scale(1, 2);

    for (const barb of leftBarbs) {
      barb.draw(this.highlighted);
    }

    scale(-2, 1);

    for (const barb of rightBarbs) {
      barb.draw(this.highlighted);
    }

    pop();
  }

  _getRachisColor() {
    const exemplarBarb = this.barbs[0];

    const red = exemplarBarb.color[0] / 1.25;
    const green = exemplarBarb.color[1] / 1.25;
    const blue = exemplarBarb.color[2] / 1.25;
    const alpha = exemplarBarb.color[3] * 0.85;

    return [red, green, blue, alpha];
  }

  _drawAnnotation() {
    /* REMEMBER: isMousePressed won't work if you aren't using `draw`! */

    // BUG: 10 works, but if it changes, the other things don't go well
    const radius = 10;

    const anchorLength = 30;
    // this must be less than the anchorLength
    const offsetFromFeatherTip = 10;

    const featherCircleCenter = {
      x: 0,
      y: this.length + anchorLength + offsetFromFeatherTip,
    };

    translate(featherCircleCenter.x, featherCircleCenter.y);
    drawOrigin();
    push();
    noFill();
    stroke('black');
    circle(0, 0, radius * 2);
    push();
    strokeWeight(4);

    const xStart = featherCircleCenter.x;

    // backs us to the radius + how long the anchor should be; offsetFromFeatherTip bumps us off the feather tip (we ADD it here instead of subtract because we are on the -Y axis, so this moves us back up)
    const yStart = -1 * (radius + anchorLength) + offsetFromFeatherTip;

    // lands us at the bottom point of the circle
    const yEnd = -1 * radius;

    pop();
    line(xStart, yStart, xStart, yEnd);
    pop();

    // this puts us with the text facing upwards for EVERY feather

    const mousePoint = { x: mouseX, y: mouseY };

    const originInCanvasCoords = getCurrentOriginInCanvasCoords();

    const isMouseWithinCircle = isPointInsideCircle(
      mousePoint,
      originInCanvasCoords,
      radius
    );

    this.highlighted = isMouseWithinCircle;

    if (isMouseWithinCircle) {
      rotate(TAU - this.angle);
      text(`${this.label}`, 20, -20);
      rotate(this.angle - TAU);

      push();
      noFill();
      stroke('cyan');
      strokeWeight(3);
      circle(0, 0, radius * 2);
      line(
        xStart,
        yStart,
        xStart,
        yEnd
      );
      pop();

      translate(-featherCircleCenter.x, -featherCircleCenter.y);
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
