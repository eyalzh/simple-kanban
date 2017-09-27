import * as React from "react";
import * as BoardActions from "../../actions/boardActions";
import ColumnEditDialog from "../dialogs/ColumnEditDialog";
import BoardEditDialog from "../dialogs/BoardEditDialog";
import {Board} from "../../model/Board";
import {Template} from "../../model/Templates/Template";
import AdvancedDialog from "../dialogs/AdvancedDialog";
import {ColumnOptions} from "../../model/Column";

interface ToolbarProps {
    currentBoard: Board | null;
}

interface ToolbarState {
    isColBeingAdded: boolean;
    isBoardBeingAdded: boolean;
    advancedModeOn: boolean;
    boardBeingEdited: string | null | undefined;
}

export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {

    constructor() {
        super();

        this.state = {
            isColBeingAdded: false,
            isBoardBeingAdded: false,
            advancedModeOn: false,
            boardBeingEdited: null
        };

        this.onAddBoardClicked = this.onAddBoardClicked.bind(this);
        this.onEditBoardClicked = this.onEditBoardClicked.bind(this);
        this.onAddColStarted = this.onAddColStarted.bind(this);
        this.onAdvancedClicked = this.onAdvancedClicked.bind(this);
        this.onAdvancedModeClose = this.onAdvancedModeClose.bind(this);
        this.onFileImport = this.onFileImport.bind(this);
    }

    render() {

        let boardName;

        if (this.props.currentBoard) {
            boardName = this.props.currentBoard.name;
        }

        const separator = <span> | </span>;

        return (
            <div className="toolbar">

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
            boardBeingEdited: this.props.currentBoard ? this.props.currentBoard.id : null
        });

    }

    private onRemoveBoard() {
        this.setState({isBoardBeingAdded: false, boardBeingEdited: null});
        BoardActions.removeCurrentBoard();
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