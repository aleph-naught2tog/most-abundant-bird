// p5 things
declare class P5Color {
  toString(): string;

  // depend on colorMode -- either 255 or 100 depending on which you picked
  setRed(redValue: number): void;
  setGreen(greenValue: number): void;
  setBlue(blueValue: number): void;
  setAlpha(alphaValue: number): void;
}

declare class P5Vector {
  x: number;
  y: number;
  z: number;

  toString(): string;
  // tons of other methods...
  /**
   * NOTE: this modifies the current vector in-place
   */
  lerp(otherVector: P5Vector, amount: number): P5Vector;
}

// depends on colorMode
type CSSColorName = string;
type HexCode = string; // starts with # and is 3, 6, or 8 hex digits
type RGBColor =
  | [red: number, green: number, blue: number]
  | [red: number, green: number, blue: number, alpha: number];
type HSBColor =
  | [hue: number, saturation: number, brightness: number]
  | [hue: number, saturation: number, brightness: number, alpha: number];
type HSLColor =
  | [hue: number, saturation: number, luminosity: number]
  | [hue: number, saturation: number, luminosity: number, alpha: number];

type GrayscaleValue = number;
type ColorValue =
  | CSSColorName
  | HexCode
  | RGBColor
  | HSBColor
  | HSLColor
  | GrayscaleValue;
type SpreadableColorValue = RGBColor | HSBColor | HSLColor;

declare function push(): void;
declare function pop(): void;
declare function beginShape(): void;
declare function endShape(): void;

declare function noFill(): void;
declare function noStroke(): void;
declare function strokeWeight(weight: number): void;

// TODO: these also accept P5Color
declare function fill(color: ColorValue): void;
declare function fill(...color: SpreadableColorValue): void;
declare function stroke(color: ColorValue): void;
declare function stroke(...color: SpreadableColorValue): void;
// TODO: `background` also accepts P5Image
declare function background(color: ColorValue): void;
declare function background(...color: SpreadableColorValue): void;
declare function color(color: ColorValue): P5Color;
declare function color(...color: SpreadableColorValue): P5Color;

declare function rotate(angle: number): void;
declare function translate(x: number, y: number, z?: number): void;
declare function translate(vector: P5Vector): void;
declare function scale(scaleFactor: number): void;
declare function scale(xScale: number, yScale?: number, zScale?: number): void;
declare function scale(scaleVector: P5Vector): void;

declare function floor(value: number): number;
declare function map(
  valueToMap: number,
  valueRangeMin: number,
  valueRangeMax: number,
  targetRangeMin: number,
  targetRangeMax: number,
  withinBounds = true
): number;

declare function line(
  x_0: number,
  y_0: number,
  x_1: number,
  y_1: number
): void;
declare function line(
  x_0: number,
  y_0: number,
  x_1: number,
  y_1: number,
  z_0: number,
  z_1: number
): void;

declare function circle(centerX: number, centerY: number, diameter: number): void;

declare function text(
  str: string,
  x_bottomLeftCorner: number,
  y_bottomLeftCorner: number,
  maxWidth?: number,
  maxHeight?: number
): void;

// needs table type
declare function loadTable(filename: string, callback: () => void): void;
declare function loadImage(url: string): void;

declare const RADIANS: string;
declare const PI: number;
declare const TAU: number;

declare const width: number;
declare const height: number;

declare const mouseX: number;
declare const mouseY: number;

declare interface Window {
  width: number;
}
