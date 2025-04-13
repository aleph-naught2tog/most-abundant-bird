// p5 things
declare function push(): void;
declare function pop(): void;
declare function beginShape(): void;
declare function endShape(): void;

declare function noFill(): void;
declare function noStroke(): void;
declare function strokeWeight(weight: number): void;

declare function rotate(angle: number): void;

declare function floor(value: number): number;

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
