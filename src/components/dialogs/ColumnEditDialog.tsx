import * as React from "react";
import * as Modal from "react-modal";
import {Column, ColumnOptions, ColumnSize} from "../../model/Column";
import {dialogContainerStyle, dialogModalStyle} from "./dialogModalStyle";
import FormField from "../fields/FormField";
import {allowBinds, bind} from "../../util";

interface ColumnEditDialogProps {
    column?: Column;
    opened: boolean;
    onEditClose: () => void;
    onEditSubmitted: (desc: string, wipLimit: number, options: ColumnOptions) => void;
}

interface ColumnEditDialogState {
    name: string;
    wipLimit: number;
    size: ColumnSize | undefined;
    releaseSteam: boolean;
}

@allowBinds
export default class ColumnEditDialog extends React.Component<ColumnEditDialogProps, ColumnEditDialogState> {

    private fieldInput: HTMLInputElement | null = null;

    constructor(props) {
        super(props);
        this.state = this.getInitState(props);
    }

    componentWillReceiveProps(props) {
        this.setState(this.getInitState(props));
    }

    render() {

        if (! this.props.opened) {
            return null;
        }

        const title = this.props.column ? "Edit Column" : "Add Column";

        return (
            <Modal isOpen={this.props.opened}
                   onRequestClose={this.props.onEditClose}
                   onAfterOpen={this.onEditDialogOpen}
                   style={dialogModalStyle}
                   contentLabel="Edit Column Dialog">

                <div style={dialogContainerStyle}>

                    <h1>{title}</h1>

                    <FormField caption="Name">
                        <input
                            value={this.state.name}
                            onChange={this.onNameChange}
                            ref={(input) => { this.fieldInput = input; }}
                            onKeyPress={this.onKeyPressed} />
                    </FormField>

                    <FormField caption="WiP limit">
                        <input
                            value={this.state.wipLimit.toString()}
                            onChange={this.onWipLimitChange}
                            type="number"
                            min={1}
                            onKeyPress={this.onKeyPressed} />
                    </FormField>

                    <FormField caption="Size">
                        <select
                            value={this.state.size}
                            onChange={this.onSizeChanged}>
                            <option value={ColumnSize.FULL}>Full</option>
                            <option value={ColumnSize.HALF}>Half</option>
                        </select>
                    </FormField>

                    <FormField caption="Release steam?">
                        <input type="checkbox" checked={this.state.releaseSteam} onChange={this.onReleaseSteamChanged}/>
                    </FormField>

                    <p>
                        <button onClick={this.onEditSubmitted} disabled={this.state.name.length === 0}>Submit</button>&nbsp;
                        <button onClick={this.props.onEditClose}>Cancel</button>
                    </p>
                </div>

            </Modal>
        );
    }

    private getInitState(props) {

        const defaultColumnValues = {
            name: "",
            wipLimit: 3,
            size: ColumnSize.FULL,
            releaseSteam: false
        };

        if (props.column) {
            const {name, wipLimit, options} = props.column;
            let size = ColumnSize.FULL;
            let releaseSteam = false;
            if (options && typeof options.size !== "undefined") {
                size = options.size;
                releaseSteam = options.releaseSteam;
            }
            return {name, wipLimit, size, releaseSteam};
        } else {
            return defaultColumnValues;
        }

    }

    @bind
    private onKeyPressed(ev: React.KeyboardEvent<HTMLElement>) {
        if (ev.key === "Enter") {
            this.onEditSubmitted();
        }
    }

    @bind
    private onNameChange(e: React.FormEvent<HTMLInputElement>) {
        const name = e.currentTarget.value;
        this.setState({name});
    }

    @bind
    private onWipLimitChange(e: React.FormEvent<HTMLInputElement>) {
        const wipLimit = Number(e.currentTarget.value);
        this.setState({wipLimit});
    }

    @bind
    private onSizeChanged(e: React.FormEvent<HTMLSelectElement>) {
        const size = Number(e.currentTarget.value);
        this.setState({size});
    }

    @bind
    private onEditSubmitted() {
        const options: ColumnOptions = {
            size: this.state.size,
            steamRelease: this.state.releaseSteam
        };
        this.props.onEditSubmitted(this.state.name, this.state.wipLimit, options);
    }

    @bind
    private onEditDialogOpen() {
        if (this.fieldInput) {
            this.fieldInput.focus();
        }
    }

    @bind
    private onReleaseSteamChanged(e: React.FormEvent<HTMLInputElement>) {
        const releaseSteam = !!e.currentTarget.checked;
        this.setState({releaseSteam});
    }

}
