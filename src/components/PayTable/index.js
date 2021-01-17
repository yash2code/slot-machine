import React from 'react';
import cn from 'classnames';
import slotConfig from "../../config/slot.config";
import ee, {eventTypes} from "../../config/emitter";

import './PayTable.scss';

class PayTable extends React.Component {

    constructor(props) {
        super(props);

        this.combinationPrefix = {
            group: 'group:',
            single: 'single:'
        };

        this.state = {
            winCombinationLine: {
                // [combination_key]: lineName
            }
        };


        this.onGameWin = this.onGameWin.bind(this);
        this.onGameStart = this.onGameStart.bind(this);

        ee.on(eventTypes.win, this.onGameWin);
        ee.on(eventTypes.gameStart, this.onGameStart);
    }

    componentWillUnmount() {
        ee.off(eventTypes.win, this.onGameWin);
        ee.off(eventTypes.gameStart, this.onGameStart);
    }

    onGameStart() {
        // TODO reset win lines
        this.setState({
            winCombinationLine: {},
        });
    }

    onGameWin({singleSlotMatches, groupMatches}) {
        const winCombinationLine = singleSlotMatches.concat(groupMatches).reduce((acc, match) => {
            const combinationKey = this.createCombinationStateKey(match.combinationKey, match.singleMatch);
            acc[combinationKey] = {
                ...(acc[combinationKey] || {}),
                [match.line]: true
            };
            return acc;
        }, {});

        this.setState({
            winCombinationLine,
        });
    }

    createCombinationStateKey(baseCombinationKey, isSingle) {
        return (isSingle
                ? this.combinationPrefix.single
                : this.combinationPrefix.group
        ) + baseCombinationKey;
    }

    isWinCombination(baseCombinationKey, {isSingle}) {
        const combinationKey = this.createCombinationStateKey(baseCombinationKey, isSingle);
        return this.state.winCombinationLine[combinationKey] !== undefined;
    }

    isWinLine(baseCombinationKey, { isSingle }, lineName) {
        const combinationKey = this.createCombinationStateKey(baseCombinationKey, isSingle);
        return this.state.winCombinationLine[combinationKey] && this.state.winCombinationLine[combinationKey][lineName];
    }

    render() {
        const payCombinations = Object.entries(
            {
                ...slotConfig.payTable.single,
                ...slotConfig.payTable.groups
            }
        );
        return (
            <div className="uk-card uk-card-default uk-card-body">
                <h2>Pay table</h2>
                <table className="uk-table uk-table-divider pay-table">
                    <thead>
                    <tr>
                        <th>
                            Combination
                        </th>
                        <th>
                            Pay
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {payCombinations.map(([combinationKey, combinationData]) => (
                        <tr key={combinationKey}>
                            <td  className={cn("uk-table-middle pay-table-combination", {
                                "blink--win": this.isWinCombination(combinationKey, combinationData)
                            })}>
                                {combinationKey.split(' ').map((slotName, i) =>
                                    <img className="combination-image"
                                         src={slotConfig.symbolsList[slotName].img}
                                         key={combinationKey + slotName + i}
                                         alt={slotName}/>)}
                            </td>
                            <td className="uk-table-middle">
                                <ul className="uk-list uk-list-bullet">
                                    <li className={cn({
                                        "blink--win": this.isWinLine(combinationKey, combinationData, 'top')
                                    })}>
                                        Top: {combinationData.top}
                                    </li>
                                    <li className={cn({
                                        "blink--win": this.isWinLine(combinationKey, combinationData, 'center')
                                    })}>
                                        Center: {combinationData.center}
                                    </li>
                                    <li className={cn({
                                        "blink--win": this.isWinLine(combinationKey, combinationData, 'bottom')
                                    })}>
                                        Bottom: {combinationData.bottom}
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PayTable;
