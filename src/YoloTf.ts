import {
  loadGraphModel,
  ready,
  browser,
  image as tfImage,
  GraphModel,
  tidy,
  Tensor4D,
  engine,
  dispose,
  TensorContainer
} from '@tensorflow/tfjs';

import { ModelConfig, PreprocessImage } from './types';
import createYoloDataExtractor from "./yolo/YoloContext";

const SCORE_THRESHOLD = 0.5;
const MAX_OUTPUT_SIZE = 500;
const IOU_THRESHOLD = 0.45;

/**
 * Load your YOLO(v5, v8) model, and prepare it for prediction of objects
 */
export class YOLOTf {
  private readonly model: GraphModel;
  private readonly classes: string[];
  private readonly config: ModelConfig;

  private constructor(model: GraphModel, classes: string[], config: ModelConfig) {
    this.model = model;
    this.classes = classes;
    this.config = config;
  }

  static async loadYoloModel(modelPath: string, classes: string[], config: ModelConfig) {
    try {
      await ready();

      const model = await loadGraphModel(modelPath, {
        onProgress: config?.onProgress,
      });

      return new YOLOTf(model, classes, config);
    } catch (e) {
      throw Error((e as any).toString());
    }
  }

  async predict(image: HTMLImageElement, preprocessImage?: PreprocessImage) {
    engine().startScope();

    const { input, xRatio, yRatio } = preprocessImage ? preprocessImage(image) : this.preprocessImage(image);
    const yolo = createYoloDataExtractor(this.classes, this.config);

    const output = await this.model.executeAsync(input);
    const data = yolo.getPredictionData(output);

    const nms = await tfImage.nonMaxSuppressionAsync(
      data.boxes,
      data.scores,
      MAX_OUTPUT_SIZE,
      IOU_THRESHOLD,
      this.config.scoreThreshold ? this.config.scoreThreshold : SCORE_THRESHOLD,
    );

    const boxes = data.boxes.gather(nms, 0).dataSync();
    const scores = data.scores.gather(nms, 0).dataSync();
    const classes = data.classes.gather(nms, 0).dataSync();

    dispose([output, data, nms] as TensorContainer);
    engine().startScope();

    return { boxes, scores, classes, xRatio, yRatio };
  }

  /**
   * Resize image to model input shape, and pad image
   */
  private preprocessImage(image: HTMLImageElement) {
    const shape = this.model.inputs[0].shape.slice(1, 3);
    if (!shape) {
      throw Error("Can't find the input shape in the model, please pass them to this function.");
    }

    let xRatio, yRatio;

    const [modelInputWidth, modelInputHeight] = shape;

    const input = tidy(() => {
      const tfImg = browser.fromPixels(image);
      const [width, height] = tfImg.shape as number[];
      const maxSize = Math.max(width, height);
      const paddedImage = tfImg.pad([
        [0, maxSize - height],
        [0, maxSize - height],
        [0, 0],
      ]);

      xRatio = maxSize / height;
      yRatio = maxSize / width;

      return tfImage
        .resizeBilinear(paddedImage as Tensor4D, [modelInputWidth, modelInputHeight])
        .div(255.0)
        .expandDims(0);
    });

    return { input, xRatio, yRatio };
  }
}
