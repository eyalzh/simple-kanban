import * as React from "react";
import {allowBinds, bind} from "../../util";
import {Timestamp} from "../../model/Timestamp";
import {Task, TaskPresentationalOptions} from "../../model/Task";
import FormField from "../fields/FormField";
import ActionDialog from "./ActionDialog";
import {ReactElement} from "react";
import {Column} from "../../model/Column";
import AdvancedTaskEditSection from "./AdvancedTaskEditSection";
import {Board} from "../../model/Board";

interface TaskEditDialogProps {
    dialogTitle: string;
    opened: boolean;
    task?: Task;
    onCloseEditTask: () => void;
    onEditSubmitted: (
        desc: string,
        longdesc: string,
        presentationalOptions: TaskPresentationalOptions,
        baseColumnId?: string,
        linkToBoardId?: string,
        steamVol?: number,
        externalUrl?: string) => void;
    columnList: Column[] | null;
    boardList: Board[];
    currentColumnId: string;
}

interface TaskEditDialogState {
    desc: string;
    longdesc: string;
    color: string;
    creationDateString: string | null;
    lastUpdatedAtString: string | null;
    baseColumnId?: string;
    linkToBoardId?: string;
    steamVol?: number;
    externalUrl?: string;
}

const DEFAULT_COLOR = "#FFF8BA";

@allowBinds
export default class TaskEditDialog extends React.Component<TaskEditDialogProps, TaskEditDialogState> {

    private fieldInput: HTMLInputElement | null = null;

    constructor(props) {
        super(props);
        this.state = this.getInitState(props);
    }

    componentWillReceiveProps(props: TaskEditDialogProps) {
        const justOpened = props.opened && !this.props.opened;
        const taskSwitched = this.props.task && props.task && this.props.task.id !== props.task.id;
        if (justOpened || taskSwitched) {
            this.setState(this.getInitState(props));
        }
    }

    render() {

        if (! this.props.opened) {
            return null;
        }

        const {creationDateString, lastUpdatedAtString} = this.state;

        let buttonEls: ReactElement,
            info: ReactElement | null = null;

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
            );

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
            <div onDoubleClick={(e) => {e.stopPropagation()}}>
                <ActionDialog
                    title={this.props.task ? "Edit Task" : "Create a Task"}
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
                                    ref={(input) => { this.fieldInput = input; }}
                                    onKeyPress={this.onInputKeyPress}
                                />
                            </FormField>

                            <FormField caption="Description" direction="column">
                                <textarea value={this.state.longdesc} onChange={this.onLongDescChange}/>
                            </FormField>

                            <AdvancedTaskEditSection
                                boardList={this.props.boardList}
                                columnList={this.props.columnList}
                                color={this.state.color}
                                baseColumnId={this.state.baseColumnId}
                                linkToBoardId={this.state.linkToBoardId}
                                taskSteamVol={this.state.steamVol}
                                externalUrl={this.state.externalUrl}
                                onColorChanged={this.onColorChanged}
                                onResetColors={this.onResetColors}
                                onBaseColChanged={this.onBaseColChanged}
                                onLinkToBoardChanged={this.onLinkBoardChanged}
                                onSteamVolChanged={this.onSteamVolChanged}
                                onChangeUrl={this.onChangeUrl}
                            />

                        </div>

                    </div>

                </ActionDialog>

            </div>

        );
    }

    private getInitState(props: TaskEditDialogProps): TaskEditDialogState  {

        let desc = "",
            longdesc = "",
            color = DEFAULT_COLOR,
            createdAt,
            lastUpdatedAt,
            presentationalOptions,
            baseColumnId: string | undefined = props.currentColumnId,
            linkToBoardId,
            steamVol,
            externalUrl;

        if (props.task) {
            ({
                desc,
                longdesc,
                createdAt,
                lastUpdatedAt,
                presentationalOptions,
                baseColumnId,
                linkToBoardId,
                steamVol,
                externalUrl
            } = props.task);
            if (presentationalOptions) {
                color = presentationalOptions.color;
            }
        }

        const creationDateString = TaskEditDialog.buildDateString(createdAt);
        const lastUpdatedAtString = TaskEditDialog.buildDateString(lastUpdatedAt);

        return { desc, longdesc, color, creationDateString, lastUpdatedAtString, baseColumnId, linkToBoardId, steamVol, externalUrl };

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
    private onResetColors() {
        this.setState({color: DEFAULT_COLOR});
    }

    @bind
    private onEditSubmitted() {
        const presentationalOptions = {
            color: this.state.color
        };
        this.props.onEditSubmitted(
            this.state.desc,
            this.state.longdesc,
            presentationalOptions,
            this.state.baseColumnId,
            this.state.linkToBoardId,
            this.state.steamVol,
            this.state.externalUrl
        );
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

    @bind
    private onBaseColChanged(baseColumnId: string) {
        this.setState({baseColumnId});
    }

    @bind
    private onLinkBoardChanged(linkToBoardId: string | undefined) {
        this.setState({linkToBoardId});
    }

    @bind
    private onSteamVolChanged(steamVol: number) {
        this.setState({
            steamVol
        });
    }

    @bind
    private onChangeUrl(externalUrl: string) {
        this.setState({
            externalUrl
        });
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
