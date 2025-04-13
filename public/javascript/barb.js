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
    this.gradient = null;
  }

  draw(isHighlighted = false) {
    push();

    const strokeColor = this.color.slice(0, 3);
    strokeWeight(this.thickness);

    if (isHighlighted) {
      scale(1.05, 1.05);
    }

    stroke(...strokeColor, isHighlighted ? 255 : 200);
    line(this.start.x, this.start.y, this.end.x, this.end.y)

    pop();
  }
}
