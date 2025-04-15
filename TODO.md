# TODO 🚧

## Bugs

- [ ] error from IE about `isP3D` being not available on undefined -- comes from `translate` in `highlightFeather...`
- [ ] weird hover behavior with annotation circles

## Features

### Accessibility

- [ ] accessibility descriptions: https://p5js.org/reference/p5/describe/, https://p5js.org/reference/p5/describeElement/, https://p5js.org/tutorials/writing-accessible-canvas-descriptions/
- [ ] colorblind palette instead of fancy feathers
- [ ] high contrast palette

### Data display

- [ ] bird name
- [ ] scientific name
- [ ] photo?
- [ ] brief description

### Done

- [x] add types
- [x] add hover effect/popout/feather selection mechanism
- [x] extract different highlight patterns for easier checking/testing
- [x] fix canvas size/width

## Nice to have

- [ ] resize - we're caching the feathers, so that part is done.
  - [ ] (does this need some other parameter for dealing with a new canvas size? I think so.)
- [ ] highlight a specific bird in the chart (so all those feathers come forward)

## Ideas

* make generic for a given set of data
  * problem: colors won't work
  * problem: CDN
    * if we skip the CDN, we could probably do a little preload magic
      * this requires a server file
* sliders etc for the various parameters
* make this usable for other things dynamically -- upload a file, see the max birds, upload your bird photos + pixel points
* palettes



