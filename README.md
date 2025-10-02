# GaussianBlur
[index.html](index.html) implements very poor basic interface in html for the application
[main.js](main.js) is currently empty but will implement UI and connect it with algorithmic computational heavy part in [algo.js](algo.js) 
[workers.js](workers.js) This file will handle computational tasks in parallel threads using Web Workers.


## General logic of the application

1. User enters either the link or file to the application. After that some checks are performed to be sure that format is correct. 

2. Then image is shown in the left window on the website, and the app starts listening, until the button **Process an image** is pressed

3. At that moment, the current value of the slider is extracted and the algorithm is immediately started

4. After the execution of the algorithm, on success we present the blurred picture on the right, on failure we inform the user and suggest to repeat. During the execution the loading spinner is shown to the user

## Architecture of [main.js](main.js)

Here, we mainly control UI. We will stick to OOP-style, working with classes *UIHandler* and *LinkToMath*

The *UIHandler* class will have the following fields (UI elements):

1. *linkHolder*

2. *linkSubmit*

3. *fileSubmit*

4. *leftWindow*

5. *rightWindow*

6. *sliderBar*

7. *sliderValue*

8. *startButton*

9. *spinner*

and the following methods that will be callbacks

1. *onLinkUpload*

2. *onFileUpload*

3. *onSliderMoved*

4. *onExecStart*

5. *showSpinner*

6. *hideSpinner*

The class *LinkToMath* will have as fields all data extracted from users input that is relevant to processing algorithm, namely 

1. *image* - initial image

2. *imageData* - the *2d* array of pixels

3. *blurRadius* - radius in which we perform blurring

and methods, that will call functions from [algo.js](algo.js) to perform computations

1. *performBlur*


