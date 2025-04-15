// 0.75 keeps us within the big outer circle, but messes with where the annotations go
const SCALE_SCALE = 0.75;

const HEIGHT_SCALE = SCALE_SCALE * 0.5;
const WIDTH_SCALE = SCALE_SCALE * 0.15;

/**
 * @param {number} length
 * @returns {Generator<{p0: P5Vector, p2: P5Vector, index: number}>}
 */
// TODO: separate out the length vs pointcount vs barb count
function* generatePoints(length) {
  // length also represents the point count
  const featherWidth = length * WIDTH_SCALE;
  const featherHeight = length * HEIGHT_SCALE;
  // const step = floor(map(Math.random(), 0, 1, 3, 5, true));
  const step = 2;

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

    // a constant angle here gives us a christmas tree shape
    const widthScaledByAngle = sin(angle) * featherWidth;

    if (!stuck) {
      const stackStep = HEIGHT_SCALE * (step + pow(index, 0.2) * 0.75);
      stack += stackStep;
    }

    //three points
    const p0 = createVector(0, index * HEIGHT_SCALE * 0.75);
    const p1 = createVector(widthScaledByAngle, stack);
    const p2 = p1.lerp(end, map(index, 0, length, 0, 1));

    // this gives us more variation, mostly lower on the feather
    if (index < length * 0.1) {
      // adjust the end point a little by a random amount
      p2.x *= random(0.8, 1.2);
      p2.y *= random(0.8, 1.2);
    }

    yield { p0, p2, index };
  }
}
