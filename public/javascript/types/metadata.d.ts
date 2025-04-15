interface BirdMetadata {
  imageUrl: string;
  palettePoints: {
    start: [x: number, y: number];
    end: [x: number, y: number];
  };
  image: P5Image | null;
  imagePalette: RGBColor[] | null;
  colorBalette: RGBColor[] | null;
  // highContrastPalette: RGBColor[] | null;
}
