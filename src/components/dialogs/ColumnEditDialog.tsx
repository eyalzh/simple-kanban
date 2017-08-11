import * as React from "react";
import * as Modal from "react-modal";
import {Column} from "../../model/Column";
import {dialogContainerStyle, dialogModalStyle} from "./dialogStyle";

interface ColumnEditDialogProps {
    column?: Column;
    opened: boolean;
    onEditClose: () => void;
    onEditSubmitted: (desc: string, wipLimit: number) => void;
}

interface ColumnEditDialogState {
    name: string;
    wipLimit: number;
}

export default class ColumnEditDialog extends React.Component<ColumnEditDialogProps, ColumnEditDialogState> {

    private fieldInput: HTMLInputElement | null;

    constructor(props) {
        super(props);
        this.state = this.getInitState(props);
    }

    componentWillReceiveProps(props) {
        this.setState(this.getInitState(props));
    }

    private getInitState(props) {

        const defaultColumnValues = {
            name: "",
            wipLimit: 3
        };

        if (props.column) {
            const {name, wipLimit} = props.column;
            return {name, wipLimit};
        } else {
            return defaultColumnValues;
        }

    }

    render() {

        const title = this.props.column ? "Edit Column" : "Add Column";

        return (
            <Modal isOpen={this.props.opened}
                   onRequestClose={this.props.onEditClose}
                   onAfterOpen={this.onEditDialogOpen.bind(this)}
                   style={dialogModalStyle}
                   contentLabel="Edit Column Dialog">

                <div style={dialogContainerStyle}>
                    <h1>{title}</h1>
                    <p>
                        Column name
                    </p>
                    <p>
                        <input
                            value={this.state.name}
                            onChange={this.onNameChange.bind(this)}
                            ref={(input) => {this.fieldInput = input;}}
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
                        <button onClick={() => this.onEditSubmitted()}>Submit</button>&nbsp;
                        <button onClick={this.props.onEditClose}>Cancel</button>
                    </p>
                </div>

            </Modal>
        );
    }

    private onKeyPressed(ev: React.KeyboardEvent<HTMLElement>) {
        if (ev.key === "Enter") {
            this.onEditSubmitted();
        }
    }

    private onNameChange(e: React.FormEvent<HTMLInputElement>) {
        const name = e.currentTarget.value;
        this.setState({name});
    }

    private onWipLimitChange(e: React.FormEvent<HTMLInputElement>) {
        const wip = e.currentTarget.value;
        this.setState({wipLimit: Number(wip)});
    }

    private onEditSubmitted() {
        this.props.onEditSubmitted(this.state.name, this.state.wipLimit);
    }

    private onEditDialogOpen() {
        if (this.fieldInput) {
            this.fieldInput.focus();
        }
    }

}