/**
 * Note: this is NOT exhaustive. It mostly just is what has been used so far.
 */

interface P5Color {
  toString(): string;

  // depend on colorMode -- either 255 or 100 depending on which you picked
  setRed(redValue: number): void;
  setGreen(greenValue: number): void;
  setBlue(blueValue: number): void;
  setAlpha(alphaValue: number): void;
}

declare function createVector(x?: number, y?: number, z?: number): P5Vector;

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

declare function lerp(
  firstVector: P5Vector,
  secondVector: P5Vector,
  amount: number
): P5Vector;
declare function lerp(
  firstNumber: number,
  secondNumber: number,
  amount: number
): number;

interface P5Image {
  width: number;
  height: number;

  /**
   * A flat array of RGBA values. so [r_00, g_00, b_00, a_00, r_10, g_20...]
   */
  pixels: number[];

  loadPixels(): void;
  updatePixels(): void;

  get(): number[];
  get(x: number, y: number): RGBColor;
  get(x0: number, y0: number, x1: number, y1: number): P5Image;

  pixelDensity(): number;
  pixelDensity(newDensity: number): void;
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
  | GrayscaleValue
  | P5Color;
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

declare function max(arr: number[]): number;
declare function max(...arr: number[]): number;

declare function min(arr: number[]): number;
declare function min(...arr: number[]): number;

declare function floor(value: number): number;

declare function round(value: number, decimalPlaces?: number): number;

declare function random(): number;
declare function random(excludedMax: number): number;
declare function random(min: number, excludedMax: number): number;
declare function random<T>(choices: T[]): T;

declare function pow(base: number, exponent: number): number;

declare function map(
  valueToMap: number,
  valueRangeMin: number,
  valueRangeMax: number,
  targetRangeMin: number,
  targetRangeMax: number,
  withinBounds?: boolean
): number;

declare function line(x0: number, y0: number, x1: number, y1: number): void;
declare function line(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  z0: number,
  z1: number
): void;

declare function vertex(
  x: number,
  y: number,
  z?: number,
  u?: number,
  v?: number
): void;

declare function circle(
  centerX: number,
  centerY: number,
  diameter: number
): void;

declare function text(
  str: string,
  x_bottomLeftCorner: number,
  y_bottomLeftCorner: number,
  maxWidth?: number,
  maxHeight?: number
): void;

declare const LEFT = 'left';
declare const CENTER = 'center';
declare const RIGHT = 'right';
declare const TOP = 'top';
declare const BOTTOM = 'bottom';
declare const BASELINE = 'baseline';
type HorizontalAlignment = typeof LEFT | typeof CENTER | typeof RIGHT;
type VerticalAlignment =
  | typeof TOP
  | typeof BOTTOM
  | typeof CENTER
  | typeof BASELINE;
declare function textAlign(horizAlign: string, vertAlign?: string): void;

declare function loadTable(
  filename: string,
  callback: (table: P5Table) => void
): P5Table;

declare function loadImage(
  url: string,
  onSuccess?: (i: P5Image) => void,
  onError?: (e: any) => void
): P5Image;

declare const RADIANS = 'RADIANS';
declare const DEGREES = 'DEGREES';
declare type AngleMode = typeof RADIANS | typeof DEGREES;

declare function cos(theta: number): number;
declare function sin(theta: number): number;
declare function atan2(y: number, x: number): number;

declare const P2D = 'p2d';
declare const WEBGL = 'webgl';
type RenderMode = typeof P2D | typeof WEBGL;

declare const PI: number;
declare const TAU: number;

declare const width: number;
declare const height: number;
declare const windowHeight: number;
declare const windowWidth: number;

declare const mouseX: number;
declare const mouseY: number;

declare interface Window {
  width: number;
}

declare function angleMode(): AngleMode;
declare function angleMode(mode: AngleMode): void;

declare function createCanvas(): P5Element;
declare function createCanvas(width: number): P5Element;
declare function createCanvas(width: number, height: number): P5Element;
declare function createCanvas(
  width: number,
  height: number,
  renderMode: RenderMode
): P5Element;
declare function createCanvas(
  width: number,
  height: number,
  canvasElement: HTMLCanvasElement
): P5Element;
declare function createCanvas(
  width: number,
  height: number,
  renderMode: RenderMode,
  canvasElement: HTMLCanvasElement
): P5Element;

interface P5Element {
  width: number;
  height: number;

  parent(): P5Element;
  parent(elementId: string): void;
  parent(element: P5Element): void;
  parent(element: HTMLElement): void;

  id(id: string): void;
  id(): string;

  class(className: string): void;
  class(): string;

  child(): Node[];
  child(id: string): void;
  child(node: Node): void;
  child(element: P5Element): void;

  position(x: number, y: number, cssPosition?: CssPosition): Point;

  html(innerHtml: string, append?: boolean): void;
}

type CssPosition =
  | 'static'
  | 'fixed'
  | 'relative'
  | 'sticky'
  | 'initial'
  | 'inherit';

declare function point(vector: P5Vector): void;
declare function point(x: number, y: number): void;
declare function point(x: number, y: number, z: number): void;

declare function dist(x0: number, y0: number, x1: number, y1: number): number;
declare function dist(
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number
): number;

declare const drawingContext: CanvasRenderingContext2D;

declare function lerpColor(
  startColor: P5Color,
  endColor: P5Color,
  amount: number
): P5Color;

declare interface P5TableRow {
  set(columnSpecifier: string | number, value: string | number): void;
  setNum(columnSpecifier: string | number, value: number): void;
  setString(columnSpecifier: string | number, value: string): void;

  get(columnSpecifier: string | number): string | number;
  getNum(columnSpecifier: string | number): number;
  getString(columnSpecifier: string | number): string;
}

declare interface P5Table {
  columns: string[];
  rows: P5TableRow[];

  addRow(): P5TableRow;
  addRow(row: P5TableRow): P5TableRow;

  removeRow(id: number): void;

  get(rowIndex: number, columnId: string | number): string | number;

  getRow(id: number): P5TableRow;
  getRows(): P5TableRow[];

  getColumnCount(): number;
  getRowCount(): number;
}

declare function createDiv(innerHTML?: string): P5Element;
declare function createElement(tagName: string, content?: string): P5Element;

declare function textSize(size: number): void;
declare function textFont(fontName: string): void;
