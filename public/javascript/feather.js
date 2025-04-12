const ALPHA = 0.9;

const FAKE_MOUSE_POINT = { x: 405, y: 120 };

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
   * @param {TranslationCoordinates} options.translationCoordinates
   */
  constructor(options) {
    const { barbs, angle, colors, length, translationCoordinates } = options;
    // this is awkward but types!
    const defaultBarbs = /** @type {Array<Barb>} */ ([]);

    this.barbs = barbs ?? defaultBarbs;
    this.angle = angle;
    this.colors = colors;
    this.length = length;
    this.translationCoordinates = translationCoordinates;
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
    const translationToFeatherTip = { x: 100, y: 100 };
    this.translationCoordinates.addTranslation(translationToFeatherTip);
    drawCoordinatePoints('cyan')

    const featherCircleCenter = { x: 0, y: 0 };
    const radius = this.length / 15;

    noFill();
    circle(featherCircleCenter.x, featherCircleCenter.y, radius * 2);

    // if (mouseIsPressed) {
    // const mousePoint = { x: mouseX, y: mouseY };

    // using a fake mouse point that should be within the circle so we can test
    // this without a million debugs from `draw`
    const mousePoint = FAKE_MOUSE_POINT;

    // This value is what's wrong
    // The X is correct, but the Y is wrong
    // it SHOULD be a small X and a small Y
    const mousePointInCircleTerms = translatePoint(
      mousePoint,
      this.translationCoordinates.getCurrentTranslation()
    );

    const isMouseWithinCircle = isPointInsideCircle(
      mousePointInCircleTerms,
      featherCircleCenter,
      radius
    );

    console.debug(radius, {
      mousePoint,
      mousePointInCircleTerms,
      isMouseWithinCircle,
      translation: this.translationCoordinates.getCurrentTranslation(),
    });


    // }
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
