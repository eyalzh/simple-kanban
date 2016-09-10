import * as React from "react";
const Modal = require("react-modal");

interface ColumnEditDialogProps {
    name?: string;
    wipLimit?: number;
    isBeingEdited: boolean;
    onEditClose: React.MouseEventHandler;
    onEditSubmitted: (desc: string, wipLimit: number) => void;
}

interface ColumnEditDialogState {
    name: string;
    wipLimit: number;
}

export default class ColumnEditDialog extends React.Component<ColumnEditDialogProps, ColumnEditDialogState> {

    private fieldInput: HTMLInputElement;

    constructor(props) {
        super(props);
        this.state = this.getInitState(props);
    }

    componentWillReceiveProps(props) {
        this.setState(this.getInitState(props));
    }

    private getInitState(props) {
        return {
            name: props.name || "",
            wipLimit: props.wipLimit || 3
        };
    }

    render() {
        return (
            <Modal isOpen={this.props.isBeingEdited}
                   onRequestClose={this.props.onEditClose}
                   onAfterOpen={this.onEditDialogOpen.bind(this)}>
                <div>
                    <h1>Edit Column</h1>
                    <p>
                        Column name
                    </p>
                    <p>
                        <input
                            value={this.state.name}
                            onChange={this.onNameChange.bind(this)}
                            ref={(input) => {this.fieldInput = input}}
                            onKeyPress={this.onKeyPressed.bind(this)} />
                    </p>
                    <p>
                        WIP limit
                    </p>
                    <p>
                        <input
                            value={this.state.wipLimit.toString()}
                            onChange={this.onWipLimitChange.bind(this)}
                            type="number"
                            min={1}
                            onKeyPress={this.onKeyPressed.bind(this)} />
                    </p>
                    <p>
                        <button onClick={e => this.onEditSubmitted()}>Submit</button>&nbsp;
                        <button onClick={this.props.onEditClose}>Cancel</button>
                    </p>
                </div>
            </Modal>
        )
    }

    private onKeyPressed(ev: React.KeyboardEvent) {
        if (ev.key === "Enter") {
            this.onEditSubmitted();
        }
    }

    private onNameChange(e: React.FormEvent) {
        const name = (e.target as HTMLInputElement).value;
        this.state.name = name;
        this.setState(this.state);
    }

    private onWipLimitChange(e: React.FormEvent) {
        const wip = (e.target as HTMLInputElement).value;
        this.state.wipLimit = Number(wip);
        this.setState(this.state);
    }

    private onEditSubmitted() {
        this.props.onEditSubmitted(this.state.name, this.state.wipLimit);
    }

    private onEditDialogOpen() {
        this.fieldInput.focus();
    }

}