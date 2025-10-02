class UIHandler{

    //initialize the UI elements related fields
    constructor(){
        this.linkHolder = document.getElementById("linkAdress");
        this.linkSubmit = document.getElementById("buttonForLink");
        this.fileSubmit = document.getElementById("fileUpload");
        this.preWindow = document.getElementById("preImage");
        this.postWindow = document.getElementById("postImage");
        this.sliderBar = document.getElementById("sliderBar");
        this.sliderValue = document.getElementById("blurRadius");
        this.startButton = document.getElementById("startProcessing");
        this.spinner = document.getElementById("spinner");
        this.Message = document.getElementById("message");
        this.bindEvents();
        //to create a connection 
        this.linkToMath = new LinkToMath(); 
    }

    //start listening
    bindEvents(){
        this.linkSubmit.addEventListener("click", this.onLinkUpload.bind(this));
        this.fileSubmit.addEventListener("change", this.onFileUpload.bind(this));
        this.startButton.addEventListener("click", this.onExecStart.bind(this));
        this.sliderBar.addEventListener("input", this.updSliderValue.bind(this));
    }

    async onLinkUpload(event){
        let url = this.linkHolder.value;
        const result = await this.linkToMath.loadFromUrl(url);
        if (result === false){
            this.showText("Failure to read uploaded file");
        }
        else{
            this.drawPicture();
        }
    }

    async onFileUpload(event){
        let file = event.target.files[0];
        const result = await this.linkToMath.loadFromFile(file);
        if (result === false){
            this.showText("Failure to read uploaded file");
        }
        else{
            this.drawPicture();
        }
    }

    async onExecStart(event){
        this.showSpinner();
        this.startButton.textContent = "Stop processing";
        let result = await this.linkToMath.requestedStart(parseInt(this.sliderBar.value, 10),
            (progress) => {
                 this.Message.textContent = `Progress is ${progress}% `;
            } ,// use for testing only
     50);
        this.startButton.textContent = "Start processing";

        if (result === true){
            this.showText("Job is done");
        }
        this.hideSpinner();

        if (result === "stopped"){
            this.showText("You stopped the processing");
        }

        if (result === false){
            this.showText("No Image was chosen previously");
        }
    }

    //spiner handling
    showSpinner(){
        this.spinner.style.display = "block";
    }

    hideSpinner(){
        this.spinner.style.display = "none";
    }

    //slider value update
    updSliderValue(event){
        this.sliderValue.textContent = this.sliderBar.value;
    }

    drawPicture(window = "pre"){
        if (window === "pre"){
            let ctx = this.preWindow.getContext("2d");
            ctx.drawImage(this.linkToMath.image, 0, 0, this.preWindow.width, this.preWindow.height);
        }
        else{
            if (window === "post"){
                let ctx = this.postWindow.getContext("2d");
                ctx.drawImage(this.linkToMath.image, 0, 0, this.postWindow.width, this.postWindow.height);
            }
        }
    }

    showText(text){
        this.Message.textContent = text;
        setTimeout( () =>
            {this.Message.textContent = ""},
            1000);
    }
}


class LinkToMath{
    constructor(UIparent){
        this.image = null;
        this.imageData = null;
        this.processedImageData = null;
        this.isProcessStarted = false;
        this.needToStop = false;

        //for testing
        this.data = new Array(1000000).fill(0);
        this.idx = 0;
    }
    
    smallWork(blurRadius, timePeriod){
        const start = performance.now();
        let lim = Math.min(this.idx + 1000, this.data.length);
        while (this.idx < lim){
            this.data[this.idx] += this.idx;
            this.idx += 1;

            if (performance.now() - start >= timePeriod){
                return false;
            }
        }
        return this.idx >= this.data.length;
    }


    loadFromUrl(url){
        return new Promise(
            resolve =>{
                const img = new Image();
                img.onload = () => {
                    if (img.width > 0 && img.height > 0){
                        this.image = img;
                        resolve(img);
                    } else{
                        resolve(false);
                    }
                };
                img.onerror = () => {
                    resolve(false);
                }

                img.src = url;
            }
        )
    }

    loadFromFile(file){
        return this.loadFromUrl(URL.createObjectURL(file));
    }

    //not UI!!
    getImageData(){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.drawImage(this.image, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }


    requestedStart(blurRadius, 
        UIcall, //optional for now
         timePeriod){
        if (this.isProcessStarted === true){
            this.needToStop = true;
            return Promise.resolve("stopped");
        }

        //for testing
        this.idx = 0;
        
        this.isProcessStarted = true;
        this.needToStop = false;
        return new Promise(
            resolve => {
                if (this.image == null){
                    resolve(false);
                    this.isProcessStarted =  false;
                    return;
                }
                const interval = setInterval(() =>{

                    let someWork = this.smallWork(blurRadius, timePeriod);
                    if (this.needToStop === true){
                        clearInterval(interval);
                        this.isProcessStarted = false;
                        resolve("stopped");
                    }
                    if (UIcall){
                        UIcall((this.idx / this.data.length * 100).toFixed(3));
                    }
                    if (someWork){
                        clearInterval(interval);
                        this.isProcessStarted = false;
                        resolve(true);

                    }
                }, timePeriod
                )
            }
        )
    }
}