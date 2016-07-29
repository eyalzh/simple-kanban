import * as React from "react";
import * as BoardActions from "../actions/boardActions";
import TaskModel from "../model/TaskModel";
import dispatcher from "../Dispatcher";
import ColumnEditDialog from "./ColumnEditDialog";
import BoardEditDialog from "./BoardEditDialog";

interface ToolbarProps {
    model: TaskModel;
}

interface ToolbarState {
    currentBoardId: string;
    isColBeingAdded: boolean;
    isBoardBeingAdded: boolean;
    boardBeingEdited: string;
}

export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {

    constructor() {
        super();
        this.state = {
            currentBoardId: "",
            isColBeingAdded: false,
            isBoardBeingAdded: false,
            boardBeingEdited: null
        };
    }

    componentWillMount() {
        dispatcher.register((actionName) => {
            switch(actionName) {
                case "refreshBoard":
                    this.syncSelBoard();
                    break;
            }
        });
        this.syncSelBoard();
    }

    render() {

        const boards = this.props.model.getBoards();
        let boardOptions = [];

        boards.forEach((desc, id) => {
            boardOptions.push(
                <option key={id} value={id}>{desc}</option>
            );
        });

        return (
            <div className="toolbar">
                <select value={this.state.currentBoardId} onChange={e=>this.changeProfile(e)} title="Change board (Alt+B)">
                    {boardOptions}
                </select>
                <button onClick={e=>this.onAddBoardClicked()}>Add board</button>
                <button onClick={e=>this.onEditBoardClicked()}>Edit board</button>
                <button onClick={e=>this.onAddColStarted()}>Add column</button>
                <button onClick={e=>this.clear()}>Reset</button>
                <ColumnEditDialog
                    isBeingEdited={this.state.isColBeingAdded}
                    onEditClose={this.onColEditClose.bind(this)}
                    onEditSubmitted={this.onAddColSubmitted.bind(this)}
                />
                <BoardEditDialog
                    isBeingEdited={this.state.isBoardBeingAdded}
                    boardId={this.state.boardBeingEdited}
                    boardName={boards.get(this.state.currentBoardId)}
                    onEditClose={this.onBoardEditClose.bind(this)}
                    onEditSubmitted={this.onAddBoardSubmitted.bind(this)}
                    onRemoveBoard={this.onRemoveBoard.bind(this)}
                />
            </div>
        );
    }

    private syncSelBoard() {
        this.setState({
            currentBoardId: this.props.model.getCurrentBoard(),
            isColBeingAdded: false,
            isBoardBeingAdded: false,
            boardBeingEdited: null
        });
    }

    private onColEditClose() {
        this.state.isColBeingAdded = false;
        this.setState(this.state);
    }

    private onBoardEditClose() {
        this.state.isBoardBeingAdded = false;
        this.state.boardBeingEdited = null;
        this.setState(this.state);
    }

    private onAddBoardClicked() {
        this.state.isBoardBeingAdded = true;
        this.state.boardBeingEdited = null;
        this.setState(this.state);
    }

    private onAddColStarted() {
        this.state.isColBeingAdded = true;
        this.setState(this.state);
    }

    private onAddColSubmitted(columnName: string, wipLimit: number) {

        this.state.isColBeingAdded = false;
        this.setState(this.state);

        if (columnName !== null) {
            const columnNameTrimmed = columnName.trim();
            if (columnNameTrimmed.length > 0) {
                BoardActions.addColumn(columnNameTrimmed, wipLimit);
            }
        }
    }

    private onAddBoardSubmitted(boardName: string) {
        this.state.isBoardBeingAdded = false;
        this.setState(this.state);

        if (boardName !== null) {
            const boardNameTrimmed = boardName.trim();
            if (boardNameTrimmed.length > 0) {
                if (this.state.boardBeingEdited !== null) {
                    BoardActions.editCurrentBoard(boardNameTrimmed);
                } else {
                    BoardActions.addBoard(boardNameTrimmed);
                }

            }
        }
    }

    private onEditBoardClicked() {
        this.state.isBoardBeingAdded = true;
        this.state.boardBeingEdited = this.props.model.getCurrentBoard();
        this.setState(this.state);
    }

    private onRemoveBoard() {
        this.state.isBoardBeingAdded = false;
        this.state.boardBeingEdited = null;
        this.setState(this.state);
        BoardActions.removeCurrentBoard();
    }

    private clear() {
        if (window.confirm("Wait, are you sure you want to reset ALL data?")) {
            BoardActions.clear();
        }
    }

    private changeProfile(e: React.SyntheticEvent) {
        BoardActions.switchBoard((e.target as HTMLSelectElement).value);
    }

}