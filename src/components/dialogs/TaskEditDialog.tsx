import * as React from "react";
import Markdown from "../Markdown";
import {classSet} from "../../util";
import {Timestamp} from "../../model/Timestamp";
import * as Modal from "react-modal";
import AnnotatedHashtagDiv from "../AnnotatedHashtagDiv";
import {baseModalStyle} from "./dialogStyle";

interface TaskEditDialogProps {
    dialogTitle: string;
    desc?: string;
    longdesc?: string;
    createdAt?: Timestamp;
    lastUpdatedAt?: Timestamp;
    opened: boolean;
    onCloseEditTask: () => void;
    onEditSubmitted: (desc: string, longdesc: string) => void;
}

interface TaskEditDialogState {
    desc: string;
    longdesc: string;
    creationDateString: string | null;
    lastUpdatedAtString: string | null;
}

export default class TaskEditDialog extends React.Component<TaskEditDialogProps, TaskEditDialogState> {

    private fieldInput: HTMLInputElement | null;

    constructor(props) {
        super(props);
        this.state = this.getInitState(props);

        this.onRequestClose = this.onRequestClose.bind(this);
        this.onEditDialogOpen = this.onEditDialogOpen.bind(this);

        this.onChange = this.onChange.bind(this);
        this.onLongDescChange = this.onLongDescChange.bind(this);

    }

    componentWillReceiveProps(props) {
        this.setState(this.getInitState(props));
    }

    private getInitState(props) {
        return {
            desc: props.desc || "",
            longdesc: props.longdesc || "",
            creationDateString: TaskEditDialog.buildDateString(props.createdAt),
            lastUpdatedAtString: TaskEditDialog.buildDateString(this.props.lastUpdatedAt)
        };
    }

    render() {

        const previewVisible = this.state.longdesc.length > 0;

        const previewClassnames = classSet({
            "preview-section": true,
            "visible": previewVisible
        });

        const {creationDateString, lastUpdatedAtString} = this.state;

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
                                value={this.state.desc}
                                onChange={this.onChange}
                                ref={(input) => {this.fieldInput = input;}}
                                onKeyPress={(ev) => {ev.key === "Enter" && this.onEditSubmitted();}}
                            />
                        </p>
                        <p>
                            Description:
                        </p>
                        <p>
                            <textarea value={this.state.longdesc} onChange={this.onLongDescChange}/>
                        </p>
                        <p>
                            <button onClick={() => this.onEditSubmitted()}>Submit</button>&nbsp;
                            <button onClick={this.onRequestClose}>Cancel</button>
                        </p>

                        {creationDateString !== null ?
                            <div>Created on {creationDateString}</div>
                            : <span />
                        }

                        {lastUpdatedAtString !== null ?
                            <div>Last updated on {lastUpdatedAtString}</div>
                            : <span />
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
        const confirmationMessage = 'Are you sure you want to close the dialog? No changes will be saved.';
        const changesDetected = this.state.longdesc !== this.props.longdesc;
        debugger;
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

    private onEditSubmitted() {
        this.props.onEditSubmitted(this.state.desc, this.state.longdesc);
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