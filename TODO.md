# TODO 🚧

- [x] fix canvas size/width
- [ ] resize - we're caching the feathers, so that part is done.
  - [ ] (does this need some other parameter for dealing with a new canvas size? I think so.)
- [x] add hover effect/popout/feather selection mechanism
- [ ] accessibility
  - [ ] accessibility descriptions
  - [ ] colorblind palette instead of fancy feathers
  - [ ] high contrast palette
- [ ] extract different highlight patterns for easier checking/testing
- [ ] add data display
  - [ ] bird name
  - [ ] photo?
- [ ] add types

## IDEAS

* make generic for a given set of data
  * problem: colors won't work
  * problem: CDN
    * if we skip the CDN, we could probably do a little preload magic
      * this requires a server file
* sliders etc for the various parameters
* make this usable for other things dynamically -- upload a file, see the max birds, upload your bird photos + pixel points
* palettes:

## NOTES
the best way to do this is probably predefine the palettes, then load them into the bird metadata itself, so that we can just do something like

```javascript
class Barb {
  /* blah blah */

}
```


