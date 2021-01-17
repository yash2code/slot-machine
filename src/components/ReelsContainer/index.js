import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Reel from '../Reel';

import _ from 'lodash';
import slotConfig from '../../config/slot.config';
import gameConfig from '../../config/game.config';
import ee, {eventTypes} from "../../config/emitter";

import './ReelsContainer.scss';

class ReelsContainer extends Component {
    constructor(props) {
        super(props);

        this.finishedReels = 0;

        this.state = {
            leftReel: this.getRandomSlots(3),
            centerReel: this.getRandomSlots(3),
            rightReel: this.getRandomSlots(3),
            winSlots: [
                [false, false, false], // leftReel
                [false, false, false], // centerReel
                [false, false, false] // rightReel
            ],
        };

        this.onAnimationEnd = this.onAnimationEnd.bind(this);
        this.onResult = this.onResult.bind(this);
        this.onGameStart = this.onGameStart.bind(this);
        this.onGameEnd = this.onGameEnd.bind(this);
        this.onWin = this.onWin.bind(this);

        ee.on(eventTypes.result, this.onResult);
        ee.on(eventTypes.win, this.onWin);
        ee.on(eventTypes.gameStart, this.onGameStart);
        ee.on(eventTypes.gameEnd, this.onGameEnd);
    }

    componentWillUnmount() {
        ee.off(eventTypes.result, this.onResult);
        ee.off(eventTypes.win, this.onWin);
        ee.off(eventTypes.gameStart, this.onGameStart);
        ee.off(eventTypes.gameEnd, this.onGameEnd);
    }

    getRandomSlots(limit = 1) {
        return _(slotConfig.symbolsOrder)
            .shuffle()
            .take(limit)
            .valueOf()
    }

    convertCombinationToReels(combination) {
        const result = [
            [combination[0][0], combination[1][0], combination[2][0]], // leftReel
            [combination[0][1], combination[1][1], combination[2][1]], // centerReel
            [combination[0][2], combination[1][2], combination[2][2]] // rightReel
        ];
        return result;
    }

    convertLinesToWinSlots(winLines) {
        const winSlots = [
            winLines.has('top'),
            winLines.has('center'),
            winLines.has('bottom'),
        ];
        return [winSlots, winSlots, winSlots];
    }

    onResult({combination}) {
        const [leftReel, centerReel, rightReel] = this.convertCombinationToReels(combination);

        this.setState({
            leftReel,
            centerReel,
            rightReel
        });
    }

    onAnimationEnd() {
        this.finishedReels++;
        if (this.finishedReels >= gameConfig.reelsCount) {
            _.defer(() => ee.emit(eventTypes.spinEnd));
        }
    }

    onGameStart() {
        // Clear win slots
        this.setState({
            winSlots: [
                [false, false, false], // leftReel
                [false, false, false], // centerReel
                [false, false, false] // rightReel
            ]
        });
    }

    onWin({winLines}) {
        this.setState({
            winSlots: this.convertLinesToWinSlots(winLines),
        });
    }

    onGameEnd() {
        this.finishedReels = 0;
    }

    render() {
        return (
            <div className="uk-card uk-card-default uk-card-body uk-grid uk-grid-collapse reels-container">
                <div className="reel-1 uk-width-1-3">
                    <Reel onSpinEnd={this.onAnimationEnd} reelKey="left" winSlots={this.state.winSlots[0]}
                          slots={this.state.leftReel}/>
                </div>
                <div className="reel-2  uk-width-1-3">
                    <Reel onSpinEnd={this.onAnimationEnd} reelKey="center" winSlots={this.state.winSlots[1]}
                          slots={this.state.centerReel}/>
                </div>
                <div className="reel-3  uk-width-1-3">
                    <Reel onSpinEnd={this.onAnimationEnd} reelKey="right" winSlots={this.state.winSlots[2]}
                          slots={this.state.rightReel}/>
                </div>
                <div className="uk-width-1-1 uk-align-self-center">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

ReelsContainer.propTypes = {
    children: PropTypes.node
};

ReelsContainer.defaultProps = {
    children: null
};

export default ReelsContainer;
