import * as React from "react";
import {Column} from "../model/column";
import {Task} from "../model/task";
import TaskComponent from "./TaskComponent";
import * as BoardActions from "../actions/boardActions";
import {classSet} from "../util";
import dragContext from "../model/dragContext";
import {DragContextType} from "../model/dragContext";
import TaskEditDialog from "./TaskEditDialog";
import ColumnEditDialog from "./ColumnEditDialog";

interface ColumnProps {
    column: Column;
    boardId: string;
    tasks: Array<Task>;
}

interface ColumnState {
    isTaskBeingAdded: boolean;
    isBeingEdited: boolean;
    isHoverMode: boolean;
}

export default class ColumnComponent extends React.Component<ColumnProps, ColumnState> {

    constructor() {
        super();
        this.state = {
            isTaskBeingAdded: false,
            isBeingEdited: false,
            isHoverMode: false
        };
    }

    render() {

        let taskNo = 0;
        const tasks = this.props.tasks.map((task) => {
            taskNo++;
            return (
                <TaskComponent key={task.id} task={task} column={this.props.column} />
            );
        });

        const isAboveWipLimit = taskNo > this.props.column.wipLimit;

        const classNames = classSet({
            "column": true,
            "column-above-limit": isAboveWipLimit
        });

        return (
            <div className={classNames}
                 onDragOver={e => this.onDragOver(e)}
                 onDrop={e => this.onDropTask(e)}
                 onDoubleClick={e => this.onAddTask()}
                 onDragStart={e => this.onDragStart(e)}
                 draggable={true}>
                <div className="column-header" title="double click to edit" onDoubleClick={e => this.editColumn(e)}>
                    <div>{this.props.column.name}</div>
                    <div className="wip">{taskNo} / {this.props.column.wipLimit}</div>
                </div>
                <div className="task-container">
                    {tasks}
                </div>
                {this.state.isTaskBeingAdded ? <TaskEditDialog
                    isBeingEdited={this.state.isTaskBeingAdded}
                    onCloseEditTask={this.closeEditTask.bind(this)}
                    onEditSubmitted={this.onTaskSubmitted.bind(this)}
                    dialogTitle="Add a New Task"
                /> : <span />}
                {this.state.isBeingEdited ? <ColumnEditDialog
                    isBeingEdited={this.state.isBeingEdited}
                    onEditClose={this.closeEditColumn.bind(this)}
                    name={this.props.column.name}
                    wipLimit={this.props.column.wipLimit}
                    onEditSubmitted={this.onEditColumnSubmitted.bind(this)}
                /> : <span />}
            </div>
        );
    }

    private onAddTask() {
        this.state.isTaskBeingAdded = true;
        this.setState(this.state);
    }

    private editColumn(e: React.MouseEvent) {
        this.state.isBeingEdited = true;
        this.setState(this.state);

        e.stopPropagation();
    }

    private onEditColumnSubmitted(name: string, wipLimit: number) {
        if (name !== null && Number.isInteger(wipLimit) && wipLimit > 0) {
            name = name.trim();
            if (name.length > 0) {
                BoardActions.editColumn(this.props.column, name, wipLimit);
            }
        }
        this.state.isBeingEdited = false;
        this.setState(this.state);
    }

    private onDropTask(e: React.DragEvent) {

        const context = dragContext.get(e);

        if (typeof context === "undefined") {
            throw new Error("could not drop task - context is undefined");
        }

        dragContext.delete(e);

        if (context.type === DragContextType.TASK) {
            BoardActions.moveTask(context.entityId, context.sourceColumnId, this.props.column.id);
        } else if (context.type === DragContextType.COLUMN) {
            BoardActions.switchColumns(this.props.boardId, context.sourceColumnId, this.props.column.id);
        }

    }

    private onDragOver(e: React.DragEvent) {
        const context = dragContext.get(e);
        if (context) {
            if (context.sourceColumnId !== this.props.column.id) {
                e.preventDefault();
            }
        }
        return false;
    }

    private onDragStart(e: React.DragEvent) {
        dragContext.set(e, {
            type: DragContextType.COLUMN,
            boardId: this.props.boardId,
            entityId: this.props.column.id,
            sourceColumnId: this.props.column.id
        });

        e.dataTransfer.setData("text/plain", ""); // For firefox
    }

    private closeEditTask() {
        this.state.isTaskBeingAdded = false;
        this.setState(this.state);
    }

    private closeEditColumn() {
        this.state.isBeingEdited = false;
        this.setState(this.state);
    }

    private onTaskSubmitted(desc: string, longdesc: string) {
        if (desc) {
            BoardActions.addTask(this.props.column, desc, longdesc);
            this.state.isTaskBeingAdded = false;
            this.setState(this.state);
        }
    }

}