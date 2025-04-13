class Barb {
  // these are mostly for clarity
  start = { x: -1, y: -1 };
  end = { x: -1, y: -1 };
  color = [];
  thickness = -1;

  constructor(options) {
    const { start, end, color, thickness } = options;
    this.start = start;
    this.end = end;
    this.color = color;
    this.thickness = thickness;
  }

  draw(isHighlighted = false) {
    push();

    const strokeColor = this.color.slice(0, 3);
    strokeWeight(this.thickness);

    const start = {
      r: strokeColor[0],
      g: strokeColor[1],
      b: strokeColor[2],
      alpha: 200,
    };

    const end = {
      r: strokeColor[0],
      g: strokeColor[1],
      b: strokeColor[2],
      alpha: 70,
    };

    if (isHighlighted) {
      scale(1.05, 1.05);
      start.alpha = 255;
      end.alpha = 255;
    }

    gradientLine(
      this.start,
      this.end,
      [start.r, start.g, start.b, start.alpha],
      [end.r, end.g, end.b, end.alpha],
      this.thickness
    );

    pop();
  }
}
