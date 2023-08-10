import React, {ReactElement} from 'react';
import './filling-coffee-mug.scss';

export interface FillingCoffeeMugComponentProps {
    /**
     * The maximum value for filling the mug.
     */
    maxValue: number;
}

/**
 * Component for the filling coffee mug, which is displayed while brewing coffee.
 */
export function FillingCoffeeMugComponent(props: FillingCoffeeMugComponentProps): ReactElement {

    return (<div className="cup d-flex justify-content-center mb-2" style={{animation: `filling ${props.maxValue}s`}}>
        <span className="steam"></span>
        <span className="steam"></span>
        <span className="steam"></span>
        <div className="cup-handle"></div>
    </div>)
}