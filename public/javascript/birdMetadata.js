// TODO: this is a good palette, but some of the colors are similar enough that it implies a relationship
/** @type {RGBColor[]} */
const COLOR_BLIND_PALETTE = [
  [80, 80, 70, 255],
  [86, 180, 233, 255],
  [0, 114, 178, 255],
  [213, 94, 0, 255],
  [147, 30, 236, 255],
  [126, 216, 38, 255],
  [188, 158, 235, 255],
];

/**
 * @type {Record<string, BirdMetadata>}
 */
const BIRD_INFO = {
  "American Crow": {
    imageUrl:
      "https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/american_crow.jpg?v=1744300414058",
    palettePoints: { start: [1534, 1296], end: [2079, 491] },
    image: null,
    imagePalette: [],
    colorBlindPalette: [],
    scientificName: 'Corvus brachyrhynchos',
  },
  "American Robin": {
    imageUrl:
      "https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/american_robin.jpg?v=1744300413633",
    palettePoints: { start: [712, 812], end: [1059, 280] },
    image: null,
    imagePalette: [],
    colorBlindPalette: [],
    scientificName: 'Turdus migratorius',
  },
  "Black-capped Chickadee": {
    imageUrl:
      "https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/black_capped_chickadee.jpeg?v=1744300413387",
    palettePoints: { start: [471, 422], end: [528, 137] },
    image: null,
    imagePalette: [],
    colorBlindPalette: [],
    scientificName: 'Poecile atricapillus'
  },
  "American Goldfinch": {
    imageUrl:
      "https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/american_goldfinch.jpg?v=1744300413049",
    palettePoints: { start: [734, 469], end: [920, 437] },
    image: null,
    imagePalette: [],
    colorBlindPalette: [],
    scientificName: 'Spinus tristis'
  },
  "Blue Jay": {
    imageUrl:
      "https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/blue_jay.jpeg?v=1744300412701",
    palettePoints: { start: [536, 475], end: [958, 628] },
    image: null,
    imagePalette: [],
    colorBlindPalette: [],
    scientificName: 'Cyanocitta cristata'
  },
  "Canada Goose": {
    imageUrl:
      "https://cdn.glitch.global/00f42083-b668-494f-ace0-e024365392d8/canada_goose.jpg?v=1744300382453",
    palettePoints: { start: [838, 654], end: [1016, 31] },
    image: null,
    imagePalette: [],
    colorBlindPalette: [],
    scientificName: 'Branta canadensis'
  },
};
