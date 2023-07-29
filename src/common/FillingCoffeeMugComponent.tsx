import React, {ReactElement} from 'react';
import './filling-coffee-mug.scss';

export interface FillingCoffeeMugComponentProps {
    value?: number;
    maxValue: number;
}

export function FillingCoffeeMugComponent(props: FillingCoffeeMugComponentProps): ReactElement {


    //@keyframes filling {
//  0%, 100% {
//    background-position: 0 130px;
//  }
//
//  50% {
//    background-position: 600px -70px;
//  }
//}


return (<div className="cup d-flex justify-content-center mb-2" style={{animation: `filling ${props.maxValue}s`}}>
    <span className="steam"></span>
    <span className="steam"></span>
    <span className="steam"></span>
    <div className="cup-handle"></div>
</div>)
}