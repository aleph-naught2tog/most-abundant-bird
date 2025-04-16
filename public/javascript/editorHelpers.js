
/**
 * this is just an editor nicety to get HTML syntax highlighting. it just
 * returns the string as created.
 *
 * @param {TemplateStringsArray} stringPieces
 * @param  {...any} interpolationArgs
 * @returns {string}
 */
const html = (stringPieces, ...interpolationArgs) => {
  let str = '';

  for (let index = 0; index < stringPieces.length; index +=1) {
    const piece = stringPieces[index];
    const arg = interpolationArgs[index] ?? '';

    str += piece + arg;
  }

  return str;
}

/**
 * this is just another editor nicety to get HTML syntax highlighting. it just
 * returns the string as created.
 *
 * @param {TemplateStringsArray} stringPieces
 * @param  {...any} interpolationArgs
 * @returns {string}
 */
const css = (stringPieces, ...interpolationArgs) => {
  let str = '';

  for (let index = 0; index < stringPieces.length; index +=1) {
    const piece = stringPieces[index];
    const arg = interpolationArgs[index] ?? '';

    str += piece + arg;
  }

  return str;
}
