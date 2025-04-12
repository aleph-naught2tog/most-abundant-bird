class TranslationCoordinates {
  static coordinates;

  constructor() {
    this.x = 0;
    this.y = 0;

    this.angle = 0;
  }

  static createCoordinates() {
    if (!TranslationCoordinates.coordinates) {
      TranslationCoordinates.coordinates = new TranslationCoordinates();
    }

    return TranslationCoordinates.coordinates;
  }

  addRotation(angleInRadians) {
    rotate(angleInRadians);

    this.angle += angleInRadians;
  }

  revertRotation() {
    rotate(-this.angle);

    this.angle -= this.angle;
  }

  getCurrentRotation() {
    return this.angle;
  }

  addTranslation({ x, y }) {
    // We must translate first or we end up translating too far
    translate(x, y);

    this.x += x;
    this.y += y;
  }

  getCurrentTranslation() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  revertTranslation() {
    translate(-this.x, -this.y);

    this.x -= this.x;
    this.y -= this.y;
  }
}
