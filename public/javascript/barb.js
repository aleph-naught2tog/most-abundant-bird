class Barb {
  /**
   *
   * @param {Object} options
   * @param {Point} options.start
   * @param {Point} options.end
   * @param {RGBColor} options.color
   * @param {number} options.thickness
   */
  constructor(options) {
    const { start, end, color, thickness } = options;
    this.start = start;
    this.end = end;
    this.color = color;
    this.thickness = thickness;
  }

  draw(isHighlighted = false) {
    push();

    let strokeColor = this.color.slice(0, 3);
    strokeWeight(this.thickness);

    if (isHighlighted) {

    } else {
      const [r, g, b] = strokeColor;
      const f = 0.55;
      const L = 0.3 * r + 0.6 * g + 0.1 * b;
      const new_r = r + f * (L - r);
      const new_g = g + f * (L - g);
      const new_b = b + f * (L - b);

      strokeColor = [new_r, new_g, new_b];
    }

    stroke(
      strokeColor[0],
      strokeColor[1],
      strokeColor[2],
      isHighlighted ? 255 : 200
    );

    line(this.start.x, this.start.y, this.end.x, this.end.y);

    pop();
  }
}
