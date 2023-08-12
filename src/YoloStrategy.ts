import { Rank, Tensor } from '@tensorflow/tfjs';
import { YoloV5 } from './YoloV5';
import { YoloV8 } from './YoloV8';
import { ModelConfig } from './types';

export abstract class YoloStrategy {
  classes: string[];

  constructor(classes: string[]) {
    this.classes = classes;
  }

  static createStrategy(classes: string[], config: ModelConfig) {
    switch (config.yoloVersion) {
      case 'v5':
        return new YoloV5(classes);
      case 'v8':
        return new YoloV8(classes);
    }
  }

  abstract getPredictionData(output: Tensor<Rank> | Tensor[]): {
    boxes: Tensor<Rank.R2>;
    scores: Tensor<Rank.R1>;
    classes: Tensor<Rank.R1>;
  };
}
