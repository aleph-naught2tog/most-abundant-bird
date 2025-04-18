// 0.75 keeps us within the big outer circle, but messes with where the annotations go
const SCALE_SCALE = 0.75;

const HEIGHT_SCALE = SCALE_SCALE * 0.5;
const WIDTH_SCALE = SCALE_SCALE * 0.15;

/**
 * @param {number} featherLength
 * @param {number} pointCount
 * @returns {Generator<{p0: P5Vector, p2: P5Vector, index: number}>}
 */
// TODO: separate out the length vs pointcount vs barb count
function* generatePoints(featherLength, pointCount) {
  // length also represents the point count
  const featherWidth = featherLength * WIDTH_SCALE;
  const featherHeight = featherLength * HEIGHT_SCALE;

  console.debug(featherLength / pointCount);
  // const stepSize = floor(map(Math.random(), 0, 1, 3, 5, true));
  const stepSize = featherLength / pointCount;

  const endVector = createVector(0, featherHeight);

  // the difference between these two numbers seems to represent how close the
  // feathers towards the end get to 0. if shouldBeUnstuckThreshold >
  // shouldBeStuckThreshold, the top gets asymptomic and starts to overflow with
  // a pinch at the endVector. if the shouldBeUnstuck is drastically less, the
  // points approach the tip in a decreasing curve that starts to be asymptotic
  // towards the center line
  const shouldBeStuckThreshold = 30;
  const shouldBeUnstuckThreshold = 20;

  let stack = 0;
  let stuck = false;

  for (let index = 0; index < featherLength; index += stepSize) {
    // if we are not stuck and some random number is less than the threshold, we become stuck
    if (!stuck && random(100) < shouldBeStuckThreshold) {
      stuck = true;
    }

    // if we are stuck and some random number is below the threshold, we unstick
    if (stuck && random(100) < shouldBeUnstuckThreshold) {
      // this ALSO controls the pointiness of the tip
      stuck = !stuck;
    }

    // this tweaks the fullness of the feather / also a... twist
    const angle = map(index, 0, featherLength, 0, PI);

    // a constant angle here gives us a christmas tree shape
    const widthScaledByAngle = sin(angle) * featherWidth;

    // if we are not stuck, we increment up the stack
    if (!stuck) {
      const stackStep = HEIGHT_SCALE * (stepSize + pow(index, 0.25) * 0.5);

      stack += stackStep;
    }

    //three points
    const p0 = createVector(0, index * HEIGHT_SCALE * 0.75);
    const p1 = createVector(widthScaledByAngle, stack);
    const p2 = p1.lerp(endVector, map(index, 0, featherLength, 0, 1));

    // this gives us more variation, mostly lower on the feather
    const howFarUpToAddNoise = 0.1;
    if (index < pointCount * howFarUpToAddNoise) {
      // adjust the end point a little by a random amount
      p2.x *= random(0.8, 1.2);
      p2.y *= random(0.8, 1.2);
    }

    yield { p0, p2, index };
  }
}
