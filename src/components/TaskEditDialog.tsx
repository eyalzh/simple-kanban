import * as React from "react";
const Modal = require("react-modal");

interface TaskEditDialogProps {
    dialogTitle: string;
    desc?: string;
    longdesc?: string;
    isBeingEdited: boolean;
    onCloseEditTask: React.MouseEventHandler;
    onEditSubmitted: (desc: string, longdesc: string) => void;
}

interface TaskEditDialogState {
    desc: string;
    longdesc: string;
}

export default class TaskEditDialog extends React.Component<TaskEditDialogProps, TaskEditDialogState> {

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
            desc: props.desc || "",
            longdesc: props.longdesc || ""
        };
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isBeingEdited}
                onRequestClose={this.props.onCloseEditTask}
                onAfterOpen={this.onEditDialogOpen.bind(this)}>

                <div className="edit-task-form">
                    <h1>{this.props.dialogTitle}</h1>
                    <p>
                        Title:
                    </p>
                    <p>
                        <input
                            value={this.state.desc}
                            onChange={this.onChange.bind(this)}
                            ref={(input) => {this.fieldInput = input;}}
                            onKeyPress={(ev) => {ev.key === "Enter" && this.onEditSubmitted();}}
                        />
                    </p>
                    <p>
                        Description:
                    </p>
                    <p>
                        <textarea value={this.state.longdesc} onChange={this.onLongDescChange.bind(this)}/>
                    </p>
                    <p>
                        <button onClick={e => this.onEditSubmitted()}>Submit</button>&nbsp;
                        <button onClick={this.props.onCloseEditTask}>Cancel</button>
                    </p>
                </div>

            </Modal>
        );
    }

    public onChange(e: React.FormEvent) {
        const title = (e.target as HTMLInputElement).value;
        this.state.desc = title;
        this.setState(this.state);
    }

    public onLongDescChange(e: React.FormEvent) {
        const longDesc = (e.target as HTMLInputElement).value;
        this.state.longdesc = longDesc;
        this.setState(this.state);
    }

    private onEditSubmitted() {
        this.props.onEditSubmitted(this.state.desc, this.state.longdesc);
    }

    private onEditDialogOpen() {
        this.fieldInput.focus();
    }

}