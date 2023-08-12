import { YoloStrategy } from './YoloStrategy';
import { add, concat, div, Rank, sub, Tensor, tidy } from '@tensorflow/tfjs';
import { Slice } from './types';

const END = [-1, -1, 1] as Slice | undefined;

export class YoloV8 extends YoloStrategy {
  getPredictionData(output: any) {
    const boxes = tidy(() => {
      const width = output.slice([0, 0, 2] as Slice, END) as Tensor;
      const height = output.slice([0, 0, 3] as Slice, END) as Tensor;
      const x1 = sub(output.slice([0, 0, 0] as Slice, END) as Tensor, div(width, 2));
      const y1 = sub(output.slice([0, 0, 1] as Slice, END) as Tensor, div(height, 2));
      const x2 = add(x1, width);
      const y2 = add(y1, height);
      return concat([x1, y1, y2, x2], 2).squeeze();
    }) as Tensor<Rank.R2>;

    const [scores, classes] = tidy(() => {
      const scores = (output.slice([0, 0, 4] as Slice, [-1, -1, this.classes.length] as Slice) as Tensor).squeeze();
      return [scores.max(1), scores.argMax(1)] as any;
    }) as Tensor<Rank.R1>[];

    return { boxes, scores, classes };
  }
}
