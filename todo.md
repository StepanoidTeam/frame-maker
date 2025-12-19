todo

- [x] replace frame gallery with same as photo gallery
- [ ] add img frame support (no customization? just static images, maybe allow add text over?)
- [ ] fix svg frame sizes to be consistent (for fonts size adjustments)

- [ ] allow to upload non-square photos -- do not squeeze those
- [ ] impl crop/resize photos tools

- [x] add more colors to color palettes
- [ ] add support for gradient colors
- [ ] add more fonts, and fix font family select

- [ ] show slider values
- [ ] add font customization (bold, italic, etc.)
- [ ] add font caps
- [x] add text/frame rotation?

- [ ] add watermark? at the corner of the avatar

- [ ] impl upload new frame button
- [ ] add local storage for frames/photos

bugs

- [ ] add extra colors to palette from presets
- [x] apply frame color etc to frame preview in frame gallery (now most are black) -- i set default fallbacks in svg itself
- [x] refac both galleries to event delegation and form approach (as on palettes)

big features

- [ ] propose text/frame props dynamically, based on svg variables inside specific frame
      thoughts:
      parse svg (as text),
      find all variables (starting with --)
      or/and make custom props inside svg,
      that describes prop value type/range/step
      then props may apply directly, or still via vars
      svg should still be valid

OR make it possible to select separate elements and customize them? (sounds hard - micro-figma)
