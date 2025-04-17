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

  draw(isHighlighted = false, scaleFactor = 1) {
    push();

    let strokeColor = this.color.slice(0, 3);
    strokeWeight(this.thickness);

    if (isHighlighted) {
      scale(scaleFactor, scaleFactor);
    } else {
      // const [r, g, b] = strokeColor;
      // let f = 1; // desaturate by 20%
      // let L = 0.3 * r + 0.6 * g + 0.1 * b;
      // let new_r = r + f * (L - r);
      // let new_g = g + f * (L - g);
      // let new_b = b + f * (L - b);

      // strokeColor = [new_r, new_g, new_b];
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
