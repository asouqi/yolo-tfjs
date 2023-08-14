import {ModelConfig} from "../types";
import {YoloV5} from "./YoloV5";
import {YoloV8} from "./YoloV8";

const createYoloDataExtractor = (classes: string[], config: ModelConfig) => {
    switch (config.yoloVersion) {
        case 'v5':
            return new YoloV5(classes);
        case 'v8':
            return new YoloV8(classes);
    }
}

export default createYoloDataExtractor
