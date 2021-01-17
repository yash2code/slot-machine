import React from 'react';
import _ from 'lodash';

import ReelsContainer from "../../components/ReelsContainer";
import Button from "../../components/Button";
import DebugArea from "../../components/DebugArea";
import PayTable from "../../components/PayTable";
import BalanceIndicator from "../../components/BalanceIndicator";
import AudioContainer from "../../components/Audio/Audio";

import ee, {eventTypes} from '../../config/emitter';
import slotConfig from "../../config/slot.config";
import gameConfig from "../../config/game.config";
import {GameError, errorCodes} from "../../config/errors";

import './App.scss';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameId: 0,
            balance: 100, // initial balance
            isLock: false,
            gameMode: 'random'
        };
        ee.enableLogging(); 

        ee.on(eventTypes.setRandomMode, () => {
            this.setState({
                gameMode: 'random',
            })
        });
        ee.on(eventTypes.setFixedMode, () => {
            this.setState({
                gameMode: 'fixed',
            })
        });
    }

    calculateResultCombination() {
        const maxIndex = slotConfig.symbolsOrder.length - 1;
        const result = [
            [ // Top line
                slotConfig.symbolsOrder[_.random(0, maxIndex)],
                slotConfig.symbolsOrder[_.random(0, maxIndex)],
                slotConfig.symbolsOrder[_.random(0, maxIndex)],
            ],
            [ // Center line
                slotConfig.symbolsOrder[_.random(0, maxIndex)],
                slotConfig.symbolsOrder[_.random(0, maxIndex)],
                slotConfig.symbolsOrder[_.random(0, maxIndex)],
            ],
            [ // Bottom line
                slotConfig.symbolsOrder[_.random(0, maxIndex)],
                slotConfig.symbolsOrder[_.random(0, maxIndex)],
                slotConfig.symbolsOrder[_.random(0, maxIndex)],
            ],
        ];

        return result;
    }

    getLineNameByIndex(index) {
        switch (index) {
            case 0:
                return 'top';
            case 1:
                return 'center';
            case 2:
                return 'bottom';
            default:
                throw new Error('Undefined line index ' + index);
        }
    }

    calculatePay(combination) {
        let pay = 0;
        const singleSlotMatches = [];
        const groupMatches = [];
        const winLines = new Set();

        combination.forEach((lineSlots, index) => {
            const lineKey = lineSlots.join(' ');
            const lineName = this.getLineNameByIndex(index);

            // Calculate matcher by single slots
            const singleMatch = slotConfig.payTable.single[lineKey];
            if (singleMatch !== undefined) {
                singleSlotMatches.push({
                    line: lineName,
                    value: singleMatch[lineName],
                    combinationKey: lineKey,
                    singleMatch: true,
                    groupMatch: false
                });
                pay += singleMatch[lineName];
                winLines.add(lineName);
            }

            // Calculate group matches
            const lineSlotsGroupKey = lineSlots.map(slotName => slotConfig.symbolsList[slotName].group).join(' ');

            const groupMatch = slotConfig.payTable.groups[lineSlotsGroupKey];

            if (groupMatch !== undefined) {
                groupMatches.push({
                    line: lineName,
                    value: groupMatch[lineName],
                    combinationKey: lineSlotsGroupKey,
                    singleMatch: false,
                    groupMatch: true
                });
                pay += groupMatch[lineName];
                winLines.add(lineName);
            }

        });

        return {
            singleSlotMatches,
            groupMatches,
            winLines: winLines,
            pay,
            combination
        }
    }

    async initGame() {
        if (this.state.isLock) {
            console.warn('Game already started');
            return false;
        }

        this.setState({isLock: true});

        try {
            const gameId = this.state.gameId + 1;
            const balance = this.state.balance;

            if (balance < gameConfig.spinCost) {
                throw new GameError(errorCodes.lowBalance.code, 'Your balance is less than', gameConfig.spinCost)
            }

            ee.emit(eventTypes.gameStart, {gameId});

            const spinPromise = new Promise(resolve => {
                ee.once(eventTypes.spinEnd, resolve);
            });

            this.setState(state => ({
                gameId,
                balance: state.balance - gameConfig.spinCost
            }));

            const combination = this.state.gameMode === 'random'
                ? this.calculateResultCombination()
                : await new Promise(resolve => {
                    ee.once(eventTypes.responseFixedValues, resolve);
                    ee.emit(eventTypes.requestFixedValues);
                });
            const result = this.calculatePay(combination);

            // TODO remove console.log
            console.table(combination);
            console.log(result);

            ee.emit(eventTypes.result, result);

            await spinPromise; // End spinning

            const isWin = result.pay > 0;

            this.setState(state => ({
                balance: state.balance + result.pay
            }));

            if (isWin) {
                ee.emit(eventTypes.win, result);
            } else {
                ee.emit(eventTypes.loose, result);
            }
        } catch (e) {
            if (e instanceof GameError) {
                this.onGameError(e);
            }
            throw e;
        } finally {
            this.setState({isLock: false});
            ee.emit(eventTypes.gameEnd, {gameId: this.state.gameId});
        }
    }

    onBalanceInputChange({ target }) {
        this.setState({ balance: target.value });
    }

    onGameError(e) {
        alert(e.message);
        console.warn(e);
    }

    onSpinClick() {
        this.initGame();
    }

    render() {
        return (
            <div className="App">
                <AudioContainer src="spin.mp3" playOn={eventTypes.gameStart} resetOn={eventTypes.spinEnd} />
                <AudioContainer src="win.mp3" playOn={eventTypes.win} resetOn={eventTypes.gameStart} />
                <AudioContainer src="loose.mp3" playOn={eventTypes.loose} resetOn={eventTypes.gameStart} />
                <div className="uk-grid uk-grid-medium">
                    <div className="uk-width-1-1 game-container">
                        <div className="uk-flex uk-flex-center uk-flex-column">
                            <div className="uk-width-1-1">
                                <BalanceIndicator balance={this.state.balance} onBalanceChange={this.onBalanceInputChange.bind(this)}/>
                            </div>
                            <div className="uk-width-1-1">
                                <ReelsContainer>
                                    <div className="uk-flex uk-flex-center">
                                        <Button value="Spin!"
                                                round={true}
                                                onClick={this.onSpinClick.bind(this)}
                                                isDisabled={this.state.isLock}
                                        />
                                    </div>
                                </ReelsContainer>
                            </div>
                        </div>
                    </div>
                    <div className="uk-width-1-2@m uk-width-1-1">
                        <DebugArea/>
                    </div>
                    <div className="uk-width-1-2@m uk-width-1-1">
                        <PayTable/>
                    </div>
                </div>

            </div>
        );
    }
}

export default App;
