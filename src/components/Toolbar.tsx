import * as React from "react";
import * as BoardActions from "../actions/boardActions";
import dispatcher from "../Dispatcher";
import ColumnEditDialog from "./ColumnEditDialog";
import BoardEditDialog from "./BoardEditDialog";
import {BoardStore} from "../stores/BoardStore";
import {Board} from "../model/Board";
import {Template} from "../model/Templates/Template";

interface ToolbarState {
    currentBoard: Board | null;
    isColBeingAdded: boolean;
    isBoardBeingAdded: boolean;
    boardBeingEdited: string | null | undefined;
    boards: Array<Board> | null;
}

export default class Toolbar extends React.Component<{}, ToolbarState> {

    constructor() {
        super();
        this.state = {
            currentBoard: null,
            isColBeingAdded: false,
            isBoardBeingAdded: false,
            boardBeingEdited: null,
            boards: null
        };
    }

    componentWillMount() {
        dispatcher.register((actionName, store: BoardStore) => {
            switch (actionName) {
                case "refreshBoard":
                    this.syncSelBoard(store);
                    break;
            }
        });
    }

    private syncSelBoard(store: BoardStore) {
        const currentBoard = store.currentBoard;
        const boards = store.boards;
        if (currentBoard !== null) {
            this.setState({
                currentBoard,
                isColBeingAdded: false,
                isBoardBeingAdded: false,
                boardBeingEdited: null,
                boards
            });
        }
    }

    render() {

        const boards = this.state.boards;
        let boardOptions: Array<JSX.Element> = [];
        let boardName;
        let boardSelector = <div />;

        if (this.state.currentBoard && boards) {
            boardOptions = boards.map((board) => {
                return <option key={board.id} value={board.id}>{board.name}</option>;
            });
            boardName = this.state.currentBoard.name;

            boardSelector = (
                <select
                    value={this.state.currentBoard.id}
                    onChange={e => this.changeProfile(e)}
                    title="Change board (Alt+B)">
                    {boardOptions}
                </select>
            );

        }

        return (
            <div className="toolbar">

                {boardSelector}

                <button onClick={() => this.onAddBoardClicked()}>Add board</button>
                <button onClick={() => this.onEditBoardClicked()}>Edit board</button>
                <button onClick={() => this.onAddColStarted()}>Add column</button>
                <button onClick={() => this.clear()}>Reset</button>
                <ColumnEditDialog
                    isBeingEdited={this.state.isColBeingAdded}
                    onEditClose={this.onColEditClose.bind(this)}
                    onEditSubmitted={this.onAddColSubmitted.bind(this)}
                />
                <BoardEditDialog
                    isBeingEdited={this.state.isBoardBeingAdded}
                    boardId={this.state.boardBeingEdited}
                    boardName={boardName}
                    onEditClose={this.onBoardEditClose.bind(this)}
                    onEditSubmitted={this.onAddBoardSubmitted.bind(this)}
                    onRemoveBoard={this.onRemoveBoard.bind(this)}
                />
            </div>
        );
    }

    private onColEditClose() {
        this.setState({
            isColBeingAdded: false
        });
    }

    private onBoardEditClose() {
        this.setState({
            isBoardBeingAdded: false,
            boardBeingEdited: null
        });
    }

    private onAddBoardClicked() {
        this.setState({
            isBoardBeingAdded: true,
            boardBeingEdited: null
        });
    }

    private onAddColStarted() {
        this.setState({
            isColBeingAdded: true
        });
    }

    private onAddColSubmitted(columnName: string, wipLimit: number) {

        this.setState({
            isColBeingAdded: false
        });

        if (columnName !== null) {
            const columnNameTrimmed = columnName.trim();
            if (columnNameTrimmed.length > 0) {
                BoardActions.addColumn(columnNameTrimmed, wipLimit);
            }
        }
    }

    private onAddBoardSubmitted(boardName: string, template: Template | undefined) {

        this.setState({isBoardBeingAdded: false});

        if (boardName !== null) {
            const boardNameTrimmed = boardName.trim();
            if (boardNameTrimmed.length > 0) {
                if (this.state.boardBeingEdited !== null) {
                    BoardActions.editCurrentBoard(boardNameTrimmed);
                } else {
                    BoardActions.addBoard(boardNameTrimmed, template);
                }

            }
        }
    }

    private onEditBoardClicked() {

        this.setState({
            isBoardBeingAdded: true,
            boardBeingEdited: this.state.currentBoard ? this.state.currentBoard.id : null
        });

    }

    private onRemoveBoard() {
        this.setState({isBoardBeingAdded: false, boardBeingEdited: null});
        BoardActions.removeCurrentBoard();
    }

    private clear() {
        if (window.confirm("Wait, are you sure you want to reset ALL data?")) {
            BoardActions.clear();
        }
    }

    private changeProfile(e: React.SyntheticEvent<HTMLSelectElement>) {
        BoardActions.switchBoard(e.currentTarget.value);
    }

}