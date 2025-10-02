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
        this.errorMessage = document.getElementById("message");
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
            this.showError("Failure to read uploaded file");
        }
        else{
            this.drawPicture();
        }
    }

    async onFileUpload(event){
        let file = event.target.files[0];
        const result = await this.linkToMath.loadFromFile(file);
        if (result === false){
            this.showError("Failure to read uploaded file");
        }
        else{
            this.drawPicture();
        }
    }

    async onExecStart(event){
        let result = await this.linkToMath.requestedStart(this.sliderValue);
        
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

    showError(text){
        this.errorMessage.textContent = text;
    }
}


class LinkToMath{
    constructor(){
        this.image = null;
        this.imageData = null;
        this.processedImageData = null;
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


    requestedStart(){
        return new Promise(
            resolve => {
                if (this.image == null){
                    resolve(false);
                }
                //TODO() start computations, somehow return result to UI, meaning updating UI during progress

                

            }
        )
    }
}