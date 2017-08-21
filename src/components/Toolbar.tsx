import * as React from "react";
import * as BoardActions from "../actions/boardActions";
import dispatcher from "../Dispatcher";
import ColumnEditDialog from "./dialogs/ColumnEditDialog";
import BoardEditDialog from "./dialogs/BoardEditDialog";
import {BoardStore} from "../stores/BoardStore";
import {Board} from "../model/Board";
import {Template} from "../model/Templates/Template";
import AdvancedDialog from "./dialogs/AdvancedDialog";
import {ColumnOptions} from "../model/Column";

interface ToolbarState {
    currentBoard: Board | null;
    isColBeingAdded: boolean;
    isBoardBeingAdded: boolean;
    advancedModeOn: boolean;
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
            advancedModeOn: false,
            boardBeingEdited: null,
            boards: null
        };

        this.onAddBoardClicked = this.onAddBoardClicked.bind(this);
        this.onEditBoardClicked = this.onEditBoardClicked.bind(this);
        this.onAddColStarted = this.onAddColStarted.bind(this);
        this.onAdvancedClicked = this.onAdvancedClicked.bind(this);
        this.onAdvancedModeClose = this.onAdvancedModeClose.bind(this);
        this.onFileImport = this.onFileImport.bind(this);
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

        const {currentBoard, boards} = store;

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

        const separator = <span> | </span>;

        return (
            <div className="toolbar">

                {boardSelector}{separator}
                <button onClick={this.onAddBoardClicked}>Add board</button>{separator}
                <button onClick={this.onEditBoardClicked}>Edit board</button>{separator}
                <button onClick={this.onAddColStarted}>Add column</button>{separator}
                <button onClick={this.onAdvancedClicked}>Options</button>

                <ColumnEditDialog
                    opened={this.state.isColBeingAdded}
                    onEditClose={this.onColEditClose.bind(this)}
                    onEditSubmitted={this.onAddColSubmitted.bind(this)}
                />
                <BoardEditDialog
                    opened={this.state.isBoardBeingAdded}
                    boardId={this.state.boardBeingEdited}
                    boardName={boardName}
                    onEditClose={this.onBoardEditClose.bind(this)}
                    onEditSubmitted={this.onAddBoardSubmitted.bind(this)}
                    onRemoveBoard={this.onRemoveBoard.bind(this)}
                />
                <AdvancedDialog
                    opened={this.state.advancedModeOn}
                    onClosed={this.onAdvancedModeClose}
                    onFileImport={this.onFileImport}
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

    private onAddColSubmitted(columnName: string, wipLimit: number, options?: ColumnOptions) {

        this.setState({
            isColBeingAdded: false
        });

        if (columnName !== null) {
            const columnNameTrimmed = columnName.trim();
            if (columnNameTrimmed.length > 0) {
                BoardActions.addColumn(columnNameTrimmed, wipLimit, options);
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

    private changeProfile(e: React.SyntheticEvent<HTMLSelectElement>) {
        BoardActions.switchBoard(e.currentTarget.value);
    }

    private onAdvancedClicked() {
        this.setState({
            advancedModeOn: true
        });
    }

    private onAdvancedModeClose() {
        this.setState({
            advancedModeOn: false
        });
    }

    private onFileImport(text: string) {
        BoardActions.importFromJSON(text);
    }

}