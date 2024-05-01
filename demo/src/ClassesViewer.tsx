import React from "react";
import {CLASSES, COLORS} from "./App";

const ClassesViewer: React.FC = () => {
    return <div className={'labels'}>
        {CLASSES.map((label, index) => <div className={'label'}>
            <div className={'label-color'} style={{backgroundColor: COLORS[index]}}/>
            <div>{label}</div>
        </div>)}
    </div>
}

export default ClassesViewer
