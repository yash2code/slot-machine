import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import _ from 'lodash';
import ReelSymbol from '../ReelSymbol';

import slotConfig from '../../config/slot.config';
import ee, { eventTypes } from "../../config/emitter";

import './Reel.scss';

class Reel extends Component {
    constructor(props) {
        super(props);
        this.state = {
          reelClasses: []
        };
        this.isSymbolWin = this.isSymbolWin.bind(this);
        this.onGameStart = this.onGameStart.bind(this);
        this.onSpinEnd = this.onSpinEnd.bind(this);

        ee.on(eventTypes.gameStart, this.onGameStart);
    }

    componentWillUnmount() {
        ee.off(eventTypes.gameStart, this.onGameStart)
    }

    onGameStart() {
        this.setState({
            reelClasses: ['reel-spinning']
        });
    }

    onSpinEnd({ animationName }) {
        if (animationName === 'reel-spinning') {
            this.setState({
                reelClasses: ['reel-spin-stop']
            });
        }
        if (animationName === 'reel-spin-stop') {
            this.props.onSpinEnd();
        }
    }

    isSymbolWin(i) {
        return this.props.winSlots[i];
    }

    render() {
        return (
            <div className={cn("uk-position-relative reel")}>
                <div
                   className={
                       cn({
                           "reel-visible": true,
                       },  this.state.reelClasses)
                   }
                   onAnimationEnd={this.onSpinEnd}
                >
                    {
                        _.shuffle(slotConfig.symbolsOrder.concat(slotConfig.symbolsOrder)).map((symbolName, i) => (
                                <ReelSymbol
                                    config={slotConfig.symbolsList[symbolName]}
                                    key={this.props.reelKey + symbolName + i + 'static-1'}
                                    isWin={false}
                                    isStatic={true}
                                />
                            )
                        )
                    }
                    {
                        this.props.slots
                            .map((symbolName, i) => (
                                    <ReelSymbol
                                        config={slotConfig.symbolsList[symbolName]}
                                        key={this.props.reelKey + symbolName + i}
                                        isWin={this.isSymbolWin(i)}
                                    />
                                )
                            )
                    }
                </div>
            </div>
        );
    }
}

Reel.propTypes = {
    slots: PropTypes.array.isRequired,
    winSlots: PropTypes.array.isRequired,
    reelKey: PropTypes.oneOf(['left', 'center', 'right']).isRequired,
    onSpinEnd: PropTypes.func.isRequired,
    isStatic: PropTypes.bool
};

Reel.defaultProps = {
    isStatic: false
};

export default Reel;
