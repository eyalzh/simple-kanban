import * as React from "react";
import * as BoardActions from "../../actions/boardActions";
import ColumnEditDialog from "../dialogs/ColumnEditDialog";
import BoardEditDialog from "../dialogs/BoardEditDialog";
import {Board} from "../../model/Board";
import {Template} from "../../model/Templates/Template";
import AdvancedDialog from "../dialogs/AdvancedDialog";
import {ColumnOptions} from "../../model/Column";
import {allowBinds, bind} from "../../util";

interface ToolbarProps {
    currentBoard: Board | null;
}

interface ToolbarState {
    isColBeingAdded: boolean;
    isBoardBeingAdded: boolean;
    advancedModeOn: boolean;
    boardBeingEdited: string | null | undefined;
}

@allowBinds
export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {

    constructor() {
        super();
        this.state = {
            isColBeingAdded: false,
            isBoardBeingAdded: false,
            advancedModeOn: false,
            boardBeingEdited: null
        };
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
                    onEditClose={this.onColEditClose}
                    onEditSubmitted={this.onAddColSubmitted}
                />
                <BoardEditDialog
                    opened={this.state.isBoardBeingAdded || this.props.currentBoard === null}
                    boardId={this.state.boardBeingEdited}
                    boardName={boardName}
                    onEditClose={this.onBoardEditClose}
                    onEditSubmitted={this.onAddBoardSubmitted}
                    onRemoveBoard={this.onRemoveBoard}
                />
                <AdvancedDialog
                    opened={this.state.advancedModeOn}
                    onClosed={this.onAdvancedModeClose}
                    onFileImport={this.onFileImport}
                />

            </div>
        );
    }

    @bind
    private onColEditClose() {
        this.setState({
            isColBeingAdded: false
        });
    }

    @bind
    private onBoardEditClose() {
        this.setState({
            isBoardBeingAdded: false,
            boardBeingEdited: null
        });
    }

    @bind
    private onAddBoardClicked() {
        this.setState({
            isBoardBeingAdded: true,
            boardBeingEdited: null
        });
    }

    @bind
    private onAddColStarted() {
        this.setState({
            isColBeingAdded: true
        });
    }

    @bind
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

    @bind
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

    @bind
    private onEditBoardClicked() {

        this.setState({
            isBoardBeingAdded: true,
            boardBeingEdited: this.props.currentBoard ? this.props.currentBoard.id : null
        });

    }

    @bind
    private onRemoveBoard() {
        this.setState({isBoardBeingAdded: false, boardBeingEdited: null});
        BoardActions.removeCurrentBoard();
    }

    @bind
    private onAdvancedClicked() {
        this.setState({
            advancedModeOn: true
        });
    }

    @bind
    private onAdvancedModeClose() {
        this.setState({
            advancedModeOn: false
        });
    }

    @bind
    private onFileImport(text: string) {
        BoardActions.importFromJSON(text);
    }

}