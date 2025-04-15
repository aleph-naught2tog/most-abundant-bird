interface BirdMetadata {
  imageUrl: string;
  palettePoints: {
    start: [x: number, y: number];
    end: [x: number, y: number];
  };
  image: P5Image | null;
  imagePalette: RGBColor[] | null;
  colorBlindPalette: RGBColor[] | null;
  // highContrastPalette: RGBColor[] | null;
}
