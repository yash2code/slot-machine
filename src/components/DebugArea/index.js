import React from 'react';
// import cn from 'classnames';
import _ from 'lodash';

import Switch from "../Switch";

import slotConfig from "../../config/slot.config";
import ee, {eventTypes} from "../../config/emitter";

class DebugArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameResult: undefined,
            gameId: 0,
            isDebug: false,
            fixedResult: [
                _.take(slotConfig.symbolsOrder, 3),
                _.take(slotConfig.symbolsOrder, 3),
                _.take(slotConfig.symbolsOrder, 3)
            ]
        };

        this.onLoose = this.onLoose.bind(this);
        this.onWin = this.onWin.bind(this);
        this.onGameStart = this.onGameStart.bind(this);
        this.onRequestFixedValues = this.onRequestFixedValues.bind(this);

        ee.on(eventTypes.win, this.onWin);
        ee.on(eventTypes.loose, this.onLoose);
        ee.on(eventTypes.gameStart, this.onGameStart);
        ee.on(eventTypes.requestFixedValues, this.onRequestFixedValues);
    }

    componentWillUnmount() {
        ee.off(eventTypes.win, this.onWin);
        ee.off(eventTypes.loose, this.onLoose);
        ee.off(eventTypes.gameStart, this.onGameStart);
        ee.off(eventTypes.requestFixedValues, this.onRequestFixedValues);
    }

    onWin() {
        this.setState({gameResult: 'WIN'})
    }

    onLoose() {
        this.setState({gameResult: 'LOOSE'})
    }

    onGameStart({gameId}) {
        this.setState({
            gameId,
            gameResult: 'PENDING',
        })
    }

    onRequestFixedValues() {
        ee.emit(eventTypes.responseFixedValues, this.state.fixedResult);
    }

    onModeInputChange() {
        this.setState(state => ({
            isFixedMode: !state.isFixedMode,
        }), () => {
            const eventName = this.state.isFixedMode
                ? eventTypes.setFixedMode
                : eventTypes.setRandomMode;
            ee.emit(eventName)
        })
    }

    onSlotSelected({lineIndex, slotIndex, value}) {
        const newFixedResult = this.state.fixedResult;
        newFixedResult[lineIndex][slotIndex] = value;

        this.setState({fixedResult: newFixedResult});

        ee.emit(eventTypes.responseFixedValues, this.state.fixedResult)
    }

    getLineSelectInput({lineIndex, slotIndex}) {
        const value = this.state.fixedResult[lineIndex][slotIndex];
        return (
            <div key={`${lineIndex}-${slotIndex}`}>
                <select className="uk-select"
                        value={value}
                        onChange={({target}) => this.onSlotSelected({lineIndex, slotIndex, value: target.value})}
                >
                    {slotConfig.symbolsOrder.map(slotName => (
                        <option key={`${lineIndex}-${slotIndex}-${slotName}`} value={slotName}>
                            {slotName}
                        </option>
                    ))}
                </select>
            </div>
        )
    }

    render() {
        return (
            <React.Fragment>
                <div className="uk-card uk-card-default uk-card-body">
                    <h3 className="uk-card-title uk-margin-remove-top">Debug Area.</h3>
                    <p>
                        Game id: {this.state.gameId}
                    </p>
                    <p>
                        Game Result: <span className="uk-text-uppercase">{this.state.gameResult || 'None'} </span>
                    </p>
                    <p>
                        Fixed mode: <Switch onChange={this.onModeInputChange.bind(this)}
                                            checked={this.state.isFixedMode}/>
                    </p>
                    <section>
                        <h5> Define expected result </h5>
                        <div>
                            {
                                [0, 1, 2].map(lineIndex => {
                                    return (
                                        <div className="uk-grid" key={lineIndex}>
                                            {
                                                [0, 1, 2].map(slotIndex => this.getLineSelectInput({
                                                    lineIndex,
                                                    slotIndex
                                                }))
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </section>
                </div>
            </React.Fragment>
        );
    }
}

export default DebugArea;
