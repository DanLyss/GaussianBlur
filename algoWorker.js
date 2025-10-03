let needToStop = false;

doWork(data, outputPixels, blurRadius){
    //TODO()
}


onmessage = function(e) {
    const {cmd, blurRadius, timePeriod, data, resultData} = e.data;

    //get link
    const outputPixels = new Uint8ClampedArray(resultData); 

    if (cmd == "stop"){
        needToStop = true;
    }

    if (cmd == "start"){
        needToStop = false;
        const interval = setInterval(() =>
        {
            let {intermResult, percentDone} = doWork(data, outputPixels, blurRadius);

            if (needToStop){
                postMessage({type: "stopped"});
                clearInterval(interval);
            }
            if (intermResult === false){ 
                postMessage({type: "progress", progress: percentDone});
            }
            else{
                if (intermResult === true){
                    postMessage({type: "finished"});
                    clearInterval(interval);
                }
            }
    }, timePeriod);

    }
}