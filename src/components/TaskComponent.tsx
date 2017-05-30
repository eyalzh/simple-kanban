import * as React from "react";
import {Task} from "../model/task";
import * as BoardActions from "../actions/boardActions";
import {Column} from "../model/column";
import dragContext from "../model/dragContext";
import {DragContextType} from "../model/dragContext";
import TaskEditDialog from "./TaskEditDialog";

interface TaskProps {
    task: Task;
    column: Column;
}

interface TaskState {
    isBeingEdited: boolean;
}

export default class TaskComponent extends React.Component<TaskProps, TaskState> {

    constructor(props) {
        super(props);
        this.state = {
            isBeingEdited: false
        };
    }

    render() {

        const {desc, longdesc, createdAt, lastUpdatedAt} = this.props.task;

        const renderedDesc = this.colorize(desc);
        return (
            <div
                className="task"
                onDragStart={e => this.dragStart(e)}
                draggable={true}
                onDoubleClick={e => this.editTask(e)}>

                <div className="task-title">{renderedDesc}</div>

                <TaskEditDialog
                    desc={desc}
                    longdesc={longdesc}
                    createdAt={createdAt}
                    lastUpdatedAt={lastUpdatedAt}
                    isBeingEdited={this.state.isBeingEdited}
                    onCloseEditTask={this.closeEditTask.bind(this)}
                    onEditSubmitted={this.onTaskSubmitted.bind(this)}
                    dialogTitle="Edit Task"
                />

            </div>
        );
    }

    private editTask(e: React.MouseEvent) {
        this.state.isBeingEdited = true;
        this.setState(this.state);
        e.stopPropagation();

    }

    private onTaskSubmitted(desc, longdesc) {
        if (desc) {
            BoardActions.editTask(this.props.task.id, desc, longdesc);
        }
        this.state.isBeingEdited = false;
        this.setState(this.state);
    }

    private closeEditTask() {
        this.state.isBeingEdited = false;
        this.setState(this.state);
    }

    private dragStart(e: React.DragEvent) {
        dragContext.set(e, {
            type: DragContextType.TASK,
            entityId: this.props.task.id,
            sourceColumnId: this.props.column.id
        });

        e.dataTransfer.setData("text/plain", ""); // For firefox

        e.stopPropagation();
    }

    private colorize(text: string): React.ReactElement<{}>[] | string {

        if (text.indexOf("#") === -1) {
            return text;
        } else {
            return text
                .split(/(#\S+)/g)
                .map((expr, i) => {
                    if (expr.indexOf("#") === 0) {
                        return (
                            <span key={i} className="hashtag">{expr}</span>
                        );
                    } else {
                        return (
                            <span key={i}>{expr}</span>
                        );
                    }
                });
        }

    }

}