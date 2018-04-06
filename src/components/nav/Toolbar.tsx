import * as React from "react";
import * as BoardActions from "../../actions/boardActions";
import ColumnEditDialog from "../dialogs/ColumnEditDialog";
import BoardEditDialog from "../dialogs/BoardEditDialog";
import {Board} from "../../model/Board";
import {Template} from "../../model/Templates/Template";
import AdvancedDialog from "../dialogs/OptionsDialog";
import {ColumnOptions} from "../../model/Column";
import {allowBinds, bind} from "../../util";
import Dropdown from "./Dropdown";

interface ToolbarProps {
    currentBoard: Board | null;
}

interface ToolbarState {
    isColBeingAdded: boolean;
    isBoardBeingAdded: boolean;
    advancedModeOn: boolean;
    boardBeingEdited: string | null | undefined;
}

interface MenuAction {
    value: string;
    label: string;
    handler: (value: string) => void;
    section: string;
}

@allowBinds
export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {

    private readonly menuActions: {[prop: string]: MenuAction};
    private readonly menuActionsArray: MenuAction[];

    constructor() {

        super();

        this.state = {
            isColBeingAdded: false,
            isBoardBeingAdded: false,
            advancedModeOn: false,
            boardBeingEdited: null
        };

        this.menuActions = {
            ADD_COL: {value: "1", label: "Add column", section: "column", handler: this.onAddColStarted.bind(this)},
            ADD_BOARD: {value: "2", label: "Add new board", section: "board", handler: this.onAddBoardClicked.bind(this)},
            EDIT_NAME: {value: "3", label: "Edit board", section: "board", handler: this.onEditBoardClicked.bind(this)},
            RESET_BOARD: {value: "4", label: "Reset board", section: "board", handler: this.onResetBoard.bind(this)},
            REMOVE_BOARD: {value: "5", label: "Remove board", section: "board", handler: this.onRemoveBoard.bind(this)},
            ADVANCED: {value: "6", label: "Options", section: "options", handler: this.onAdvancedClicked.bind(this)}
        };

        this.menuActionsArray = [
            this.menuActions.ADD_COL,
            this.menuActions.EDIT_NAME,
            this.menuActions.ADD_BOARD,
            this.menuActions.RESET_BOARD,
            this.menuActions.REMOVE_BOARD,
            this.menuActions.ADVANCED
        ];

    }

    render() {

        return (
            <div className="toolbar">

                <div style={{display: "flex"}}>
                    <Dropdown
                        options={this.menuActionsArray}
                        value="0"
                        placeholder="&#9776; menu"
                        placement="left"
                        showCaret={false}
                        onChange={this.onEditBoardOptionSelected}
                        mapOptionToClass={() => ""}
                        className="action-menu"/>
                </div>

                <ColumnEditDialog
                    opened={this.state.isColBeingAdded}
                    onEditClose={this.onColEditClose}
                    onEditSubmitted={this.onAddColSubmitted}
                />
                <BoardEditDialog
                    opened={this.state.isBoardBeingAdded || this.props.currentBoard === null}
                    board={this.state.boardBeingEdited ? this.props.currentBoard : null}
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
    private onAddBoardSubmitted(boardName: string, template: Template | undefined, isArchived: boolean) {

        this.setState({isBoardBeingAdded: false});

        if (boardName !== null) {
            const boardNameTrimmed = boardName.trim();
            if (boardNameTrimmed.length > 0) {
                if (this.state.boardBeingEdited !== null) {
                    BoardActions.editCurrentBoard(boardNameTrimmed, isArchived);
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

    @bind
    private onEditBoardOptionSelected(selectedValue: string) {

        const action = this.menuActionsArray.find(menuAction => menuAction.value === selectedValue);

        if (action) {
            action.handler(selectedValue);
        }
    }

    private onRemoveBoard() {
        this.setState({isBoardBeingAdded: false, boardBeingEdited: null});
        BoardActions.removeCurrentBoard();
    }

    private onResetBoard() {
        BoardActions.resetCurrentBoard();
    }

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
