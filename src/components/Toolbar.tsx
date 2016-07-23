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
}

export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {

    constructor() {
        super();
        this.state = {
            currentBoardId: "",
            isColBeingAdded: false,
            isBoardBeingAdded: false
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
                <button onClick={e=>this.onRemoveBoardClicked()}>Remove board</button>
                <button onClick={e=>this.onAddColStarted()}>Add column</button>
                <button onClick={e=>this.clear()}>Reset</button>
                <ColumnEditDialog
                    isBeingEdited={this.state.isColBeingAdded}
                    onEditClose={this.onColEditClose.bind(this)}
                    onEditSubmitted={this.onAddColSubmitted.bind(this)}
                />
                <BoardEditDialog
                    isBeingEdited={this.state.isBoardBeingAdded}
                    onEditClose={this.onBoardEditClose.bind(this)}
                    onEditSubmitted={this.onAddBoardSubmitted.bind(this)}
                />
            </div>
        );
    }

    private syncSelBoard() {
        this.setState({
            currentBoardId: this.props.model.getCurrentBoard(),
            isColBeingAdded: false,
            isBoardBeingAdded: false
        })
    }

    private onColEditClose() {
        this.state.isColBeingAdded = false;
        this.setState(this.state);
    }

    private onBoardEditClose() {
        this.state.isBoardBeingAdded = false;
        this.setState(this.state);
    }

    private onAddBoardClicked() {
        this.state.isBoardBeingAdded = true;
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
                BoardActions.addBoard(boardNameTrimmed);
            }
        }
    }

    private onRemoveBoardClicked() {
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