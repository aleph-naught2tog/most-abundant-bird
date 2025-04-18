const ALPHA = 0.8;
const SCALE_FACTOR = 1.05;

const ANNOTATION_RADIUS = 15;
const ANNOTATION_LINE_LENGTH = 30;
// this must be less than the anchorLength
const OFFSET_FROM_FEATHER_TIP = 5;

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
   * @param {string} options.data.commonName
   * @param {string} options.data.scientificName
   * @param {number} options.data.value
   */
  constructor(options) {
    const {
      barbs,
      angle,
      colors,
      length,
      data: { commonName, value, scientificName },
    } = options;
    this.barbs = barbs ?? [];
    this.angle = angle;
    this.colors = colors;
    this.length = length;

    this.commonName = commonName;
    this.scientificName = scientificName;
    this.value = value;

    this.highlighted = false;
    this.originInCanvasCoords = null;
  }

  draw() {
    this.highlighted = this._shouldBeHighlighted();

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

    if (!this.originInCanvasCoords) {
      this.originInCanvasCoords = getCurrentOriginInCanvasCoords();
    }

    const strokeColor = this.highlighted ? 'cyan' : 'black';
    const strokeThickness = this.highlighted ? 3 : 1;
    const offset = this.highlighted
      ? OFFSET_FROM_FEATHER_TIP * 2
      : OFFSET_FROM_FEATHER_TIP;

    push();
    noFill();
    stroke(strokeColor);
    strokeWeight(strokeThickness);
    circle(0, offset, ANNOTATION_RADIUS * 2);
    pop();

    translate(-annotationCircleCenter.x, -annotationCircleCenter.y);

    pop();
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
