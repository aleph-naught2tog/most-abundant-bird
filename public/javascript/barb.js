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

  draw() {
    push();

    strokeWeight(this.thickness);
    stroke(this.color);

    beginShape();
    vertex(this.start.x, this.start.y);
    vertex(this.end.x, this.end.y);
    endShape();

    pop();
  }
}
