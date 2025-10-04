let needToStop = false;
let height = 0;
let width = 0;
let inputPixels = null;
let outputPixels = null;
let blurRadius = 0;
let timePeriod = 0;

let idx = 0;
let total = 0;


function doWork(){
    let time = performance.now();
    while (idx < total && performance.now() - time <= timePeriod){
        outputPixels[4 * idx] = 255 - inputPixels[4 * idx];
        outputPixels[4 * idx + 1] = 255 - inputPixels[4 * idx + 1];
        outputPixels[4 * idx + 2] = 255 - inputPixels[4 * idx + 2];
        outputPixels[4 * idx + 3] = inputPixels[4 * idx + 3];

        idx += 1;
    }
    
    if (idx < total){
        return {intermResult: false, percentDone: (idx / total * 100).toFixed(3)};
    }

    return {intermResult: true, percentDone: 100};
}


onmessage = function(e) {
    const {cmd, blurRadius: br, timePeriod: tp, inputPixels: inputBuf, width: w, height: h} = e.data;
 
    inputPixels  = new Uint8ClampedArray(inputBuf);
    outputPixels = new Uint8ClampedArray(inputPixels.length);
    blurRadius   = br;
    timePeriod   = tp;
    width        = w;
    height       = h;
    total        = width * height;

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