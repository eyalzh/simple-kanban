import * as React from "react";
import {Board} from "../../model/Board";
import {allowBinds, bind} from "../../util";
import Dropdown, {DropdownOption} from "./Dropdown";

interface BoardSelectorProps {
    currentBoard: Board | null;
    boards: Array<Board> | null;
    changeBoard: (selectedBoardId: string) => void;
}

@allowBinds
export default class BoardSelector extends React.Component<BoardSelectorProps, {}> {

    render() {

        let boardOptions: Array<DropdownOption> | null = [];

        let currentBoardId;
        let currentBoardName;
        const {boards, currentBoard} = this.props;

        if (boards && currentBoard) {

            const archivedBoards: Board[] = [];
            const activeBoards: Board[] = [];

            boards.forEach(board => {
               if (board.isArchived) {
                   archivedBoards.push(board);
               } else {
                   activeBoards.push(board);
               }
            });

            boardOptions = activeBoards
                .concat(archivedBoards)
                .map(board => ({
                    value: board.id,
                    label: board.name,
                    section: "board",
                    data: {isArchived: board.isArchived}}));

            currentBoardId =  currentBoard.id;
            currentBoardName =  currentBoard.name;
        }

        return <Dropdown
            className="board-selector"
            options={boardOptions}
            onChange={this.onChangeBoard}
            value={currentBoardId}
            placement="right"
            placeholder={currentBoardName || "No boards"}
            showCaret={true}
            mapOptionToClass={(option) => option.data.isArchived ? "option-archived" : ""}/>;

    }

    @bind
    onChangeBoard(boardId: string) {
        this.props.changeBoard(boardId);
    }

}
