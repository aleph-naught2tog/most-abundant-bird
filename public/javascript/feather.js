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

    scale(1, 2);

    for (const barb of leftBarbs) {
      barb.draw();
    }

    scale(-2, 1);

    for (const barb of rightBarbs) {
      barb.draw();
    }

    this._drawRachis();
  }

  _drawRachis() {
    const exemplarBarb = this.barbs[0];

    strokeWeight(map(this.length, 10, window.width / 4, 0.5, 1));

    const red = exemplarBarb.color[0] / 1.25;
    const green = exemplarBarb.color[1] / 1.25;
    const blue = exemplarBarb.color[2] / 1.25;
    const alpha = exemplarBarb.color[3] * 0.95;

    stroke([red, green, blue, alpha]);

    line(0, -2, 0, this.length / 2);
  }

  createBarbs() {
    const points = generatePoints(this.length);

    for (const { p0, p2, index } of points) {
      const barb = new Barb({
        start: { x: p0.x, y: p0.y },
        end: { x: p2.x, y: p2.y },
        color: getColorAtIndex(index, this.length, this.colors),
        thickness: getRandomStrokeWeight(),
      });

      this.barbs.push(barb);
    }
  }
}
