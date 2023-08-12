import { YoloStrategy } from './YoloStrategy';
import { Rank, Tensor } from '@tensorflow/tfjs';

export class YoloV5 extends YoloStrategy {
  getPredictionData(output: any) {
    const [boxes, scores, classes] = output.slice(0, 3) as [Tensor<Rank.R2>, Tensor<Rank.R1>, Tensor<Rank.R1>];
    return { boxes, scores, classes };
  }
}
