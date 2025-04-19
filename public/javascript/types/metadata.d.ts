interface BirdMetadata {
  imageUrl: string;
  palettePoints: {
    start: [x: number, y: number];
    end: [x: number, y: number];
  };
  image: P5Image | null;
  imagePalette: RGBColor[];
  colorBlindPalette: RGBColor[];
  highlightColor: ColorValue;
  scientificName: string;
}
