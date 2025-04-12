const ALPHA = 0.9;

class Feather {
  // these are mostly for clarity
  barbs = [];
  angle = -1;
  colors = [[]];
  length = -1;

  constructor(options) {
    const { barbs, angle, colors, length } = options;
    this.barbs = barbs ?? [];
    this.angle = angle;
    this.colors = colors;
    this.length = length;
  }

  draw() {
    const lengthDivider = floor(this.barbs.length / 2);

    const leftBarbs = this.barbs.slice(0, lengthDivider);
    const rightBarbs = this.barbs.slice(lengthDivider);

    push()
    scale(1, 2);

    for (const barb of leftBarbs) {
      barb.draw();
    }

    scale(-2, 1);

    for (const barb of rightBarbs) {
      barb.draw();
    }
    pop()

    // this._drawRachis();
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

  _drawAnnotation() {
    // this is the NEW circle
    // we just changed coords, so we're back at 0,0
    const featherCircleCenter = { x: 0, y: 0 };
    const radius = this.length / 15;

    noFill()
    circle(featherCircleCenter.x, featherCircleCenter.y, radius * 2);

    // BUG: this isn't working because the translated Y is SUPER SUPER wrong
    const mousePoint = { x: mouseX, y: mouseY };
    const mousePointInCircleTerms = translatePoint(
      mousePoint,
      translationCoordinates
    );

    const isMouseWithinCircle = isPointInsideCircle(
      mousePointInCircleTerms,
      featherCircleCenter,
      radius
    );

    if (mouseIsPressed) {
      console.debug(radius, {
        mousePoint,
        mousePointInCircleTerms,
      });

      if (isMouseWithinCircle) {
        console.error(radius, {
          mousePoint,
          mousePointInCircleTerms,
        })
        throw new Error("within circle");
      }
    }
  }

  _drawRachis() {
    const sw = map(this.length, 10, window.width / 4, 0.5, 1);
    strokeWeight(sw);

    stroke(this._getRachisColor());

    const yTranslation = this.length / 2 + 20;
    const translationToAnnotationCircleCenter = {
      x: 0,
      y: yTranslation,
    };

    translate(
      translationToAnnotationCircleCenter.x,
      translationToAnnotationCircleCenter.y
    );

    translationCoordinates = {
      x: translationCoordinates.x + translationToAnnotationCircleCenter.x,
      y: translationCoordinates.y + translationToAnnotationCircleCenter.y,
    };

    noFill();
    line(0, 0, 0, -yTranslation);
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
