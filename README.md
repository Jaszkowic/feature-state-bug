## Demonstration of bug in mapbox-gl 3.1.2

### How to reproduce:

- Clone repository
- Create .env file with variables according to .env.sample
- `npm install`
- `npm start`
- Hover over a rendered tree circle -> opacity should change and 3D model should scale bigger
- Change number of rendered trees (`numTrees` variable) in [./src/Map.js](./src/Map.js) and reload
- For small numbers < 50 (exact number unclear), everything works fine
- For larger numbers (in my case, > 100 works reproducible), the hover effect still works on the circle, but it stops working on most of the 3D models. Weirdly enough, some randomly selected 3D models still work.
