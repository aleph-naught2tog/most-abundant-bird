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

    let strokeColor = this.color;
    strokeWeight(this.thickness);

    if (isHighlighted) {
      scale(1.05, 1.05)
      const [r,g,b,_a] = this.color;
      strokeColor = [r,g,b, 255]
    }

    stroke(strokeColor);

    beginShape();
    vertex(this.start.x, this.start.y);
    vertex(this.end.x, this.end.y);
    endShape();

    pop();
  }
}
