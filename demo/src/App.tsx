import React, {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import YOLOTf from "yolo-tfjs";
import ClockLoader from "react-spinners/ClockLoader";
import ClassesViewer from "./ClassesViewer";


export const CLASSES = ["fish", "jellyfish", "penguin", "puffin", "shark", "starfish", "stingray"]


export const COLORS = [
  "#00C2FF",
  "#FF9D97",
  "#FF701F",
  "#FFB21D",
  "#CFD231",
  "#48F90A",
  "#92CC17",
];


type YoloVersion = 'v8' | 'v5';

const App: React.FC = () => {
  const [version, setVersion] = useState<YoloVersion>('v8')
  const onChangeModelVersion = (e: React.ChangeEvent<HTMLSelectElement>) =>
      setVersion(e.target.value as YoloVersion)

  const [modelLoading, setModelLoading] = useState<number | undefined>(undefined)
  const [yoloTf, setYoloTf] = useState<YOLOTf | undefined>(undefined)

  useEffect(() => {
    (async () => {
      const yoloTf = await YOLOTf.loadYoloModel(`${window.location.href}yolo${version}n/model.json`, CLASSES, {
            yoloVersion: version, onProgress(fraction: number){
            setModelLoading(fraction)
      }})
      setTimeout(() => {
        setModelLoading(undefined)
      },1000)
      setYoloTf(yoloTf)
    })()
  },[version])


  const inputImageRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onUploadImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files;
    if (!files || !imageRef.current) return

    imageRef.current.src = URL.createObjectURL(files[0])
    imageRef.current.style.display = "block";
  },[])

  const detectImage = useCallback(async () => {
    if (!yoloTf || !imageRef.current || !canvasRef.current) return

    const results = await yoloTf.predict(imageRef.current)

    yoloTf.renderBox(canvasRef.current, {
      ...results, ratio: [results["xRatio"],results["yRatio"]]
    }, COLORS)
  }, [yoloTf])


  return <div className={'container'}>
    <div className={'header'}>
      <div>
        <p>
          Demo for using <code>yolo-tfjs</code> with yoloV8 & yoloV5 models trained on <a
            href={'https://public.roboflow.com/object-detection/aquarium'}>Aquarium Dataset</a>
        </p>
      </div>

      <div>
        model version: <select name={version} id={version} onChange={onChangeModelVersion}>
        <option value={"v8"}>yolo v8</option>
        <option value={"v5"}>yolo v5</option>
      </select>

      <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onUploadImage}
            ref={inputImageRef}
        />
      <button disabled={!!modelLoading} className={'control'} onClick={() => inputImageRef.current?.click()}>
        upload image
      </button>
      <button disabled={!!modelLoading} className={'control'} onClick={() => {
        if(imageRef.current) {
           imageRef.current.src = `${window.location.href}jellyfish.jpg`
           imageRef.current.style.display = "block"
        }
      }}>
        use test image
      </button>
      </div>
    </div>

    <div className={'prediction-container'}>
    {!!modelLoading && <div>
      <ClockLoader color={'#36D7B7'} size={150}/>
      <h4>Loading Model {(modelLoading * 100).toFixed(2)}%</h4>
    </div>}

    {!modelLoading &&
    <div className={`content`}>
      <img src={"#"} ref={imageRef} onLoad={detectImage} />
      <canvas width={640} height={640} ref={canvasRef}/>
    </div>}

    {!modelLoading && <ClassesViewer />}
    </div>
  </div>
}

export default App;
