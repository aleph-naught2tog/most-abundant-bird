// TODO: pull a lot of these things out into constants


/**
 * Creates an object of useful information for generating a feather.
 *
 * @param {number} length
 *
 * @returns {{
*  heightScale: number,
*  featherWidth: number,
*  featherHeight: number,
*  step: number
* }} a config of information about a feather
*/
function _getFeatherConfig(length) {
 const heightScale = 0.5;
 const featherWidth = length * 0.15;
 const featherHeight = length * heightScale;
 // const step = floor(map(Math.random(), 0, 1, 3, 5, true));
 const step = 2;

 return {
   heightScale,
   featherWidth,
   featherHeight,
   step,
 };
}

// length also represents the point count
function* generatePoints(length) {
  const { heightScale, featherWidth, featherHeight, step } =
    _getFeatherConfig(length);

  let end = createVector(0, featherHeight);

  let stack = 0;
  let stuck = false;

  for (let index = 0; index < length; index += step) {
    if (!stuck && random(100) < 30) {
      stuck = true;
    }

    if (stuck && random(100) < 20) {
      stuck = !stuck;
    }

    // this tweaks the fullness of the feather / also a... twist
    const angle = map(index, 0, length, 0, PI);
    const aw = sin(angle) * featherWidth;

    if (!stuck) {
      const stackStep =
        step * heightScale + pow(index, 0.2) * 0.75 * heightScale;
      stack += stackStep;
    }

    //three points
    const p0 = createVector(0, index * heightScale * 0.75);
    const p1 = createVector(aw, stack);
    const p2 = p1.lerp(end, map(index, 0, length, 0, 1));

    if (index < length * 0.1) {
      p2.x *= random(0.8, 1.2);
      p2.y *= random(0.8, 1.2);
    }

    yield { p0, p2, index };
  }
}
