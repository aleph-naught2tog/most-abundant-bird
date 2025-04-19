const ALPHA = 0.8;

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
   * @param {ColorValue} options.highlightColor
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
      highlightColor,
      data: { commonName, value, scientificName },
    } = options;
    this.barbs = barbs ?? [];
    this.angle = angle;
    this.colors = colors;
    this.length = length;
    this.highlightColor = highlightColor;

    this.commonName = commonName;
    this.scientificName = scientificName;
    this.value = value;

    this.highlighted = false;
    this.originInCanvasCoords = null;
  }

  draw() {
    describeElement(
      `Feather`,
      `A feather representing the observations of ${this.commonName} (${
        this.scientificName
      }). The value is ${(this.value * 100).toFixed(2)}.${this.highlighted ? ' This feather is focused and vividly colored, with its names visible.': ''}`
    );
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
      barb.draw(this.highlighted);
    }

    scale(-2, 1);

    for (const barb of rightBarbs) {
      barb.draw(this.highlighted);
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

      return isMouseWithinCircle || this.highlighted;
    }

    return false;
  }

  _drawAnnotation() {
    push();

    const annotationCircleCenter = this._getAnnotationCenter();

    translate(annotationCircleCenter.x, annotationCircleCenter.y);

    if (!this.originInCanvasCoords) {
      this.originInCanvasCoords = getCurrentOriginInCanvasCoords();
    }

    const highlightedStrokeColor = COLOR_BLIND_MODE
      ? this.colors[0]
      : this.highlightColor;
    const strokeColor = this.highlighted ? highlightedStrokeColor : '#b4a386';
    const strokeThickness = this.highlighted ? 4 : 2;

    push();

    strokeWeight(strokeThickness);
    noStroke();

    stroke(strokeColor);
    fill(BACKGROUND_COLOR);
    circle(
      0,
      OFFSET_FROM_FEATHER_TIP + (this.highlighted ? 2 : 0),
      ANNOTATION_RADIUS * 2
    );
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
