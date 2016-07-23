import * as React from "react";
const Modal = require("react-modal");

interface BoardEditDialogProps {
    isBeingEdited: boolean;
    onEditClose: Function;
    onEditSubmitted: (boardName: string) => void;
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

    render() {
        return (
            <Modal
                isOpen={this.props.isBeingEdited}
                onRequestClose={this.props.onEditClose}
                onAfterOpen={this.onEditDialogOpen.bind(this)}>

                <h1>Add board</h1>
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

                <p>
                    <button onClick={e => this.onEditSubmitted()}>Submit</button>&nbsp;
                    <button onClick={this.props.onEditClose}>Cancel</button>
                </p>

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

    private onEditDialogOpen() {
        this.fieldInput.focus();
    }

}