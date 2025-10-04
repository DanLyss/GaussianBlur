let needToStop = false;
let height = 0;
let width = 0;
let inputPixels = null;
let outputPixels = null;
let intermPixels = null;
let blurRadius = 0;
let timePeriod = 0;
let convMatrix = null;
let sigma = 0;

let idx = 0;
let total = 0;


function doWork(){
    const start = performance.now(); 
    //vertical Gaussan blur
    while (idx < height){
        const i = idx;
            for (let j = 0; j < width; j++){
                let tot1 = 0;
                let tot2 = 0;
                let tot3 = 0;
                for (let pos = -3 * sigma; pos <= 3 * sigma; pos ++){
                    const xpos = Math.min(Math.max(0, i + pos), height - 1);
                    tot1 += convMatrix[pos + 3 * sigma] * inputPixels[4 * (xpos * width + j)];
                    tot2 += convMatrix[pos + 3 * sigma] * inputPixels[4 * (xpos * width + j) + 1];
                    tot3 += convMatrix[pos + 3 * sigma] * inputPixels[4 * (xpos * width + j) + 2];
                }
                intermPixels[4 * (i * width + j)] = tot1;
                intermPixels[4 * (i * width + j) + 1] = tot2;
                intermPixels[4 * (i * width + j) + 2] = tot3;
                intermPixels[4 * (i * width + j) + 3] = inputPixels[4 * (i * width + j) + 3];
            }
            idx ++;
            if (performance.now() - start >= timePeriod){
                return {intermResult: false, percentDone: (i / (2 * height) * 100).toFixed(3)};
            }
        }
   //horizontal Gaussian blur
   while (idx < 2 * height){
    const i = idx - height;
    for (let j = 0; j < width; j++){
        let tot1 = 0;
        let tot2 = 0;
        let tot3 = 0;
        for (let pos = -3 * sigma; pos <= 3 * sigma; pos ++){
            const ypos = Math.min(Math.max(0, j + pos), width - 1);
            tot1 += convMatrix[pos + 3 * sigma] * intermPixels[4 * (i * width + ypos)];
            tot2 += convMatrix[pos + 3 * sigma] * intermPixels[4 * (i * width + ypos) + 1];
            tot3 += convMatrix[pos + 3 * sigma] * intermPixels[4 * (i * width + ypos) + 2];
        }
        outputPixels[4 * (i * width + j)] = tot1;
        outputPixels[4 * (i * width + j) + 1] = tot2;
        outputPixels[4 * (i * width + j) + 2] = tot3;
        outputPixels[4 * (i * width + j) + 3] = intermPixels[4 * (i * width + j) + 3];
    }
    idx ++;
    if (idx == 2 * height){
        return {intermResult: true, percentDone: 100};
    }

    if (performance.now() - start >= timePeriod){
        return {intermResult: false, percentDone: (idx / (2 * height) * 100).toFixed(3)};
    }
   }
}

function createGaussian(){
     //create Gaussian distribution of size 6 sigma
    sigma = Math.round(blurRadius);
    var norm = 0
    convMatrix = new Float32Array(6 * sigma + 1);
    for (let i = 0; i <= 3 * sigma; i++){
        const currVal = Math.exp(-(i ** 2)/(2 * sigma **2))/(Math.sqrt(2 * Math.PI) * sigma);
        convMatrix[3 * sigma + i] = currVal
        convMatrix[3 * sigma - i] = currVal
        norm += 2 * currVal;
        if (i == 0){
            norm -= currVal;
        }
    }
    for (let i = 0; i <= 6 * sigma; i++){
        convMatrix[i] /= norm;
    }
}

onmessage = function(e) {
    const {cmd, blurRadius: br, timePeriod: tp, inputPixels: inputBuf, width: w, height: h} = e.data;
 
    inputPixels  = new Uint8ClampedArray(inputBuf);
    intermPixels = new Uint8ClampedArray(inputPixels.length);
    outputPixels = new Uint8ClampedArray(inputPixels.length);
    blurRadius   = br;
    timePeriod   = tp;
    width        = w;
    height       = h;
    total        = width * height;

    createGaussian();

    if (cmd == "stop"){
        needToStop = true;
    }

    if (cmd == "start"){
        idx = 0;
        needToStop = false;

        const interval = setInterval(() =>
        {
            let {intermResult, percentDone} = doWork();

            if (needToStop){
                postMessage({type: "stopped"});
                clearInterval(interval);
            }
            if (intermResult === false){ 
                postMessage({type: "progress", progress: percentDone});
            }
            else{
                if (intermResult === true){
                    postMessage({type: "finished", resultImage: outputPixels.buffer});
                    clearInterval(interval);
                }
            }
    }, timePeriod);

    }
}