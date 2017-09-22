import * as React from "react";
import Markdown from "../Markdown";
import {classSet} from "../../util";
import {Timestamp} from "../../model/Timestamp";
import * as Modal from "react-modal";
import AnnotatedHashtagDiv from "../AnnotatedHashtagDiv";
import {baseModalStyle} from "./dialogStyle";
import SelectColorField from "../fields/SelectColorField";
import {Task, TaskPresentationalOptions} from "../../model/Task";

interface TaskEditDialogProps {
    dialogTitle: string;
    opened: boolean;
    task?: Task;
    onCloseEditTask: () => void;
    onEditSubmitted: (desc: string, longdesc: string, presentationalOptions: TaskPresentationalOptions) => void;
}

interface TaskEditDialogState {
    desc: string;
    longdesc: string;
    color: string;
    creationDateString: string | null;
    lastUpdatedAtString: string | null;
}

const DEFAULT_COLOR = "#fff6a8";

export default class TaskEditDialog extends React.Component<TaskEditDialogProps, TaskEditDialogState> {

    private fieldInput: HTMLInputElement | null;

    constructor(props) {
        super(props);
        this.state = this.getInitState(props);

        this.onRequestClose = this.onRequestClose.bind(this);
        this.onEditSaveAndClose = this.onEditSaveAndClose.bind(this);
        this.onEditSubmitted = this.onEditSubmitted.bind(this);
        this.onEditDialogOpen = this.onEditDialogOpen.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onLongDescChange = this.onLongDescChange.bind(this);
        this.onColorChanged = this.onColorChanged.bind(this);

    }

    componentWillReceiveProps(props: TaskEditDialogProps) {
        this.setState(this.getInitState(props));
    }

    private getInitState(props: TaskEditDialogProps) {

        let desc = "", longdesc = "", color = DEFAULT_COLOR, createdAt, lastUpdatedAt, presentationalOptions;

        if (props.task) {
            ({desc, longdesc, createdAt, lastUpdatedAt, presentationalOptions} = props.task);
            if (presentationalOptions) {
                color = presentationalOptions.color;
            }
        }

        const creationDateString = TaskEditDialog.buildDateString(createdAt);
        const lastUpdatedAtString = TaskEditDialog.buildDateString(lastUpdatedAt);

        return {desc, longdesc, color, creationDateString, lastUpdatedAtString};

    }

    render() {

        const previewVisible = this.state.longdesc.length > 0;

        const previewClassnames = classSet({
            "preview-section": true,
            "visible": previewVisible
        });

        const {creationDateString, lastUpdatedAtString} = this.state;

        let buttonEls;
        if (this.props.task) {
            buttonEls = (
                <p>
                    <button onClick={this.onEditSaveAndClose}>Save &amp; close</button>&nbsp;
                    <button onClick={this.onEditSubmitted}>Save &amp; continue</button>&nbsp;
                    <button onClick={this.onRequestClose}>Close</button>
                </p>
        );
        } else {
            buttonEls = (
                <p>
                    <button onClick={this.onEditSaveAndClose}>Add</button>&nbsp;
                    <button onClick={this.onRequestClose}>Close</button>
                </p>
            );
        }

        return (
            <Modal
                isOpen={this.props.opened}
                onRequestClose={this.onRequestClose}
                onAfterOpen={this.onEditDialogOpen}
                style={baseModalStyle}
                contentLabel="Edit Task Dialog">

                <div className="edit-task-form">
                    <div className="edit-section">

                        <h1>{this.props.dialogTitle}</h1>
                        <p>
                            Title:
                        </p>
                        <p>
                            <input
                                type="text"
                                value={this.state.desc}
                                onChange={this.onChange}
                                ref={(input) => {this.fieldInput = input;}}
                                onKeyPress={(ev) => {ev.key === "Enter" && this.onEditSaveAndClose();}}
                            />
                        </p>
                        <p>
                            Description:
                        </p>
                        <p>
                            <textarea value={this.state.longdesc} onChange={this.onLongDescChange}/>
                        </p>

                        <p>
                            Background Color <SelectColorField value={this.state.color} onChange={this.onColorChanged}/>
                        </p>

                        {buttonEls}

                        {creationDateString !== null ?
                            <div>Created on {creationDateString}</div>
                            : null
                        }

                        {lastUpdatedAtString !== null ?
                            <div>Last updated on {lastUpdatedAtString}</div>
                            : null
                        }

                    </div>

                    <div className={previewClassnames}>
                        <h2><AnnotatedHashtagDiv text={this.state.desc} appliedClassName="hashtag" /></h2>
                        <Markdown text={this.state.longdesc} />
                    </div>

                </div>

            </Modal>
        );
    }

    private onRequestClose() {
        const confirmationMessage = "Are you sure you want to close the dialog? No changes will be saved.";
        let longdesc;
        if (this.props.task) {
            ({longdesc} = this.props.task);
        }
        const changesDetected = this.state.longdesc !== (longdesc || "");
        if (!changesDetected || window.confirm(confirmationMessage)) {
            this.props.onCloseEditTask();
        }
    }

    private onChange(e: React.FormEvent<HTMLInputElement>) {
        const desc = e.currentTarget.value;
        this.setState({desc});
    }

    private onLongDescChange(e: React.FormEvent<HTMLTextAreaElement>) {
        const longdesc = e.currentTarget.value;
        this.setState({longdesc});
    }

    private onColorChanged(color: string) {
        this.setState({color});
    }

    private onEditSubmitted() {
        const presentationalOptions = {
            color: this.state.color
        };
        this.props.onEditSubmitted(this.state.desc, this.state.longdesc, presentationalOptions);
    }

    private onEditSaveAndClose() {
        this.onEditSubmitted();
        this.props.onCloseEditTask();
    }

    private onEditDialogOpen() {
        if (this.fieldInput) {
            this.fieldInput.focus();
        }
    }

    static buildDateString(timestamp: Timestamp | undefined): string | null {

        let dateString: string | null = null;

        if (timestamp) {
            const date = new Date(timestamp.value);
            dateString = date.toDateString();
        }

        return dateString;
    }

}