import * as React from "react";
import {Board} from "../../model/Board";
import Dropdown from "react-dropdown";

interface BoardSelectorProps {
    currentBoard: Board | null;
    boards: Array<Board> | null;
    changeBoard: (selectedBoardId: string) => void;
}

interface BoardOption {
    value: string;
    label: string;
}

export default class BoardSelector extends React.Component<BoardSelectorProps, {}> {

    constructor() {
        super();
        this.onChangeBoard = this.onChangeBoard.bind(this);
    }

    render() {

        let boardOptions: Array<BoardOption> | null = [];

        let selectedBoard;
        const {boards, currentBoard} = this.props;

        if (boards && currentBoard) {
            boardOptions = (this.props.boards || []).map((board) => ({value: board.id, label: board.name}));
            selectedBoard = {value: currentBoard.id, label: currentBoard.name};
        }

        return <Dropdown
            className="board-selector"
            options={boardOptions}
            onChange={this.onChangeBoard}
            value={selectedBoard}
            placeholder="No boards" />;

    }

    onChangeBoard(selectedBoardOption: BoardOption) {
        this.props.changeBoard(selectedBoardOption.value);
    }

}