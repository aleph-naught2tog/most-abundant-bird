class Feather {
  barbs = [];
  angle = -1;
  colors = [[]];
  length = -1;

  constructor(options) {
    if (options) {
      const { barbs, angle, colors, length } = options;
      this.barbs = barbs ?? [];
      this.angle = angle ?? -1;
      this.colors = colors ?? [[]];
      this.length = length ?? -1;
    }
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
  }

  drawRachis() {
    const exemplarBarb = this.barbs[0];

    strokeWeight(map(this.length, 10, window.width / 2 / 2, 0.5, 1.5));
    stroke([
      exemplarBarb.color[0] / 1.25,
      exemplarBarb.color[1] / 1.25,
      exemplarBarb.color[2] / 1.25,
      exemplarBarb.color[3] * 0.95,
    ]);

    line(0, -2, 0, this.length / 2);
  }

  getColorAtIndex(i) {
    return this.colors[floor(map(i, 0, this.length, 0, this.colors.length))];
  }

  createBarbs() {
    const points = generatePoints(this.length);

    for (const { p0, p2, index } of points) {
      const barb = new Barb({
        start: { x: p0.x, y: p0.y },
        end: { x: p2.x, y: p2.y },
        color: this.getColorAtIndex(index),
        thickness: getRandomStrokeWeight(),
      });

      this.barbs.push(barb);
    }
  }
}
