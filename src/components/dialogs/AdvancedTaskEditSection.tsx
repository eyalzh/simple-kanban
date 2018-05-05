import * as React from "react";
import CollapsableFieldSet from "../fields/CollapsableFieldSet";
import FormField from "../fields/FormField";
import SelectColorField from "../fields/SelectColorField";
import {Column} from "../../model/Column";
import {allowBinds, bind} from "../../util";
import {Board} from "../../model/Board";

const NO_BOARD = "__no_board__";

interface AdvancedTaskEditSectionProps {
    boardList: Board[];
    columnList: Column[] | null;
    color: string;
    sideColor?: string;
    baseColumnId?: string;
    linkToBoardId?: string;
    onColorChanged: (color: string) => void;
    onSideColorChanged: (color: string) => void;
    onResetSideColor: () => void;
    onResetColors: () => void;
    onBaseColChanged: (baseColumnId: string) => void;
    onLinkToBoardChanged: (linkToBoardId: string | undefined) => void;
}

@allowBinds
export default class AdvancedTaskEditSection extends React.Component<AdvancedTaskEditSectionProps> {

    render() {

        let columnOptions: JSX.Element[] = [];
        if (this.props.columnList) {
            columnOptions = this.props.columnList.map(column => {
                return (
                    <option key={column.id} value={column.id}>{column.name}</option>
                );
            });
        }

        let boardOptions: JSX.Element[] = [];
        if (this.props.boardList) {
            boardOptions = this.props.boardList.map(board => {
                return (
                    <option key={board.id} value={board.id}>{board.name}</option>
                );
            });
        }

        return (
            <CollapsableFieldSet label="Advanced">

                <FormField caption="Background color">
                    <SelectColorField value={this.props.color} onChange={this.props.onColorChanged}/> (<span
                    className="reset-color-btn" onClick={this.props.onResetColors}>reset</span>)
                </FormField>
                <FormField caption="Side color">
                    <SelectColorField value={this.props.sideColor}
                                      onChange={this.props.onSideColorChanged}/> (<span
                    className="reset-color-btn" onClick={this.props.onResetSideColor}>reset</span>)
                </FormField>

                <div className="field-row">

                    <FormField caption="Base column">
                        <select onChange={this.onBaseColChanged} value={this.props.baseColumnId}>
                            {columnOptions}
                        </select>
                    </FormField>

                    <FormField caption="Link to board">
                        <select onChange={this.onLinkToBoardChanged} value={this.props.linkToBoardId}>
                            <option value={NO_BOARD}>Select board</option>
                            {boardOptions}
                        </select>
                    </FormField>

                </div>

            </CollapsableFieldSet>
        );
    }

    @bind
    private onBaseColChanged(ev: React.FormEvent<HTMLSelectElement>) {
        const baseColumnId = ev.currentTarget.value;
        this.props.onBaseColChanged(baseColumnId);
    }

    @bind
    private onLinkToBoardChanged(ev: React.FormEvent<HTMLSelectElement>) {
        const linkToBoardId = ev.currentTarget.value;
        this.props.onLinkToBoardChanged(linkToBoardId === NO_BOARD ?  undefined : linkToBoardId);
    }

}
