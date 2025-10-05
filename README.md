# GaussianBlur
[index.html](index.html) implements very basic interface in html for the application

[main.ts](./ts/main.ts) is the starting point of the application

[uiHandler.ts](./ts/uiHandler.ts) is responsible for UI handling, without any business logic

[linkToMath.ts](./ts/linkToMath.ts) is a connection between UI and math-heavy computations

[algoWorker.ts](./ts/algoWorker.ts) implements separable in axis Gaussian blur in Web Worker


## General logic of the application

1. The user provides either a link or an image file to the application. Validation checks ensure that the format is correct.
2. The image is displayed in the left window of the page, and the app waits until the Process an image button is pressed.
3. When the button is pressed, the current slider value of blur radius is extracted and the algorithm starts immediately.
4. After execution:
   - On success — the blurred image is shown on the right.
   - On failure — the user is informed.
   - During processing — a completed percentage information is displayed.
5. Additional options are available to download the blurred image or stop processing.\
   The blur radius can be selected from 0 to 50, where 0 means no blur.
6. The Gaussian blur is implemented in two passes (vertical and horizontal), taking advantage of the separability property of the Gaussian distribution for a significant speed-up.

## How to compile .ts sources into .js

This project uses TypeScript for type-safe development.\
To run it in the browser, you need to compile the .ts files into .js.

### 1. Install TypeScript

Install globally or locally in the project:

```
npm install -g typescript
# or
npm install --save-dev typescript
```

### 2. Compile the sources

To compile all .ts files according to the [tsconfig.json](./tsconfig.json):

```
npx tsc
```

This will produce corresponding .js files inside dist/ directory

### 3. Run the project

You can open [index.html](./index.html) directly in a browser

## Important note on imports

When using ES Modules ( in HTML), browsers require explicit file extensions in import paths.\
You must include .js at the end of each import ([main.js](./dist/main.js) and [uiHandler.js](./dist/uiHandler.js))

Correct:

```
import { gaussianBlur } from './algoWorker.js';
```

Incorrect (will fail in browser):

```
import { gaussianBlur } from './algoWorker';
```
