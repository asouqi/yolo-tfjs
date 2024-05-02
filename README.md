# ⚡️ Load your YOLO v5 or v8 model in browser

Run object detection models trained with YOLOv5 YOLOv8 in browser using tensorflow.js

## Demo
check out a demo of Aquarium Dataset object detection 

## Install

### Yarn
    yarn add yolo-tfjs
### Or NPM
    npm install yolo-tfjs

## Usage Example

```javascript
import YOLOTf from "yolo-tfjs";

const CLASSES = ["fish", "jellyfish"]
const COLORS = ["#00C2FF", "#FF9D97"]
const imageRef = useRef<HTMLImageElement>(null)

// load model files
const yoloTf = await YOLOTf.loadYoloModel(`model_path/model.json`, CLASSES, {
    yoloVersion: 'v8', onProgress(fraction: number){
        console.log('loading model...')
    }})

// return dection results with detected boxes
const results = await yoloTf.predict(imageRef.current)

// draw boxes in the canvas element
yoloTf.renderBox(canvasRef.current, {
    ...results, ratio: [results["xRatio"],results["yRatio"]]
}, COLORS)

```

## API Docs

### loadYoloModel(model, classes, config): YOLOTf

#### Args

Param | Type | Description
-- | -- | --
model | string | path to model.json file
classes | string[] | classes of the trained model
config | Object | see below model configuration

Config | Type | Default | Description
-- | -- | -- | --
| [options.scoreThreshold] | <code>Number</code> | <code>0.5</code> | |
| [options.iouThreshold] | <code>Number</code> | <code>0.45</code>  | |
| [options.maxOutputSize] | <code>Number</code> | <code>500</code>  | |
| [options.onProgress] | <code>Callback</code> | <code>(fraction: number) => void</code> | |
| [options.yoloVersion] | <code>YoloVersion</code> | _ | selected version v5 or v8 |

### YOLOTf
#### PredictionData: `{boxes, classes, scores, xRatio, yRatio}`

#### predict(image, preprocessImage): PredictionData

Param | Type | Description
-- | -- | --
image | HTMLImageElement |
preprocessImage | (image: HTMLImageElement) => PreprocessResult | this optional param to use custom image preprocessing 

#### renderBox(canvas, predictionData, colors): {boxes, classes, scores, xRatio, yRatio}
