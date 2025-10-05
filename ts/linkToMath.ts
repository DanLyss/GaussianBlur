export class LinkToMath{
    image: HTMLImageElement | null;
    postImage: HTMLImageElement | null;
    imageData: ImageData | null;
    processedImageData: ImageData | null;
    isProcessStarted: boolean;
    worker!: Worker;

    constructor(){
        this.image = null;
        this.postImage = null;
        this.imageData = null;
        this.processedImageData = null;
        this.isProcessStarted = false;

        this.worker = new Worker(
            new URL("./algoWorker.js", import.meta.url),
            { type: "module" }
        );

 }


    loadFromUrl(url: string): Promise<HTMLImageElement | false>{
        return new Promise(
            resolve =>{
                const img = new Image();
                img.crossOrigin = "anonymous"; 
                img.onload = () => {
                    if (img.width > 0 && img.height > 0){
                        this.image = img;
                        this.getImageData();
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

    loadFromFile(file: File): Promise<HTMLImageElement | false>{
        return this.loadFromUrl(URL.createObjectURL(file));
    }

    //not UI!!
    getImageData(){
        if (!this.image) return;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.drawImage(this.image, 0, 0);
        this.imageData =  ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    //not UI
    postImageInit(){
        if (!this.processedImageData) return;
        const canvas = document.createElement("canvas");
        canvas.width = this.processedImageData.width;
        canvas.height = this.processedImageData.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.putImageData(this.processedImageData, 0, 0);
        const dataUrl = canvas.toDataURL();
        const newImg = new Image();
        newImg.src = dataUrl;
        this.postImage = newImg;
    }


    requestedStart(blurRadius: number, 
        UIcall?: (progress: number) => void,
         timePeriod: number = 50):
         Promise<boolean | "stopped">{
        if (this.isProcessStarted === true){
            this.worker.postMessage({cmd: "stop"});
            return Promise.resolve("stopped");
        }
        
        this.isProcessStarted = true;
        return new Promise(
            resolve => {
                if (!this.image || !this.imageData){
                    this.isProcessStarted =  false;
                    resolve(false);
                    return;
                }

                this.worker.onmessage = (e) =>
                {
                    const msg = e.data;

                    if (msg.type === "stopped"){
                        this.isProcessStarted =  false;
                        resolve("stopped");
                    }

                    if (msg.type === "progress"){
                        if (UIcall){
                            UIcall(msg.progress);
                        }
                    }

                    
                    if (msg.type === "finished"){
                        this.isProcessStarted = false;
                        this.processedImageData = new ImageData(
                            new Uint8ClampedArray(msg.resultImage),
                            this.imageData!.width, 
                            this.imageData!.height
                        )

                        this.postImageInit();
                        resolve(true);
                    }
                }

                this.worker.postMessage({
                    cmd: "start",
                    blurRadius,
                    timePeriod,
                    inputPixels: this.imageData.data.buffer,
                    width: this.imageData.width,
                    height: this.imageData.height
                },
            )
            }
        )
    }
}