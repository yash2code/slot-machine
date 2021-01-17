import React from 'react'
import PropTypes from 'prop-types'

import gameConfig from '../../config/game.config'
import './BalanceIndicator.scss'

const BalanceIndicator = ({ balance, onBalanceChange }) => (
  <div className='uk-card uk-card-default uk-card-body'>
    <div className='uk-flex uk-flex-center uk-flex-middle'>
      <h3 className='uk-text-center uk-width-auto uk-margin-small'>
        Your balance:
      </h3>
      <input
        type='number'
        step='1'
        min={gameConfig.minInputBalance}
        max={gameConfig.maxInputBalance}
        value={balance}
        onChange={onBalanceChange}
        className='uk-input uk-width-auto'
      />
    </div>
  </div>
)

BalanceIndicator.propTypes = {
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onBalanceChange: PropTypes.func.isRequired,
}

export default BalanceIndicator
