import * as React from "react";
const Modal = require("react-modal");

interface BoardEditDialogProps {
    isBeingEdited: boolean;
    onEditClose: Function;
    onRemoveBoard: Function;
    onEditSubmitted: (boardName: string) => void;
    boardId?: string;
    boardName?: string;
}

interface BoardEditDialogState {
    name: string;
}

export default class BoardEditDialog extends React.Component<BoardEditDialogProps, BoardEditDialogState> {

    private fieldInput: HTMLInputElement;

    constructor() {
        super();
        this.state = {
            name: ""
        };
    }

    componentWillReceiveProps(props: BoardEditDialogProps) {

        if (props.boardName !== null && props.boardId !== null) {
            this.state.name = props.boardName;
        } else {
            this.state.name = "";
        }

        this.setState(this.state);
    }

    render() {

        let title;
        let removeBtn;
        if (this.props.boardId !== null) {
            title = "Edit Board";
            removeBtn = (
                <button className="remove-btn" onClick={e => this.onRemoveBoard()}>Remove board</button>
            );
        } else {
            title = "Add Board";
            removeBtn = <div />;
        }

        let buttons = (
            <p>
                <button onClick={e => this.onEditSubmitted()}>Submit</button>&nbsp;
                <button onClick={this.props.onEditClose}>Cancel</button>&nbsp;
                {removeBtn}
            </p>
        );

        return (
            <Modal
                isOpen={this.props.isBeingEdited}
                onRequestClose={this.props.onEditClose}
                onAfterOpen={this.onEditDialogOpen.bind(this)}>

                <h1>{title}</h1>
                <p>
                    Board name
                </p>
                <p>
                    <input
                        value={this.state.name}
                        onChange={this.onNameChange.bind(this)}
                        ref={(input) => {this.fieldInput = input}}
                        onKeyPress={this.onKeyPressed.bind(this)} />
                </p>

                {buttons}

            </Modal>
        )
    }

    private onKeyPressed(ev: React.KeyboardEvent) {
        if (ev.key === "Enter") {
            this.onEditSubmitted()
        }
    }

    private onNameChange(e: React.FormEvent) {
        const name = (e.target as HTMLInputElement).value;
        this.state.name = name;
        this.setState(this.state);
    }

    private onEditSubmitted() {
        this.props.onEditSubmitted(this.state.name);
    }

    private onRemoveBoard() {
        this.props.onRemoveBoard();
    }

    private onEditDialogOpen() {
        this.fieldInput.focus();
    }

}