import React, {Component} from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';

import './ReelSymbol.scss';

class ReelSymbol extends Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return !this.props.isStatic // Do not update static slots
    }
    render() {
        return (
            <div className={cn({
                "uk-card": true,
                "uk-text-center": true,
                "reel-symbol": true,
                "blink--win": this.props.isWin,
            })}>
                <img src={this.props.config.img} alt={this.props.config.value}/>
            </div>
        );
    }
}

ReelSymbol.propTypes = {
    config: PropTypes.shape({
        img: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
    }).isRequired,
    isWin: PropTypes.bool,
    isStatic: PropTypes.bool,
};

ReelSymbol.defaultProps = {
    isWin: false,
    isStatic: false,
};

export default ReelSymbol;
