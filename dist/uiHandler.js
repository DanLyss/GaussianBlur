import { LinkToMath } from "./linkToMath.js";
export class UIHandler {
    linkHolder;
    linkSubmit;
    fileSubmit;
    preWindow;
    postWindow;
    sliderBar;
    sliderValue;
    startButton;
    spinner;
    Message;
    downloadButton;
    linkToMath;
    //initialize the UI elements related fields
    constructor() {
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
        this.downloadButton = document.getElementById("downloadResult");
        this.bindEvents();
        //to create a connection 
        this.linkToMath = new LinkToMath();
        //sync slider with value
        this.sliderValue.textContent = this.sliderBar.value;
    }
    //start listening
    bindEvents() {
        this.linkSubmit.addEventListener("click", this.onLinkUpload.bind(this));
        this.fileSubmit.addEventListener("change", this.onFileUpload.bind(this));
        this.startButton.addEventListener("click", this.onExecStart.bind(this));
        this.sliderBar.addEventListener("input", this.updSliderValue.bind(this));
        this.downloadButton.addEventListener("click", this.onDownloadButton.bind(this));
    }
    async onLinkUpload(event) {
        let url = this.linkHolder.value;
        const result = await this.linkToMath.loadFromUrl(url);
        if (result === false) {
            this.showText("Failure to read uploaded file");
        }
        else {
            this.drawPicture();
        }
    }
    async onFileUpload(event) {
        const target = event.target;
        let file = target.files?.[0];
        if (!file)
            return;
        const result = await this.linkToMath.loadFromFile(file);
        if (result === false) {
            this.showText("Failure to read uploaded file");
        }
        else {
            this.drawPicture();
        }
    }
    onDownloadButton(event) {
        const canvas = this.postWindow;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        if (data.every(v => v === 0)) {
            this.showText("Attempt to download empty canvas");
        }
        else {
            canvas.toBlob(b => {
                if (!b)
                    return;
                const a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.download = "processed.png";
                a.click();
                URL.revokeObjectURL(a.href);
            });
        }
    }
    async onExecStart(event) {
        this.showSpinner();
        this.clearPostWindow();
        this.startButton.textContent = "Stop processing";
        let result = await this.linkToMath.requestedStart(parseInt(this.sliderBar.value, 10), (progress) => {
            this.Message.textContent = `Progress is ${progress}% `;
        }, 50);
        this.startButton.textContent = "Start processing";
        if (result === true) {
            this.showText("Job is done");
            this.drawPicture("post");
        }
        this.hideSpinner();
        if (result === "stopped") {
            this.showText("You stopped the processing");
        }
        if (result === false) {
            this.showText("No Image was chosen previously");
        }
    }
    //spiner handling
    showSpinner() {
        this.spinner.style.display = "block";
    }
    hideSpinner() {
        this.spinner.style.display = "none";
    }
    //slider value update
    updSliderValue(event) {
        this.sliderValue.textContent = this.sliderBar.value;
    }
    drawPicture(window = "pre") {
        if (window === "pre") {
            let ctx = this.preWindow.getContext("2d");
            if (!ctx)
                return;
            let img = this.linkToMath.image;
            if (!img)
                return;
            this.preWindow.width = img.width;
            this.preWindow.height = img.height;
            ctx.drawImage(img, 0, 0);
            this.preWindow.style.width = "400px";
            this.preWindow.style.height = "400px";
        }
        else if (window === "post") {
            let ctx = this.postWindow.getContext("2d");
            if (!ctx)
                return;
            let img = this.linkToMath.postImage;
            if (!img)
                return;
            this.postWindow.width = img.width;
            this.postWindow.height = img.height;
            ctx.drawImage(img, 0, 0);
            this.postWindow.style.width = "400px";
            this.postWindow.style.height = "400px";
        }
    }
    showText(text) {
        this.Message.textContent = text;
        setTimeout(() => { this.Message.textContent = ""; }, 1000);
    }
    clearPostWindow() {
        this.postWindow.style.width = "400px";
        this.postWindow.style.height = "400px";
        this.postWindow.width = 400;
        this.postWindow.height = 400;
    }
}
