class TranslationCoordinates {
  static coordinates;

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  static createCoordinates() {
    if (!TranslationCoordinates.coordinates) {
      TranslationCoordinates.coordinates = new TranslationCoordinates();
    }

    return TranslationCoordinates.coordinates;
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
    const { x, y } = { x: -this.x, y: -this.y };

    translate(x, y);

    this.x += x;
    this.y += y;
  }
}
