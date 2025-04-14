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

    let strokeColor = this.color.slice(0, 3);
    strokeWeight(this.thickness);

    if (isHighlighted) {
      // scale(1.05, 1.05);
    } else {
      const [r,g,b] = strokeColor
      let f = 1; // desaturate by 20%
      let L = 0.3 * r + 0.6 * g + 0.1 * b;
      let new_r = r + f * (L - r);
      let new_g = g + f * (L - g);
      let new_b = b + f * (L - b);

      strokeColor = [
        new_r,
        new_g,
        new_b,
      ];
    }

    stroke(...strokeColor, isHighlighted ? 255 : 200);
    line(this.start.x, this.start.y, this.end.x, this.end.y);

    pop();
  }
}
