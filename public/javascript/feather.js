const ALPHA = 0.8;
const SCALE_FACTOR = 1.05;

const ANNOTATION_RADIUS = 15;
const ANNOTATION_LINE_LENGTH = 30;
// this must be less than the anchorLength
const OFFSET_FROM_FEATHER_TIP = 15;

// TODO: feather outline? try with a minimal thing first.
//    I think that we can make an if...
//      1) we wrap the lines in a shape?
//      2) failing that, get all the end points, make them vertices

if (ANNOTATION_LINE_LENGTH <= OFFSET_FROM_FEATHER_TIP) {
  throw new Error('Your annotation line will not appear.');
}

class Feather {
  /**
   * @param {Object} options
   * @param {Array<Barb>} [options.barbs]
   * @param {number} options.angle in radians
   * @param {number} options.length
   * @param {Array<RGBColor>} options.colors;
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
    this.barbs = barbs ?? [];
    this.angle = angle;
    this.colors = colors;
    this.length = length;

    this.label = label;
    this.value = value;

    this.highlighted = false;
    this.originInCanvasCoords = null;
  }

  draw() {
    this.highlighted = this._shouldBeHighlighted();

    this._drawRachis();

    this._drawBarbs();

    this._drawAnnotation();
  }

  createBarbs() {
    const pointCount = this.length;
    const barbCount = generatePoints(this.length, pointCount);

    for (const { p0, p2, index } of barbCount) {
      const currentColor = getColorAtIndex(index, pointCount, this.colors);
      const [r, g, b, alpha = 255] = currentColor;

      const scaledAlpha = map(alpha, 0, 1, 0, 255);
      const barb = new Barb({
        start: { x: p0.x, y: p0.y },
        end: { x: p2.x, y: p2.y },
        color: [r, g, b, scaledAlpha],
        thickness: getRandomStrokeWeight(),
      });

      this.barbs.push(barb);
    }
  }

  _drawBarbs() {
    const lengthDivider = floor(this.barbs.length / 2);

    const leftBarbs = this.barbs.slice(0, lengthDivider).reverse();
    const rightBarbs = this.barbs.slice(lengthDivider).reverse();

    push();
    scale(1, 2);

    for (const barb of leftBarbs) {
      barb.draw(this.highlighted, SCALE_FACTOR);
    }

    scale(-2, 1);

    for (const barb of rightBarbs) {
      barb.draw(this.highlighted, SCALE_FACTOR);
    }

    pop();
  }

  _shouldBeHighlighted() {
    const mousePoint = { x: mouseX, y: mouseY };

    if (this.originInCanvasCoords) {
      const isMouseWithinCircle = isPointInsideCircle(
        mousePoint,
        this.originInCanvasCoords,
        ANNOTATION_RADIUS
      );

      if (shouldUseFeatherHover) {
        return isMouseWithinCircle || this.highlighted;
      }

      return isMouseWithinCircle;
    }

    return false;
  }

  _drawAnnotation() {
    /* REMEMBER: isMousePressed won't work if you aren't using `draw`! */

    push();

    const annotationCircleCenter = this._getAnnotationCenter();

    translate(annotationCircleCenter.x, annotationCircleCenter.y);

    push();
    noFill();
    stroke('black');
    circle(0, 0, ANNOTATION_RADIUS * 2);
    push();
    strokeWeight(4);

    const xStart = annotationCircleCenter.x;

    // backs us to the radius + how long the anchor should be;
    // offsetFromFeatherTip bumps us off the feather tip (we ADD it here instead
    // of subtract because we are on the -Y axis, so this moves us back up)
    const yStart =
      -1 * (ANNOTATION_RADIUS + ANNOTATION_LINE_LENGTH) +
      OFFSET_FROM_FEATHER_TIP;

    // lands us at the bottom point of the circle
    const yEnd = -1 * ANNOTATION_RADIUS;

    pop();
    line(xStart, yStart, xStart, yEnd);
    pop();

    // this puts us with the text facing upwards for EVERY feather

    if (!this.originInCanvasCoords) {
      this.originInCanvasCoords = getCurrentOriginInCanvasCoords();
    }

    if (this.highlighted) {
      push();
      noFill();
      stroke('cyan');
      strokeWeight(3);
      circle(0, 0, ANNOTATION_RADIUS * 2);
      line(xStart, yStart, xStart, yEnd);
      pop();

      translate(-annotationCircleCenter.x, -annotationCircleCenter.y);
    }

    pop();
  }

  _drawRachis() {
    push();
    const sw = map(this.length, 10, window.width / 4, 0.5, 1);
    strokeWeight(sw);
    stroke(this._getRachisColor());

    const rachisLength = this.length / 2;

    // draw a line from the outer circle to halfway up the feather
    line(0, 0, 0, rachisLength);
    pop();
  }

  /**
   *
   * @returns {RGBColor}
   */
  _getRachisColor() {
    const exemplarBarb = this.barbs[0];

    const [r, g, b, a = 255] = exemplarBarb.color;

    const red = r / 1.25;
    const green = g / 1.25;
    const blue = b / 1.25;
    const alpha = a * 0.85;

    return [red, green, blue, alpha];
  }

  _getAnnotationCenter() {
    const offset = this.highlighted ? 0 : 0;
    const totalLength = (this.length + ANNOTATION_LINE_LENGTH) * SCALE_SCALE;
    const y = totalLength + OFFSET_FROM_FEATHER_TIP + offset;

    return {
      x: 0,
      y,
    };
  }
}
