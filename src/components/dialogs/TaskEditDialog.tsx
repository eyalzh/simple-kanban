import * as React from "react";
import Markdown from "../Markdown";
import {allowBinds, bind} from "../../util";
import {Timestamp} from "../../model/Timestamp";
import * as Modal from "react-modal";
import AnnotatedHashtagDiv from "../AnnotatedHashtagDiv";
import {rightSideModalStyle} from "./dialogModalStyle";
import SelectColorField from "../fields/SelectColorField";
import {Task, TaskPresentationalOptions} from "../../model/Task";
import FormField from "../fields/FormField";
import ActionDialog from "./ActionDialog";
import {ReactElement} from "react";

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

@allowBinds
export default class TaskEditDialog extends React.Component<TaskEditDialogProps, TaskEditDialogState> {

    private fieldInput: HTMLInputElement | null = null;

    constructor(props) {
        super(props);
        this.state = this.getInitState(props);
    }

    componentWillReceiveProps(props: TaskEditDialogProps) {
        const justOpened = props.opened && !this.props.opened;
        const taskSwitched = this.props.task !== props.task;
        if (justOpened || taskSwitched) {
            this.setState(this.getInitState(props));
        }
    }

    private getInitState(props: TaskEditDialogProps): TaskEditDialogState  {

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

        if (! this.props.opened) return null;

        const {creationDateString, lastUpdatedAtString} = this.state;

        let buttonEls: ReactElement<any>,
            info: ReactElement<any> | null = null;

        if (this.props.task) {
            buttonEls = (
                <div>
                    <button onClick={this.onEditSaveAndClose}>Save &amp; close</button>&nbsp;
                    <button onClick={this.onEditSubmitted}>Save &amp; continue</button>&nbsp;
                    <button onClick={this.onRequestClose}>Close</button>
                </div>
            );

            info =  (
                <div className="dialog-date-section">
                    {creationDateString !== null ? <div><b>Created</b> {creationDateString}</div> : null}
                    {lastUpdatedAtString !== null ? <div><b>Last updated</b> {lastUpdatedAtString}</div> : null}
                </div>
            )

        } else {
            buttonEls = (
                <div>
                    <button onClick={this.onEditSaveAndClose}>Submit</button>&nbsp;
                    <button onClick={this.onEditSaveAndNew}>Submit &amp; Another</button>&nbsp;
                    <button onClick={this.onRequestClose}>Close</button>
                </div>
            );
        }

        return (
            <div>
                <ActionDialog
                    title="Edit Task"
                    opened={this.props.opened}
                    onRequestClose={this.onRequestClose}
                    onOpen={this.onEditDialogOpen}
                    buttons={buttonEls}
                    info={info}
                    >

                    <div className="edit-task-form">
                        <div className="edit-section">

                            <FormField caption="Title" direction="column">
                                <input
                                    type="text"
                                    value={this.state.desc}
                                    onChange={this.onChange}
                                    ref={(input) => {this.fieldInput = input;}}
                                    onKeyPress={this.onInputKeyPress}
                                />
                            </FormField>

                            <FormField caption="Description" direction="column">
                                <textarea value={this.state.longdesc} onChange={this.onLongDescChange}/>
                            </FormField>

                            <div className="color-section">
                                <div>
                                    <SelectColorField value={this.state.color} onChange={this.onColorChanged}/> Background
                                </div>
                                <div>
                                    <SelectColorField value={this.state.color} onChange={this.onColorChanged}/> Side
                                </div>
                            </div>

                        </div>

                    </div>

                    <Modal
                        isOpen={this.props.opened}
                        onRequestClose={this.onRequestClose}
                        onAfterOpen={this.onEditDialogOpen}
                        style={rightSideModalStyle}
                        shouldCloseOnOverlayClick={false}
                        contentLabel="Edit Task">

                        <div className="preview-section">
                            <div className="soft-modal-title">markdown</div>
                            <h2><AnnotatedHashtagDiv text={this.state.desc} appliedClassName="hashtag" /></h2>
                            <Markdown text={this.state.longdesc} />
                        </div>

                    </Modal>

                </ActionDialog>

            </div>

        );
    }

    @bind
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

    @bind
    private onChange(e: React.FormEvent<HTMLInputElement>) {
        const desc = e.currentTarget.value;
        this.setState({desc});
    }

    @bind
    private onLongDescChange(e: React.FormEvent<HTMLTextAreaElement>) {
        const longdesc = e.currentTarget.value;
        this.setState({longdesc});
    }

    @bind
    private onColorChanged(color: string) {
        this.setState({color});
    }

    @bind
    private onEditSubmitted() {
        const presentationalOptions = {
            color: this.state.color
        };
        this.props.onEditSubmitted(this.state.desc, this.state.longdesc, presentationalOptions);
    }

    @bind
    private onEditSaveAndClose() {
        this.onEditSubmitted();
        this.props.onCloseEditTask();
    }

    @bind
    private onEditDialogOpen() {
        if (this.fieldInput) {
            this.fieldInput.focus();
        }
    }

    @bind
    private onEditSaveAndNew() {
        this.onEditSubmitted();
        this.setState(this.getInitState(this.props));
    }

    @bind
    private onInputKeyPress(ev: React.KeyboardEvent<HTMLInputElement>) {
        if (ev.key === "Enter" && this.state.desc.length > 0) {
            const notInEditMode = !this.props.task;
            const shiftUsed = ev.shiftKey;
            if (shiftUsed && notInEditMode) {
                this.onEditSaveAndNew();
            } else {
                this.onEditSaveAndClose();
            }
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