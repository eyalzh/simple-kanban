import * as React from "react";
import {Column, ColumnOptions, ColumnSize} from "../model/Column";
import {Task, TaskPresentationalOptions} from "../model/task";
import TaskComponent from "./TaskComponent";
import * as BoardActions from "../actions/boardActions";
import {allowBinds, bind, classSet} from "../util";
import TaskEditDialog from "./dialogs/TaskEditDialog";
import ColumnEditDialog from "./dialogs/ColumnEditDialog";
import {draggable, droppable, Referrable} from "./hoc/dragAndDrop";

interface ColumnProps extends Referrable {
    column: Column;
    tasks: Array<Task>;
    inBackground?: boolean;
    columnList: Column[] | null;
}

interface ColumnState {
    isTaskBeingAdded: boolean;
    isBeingEdited: boolean;
    isHoverMode: boolean;
}

@allowBinds
class ColumnComponent extends React.Component<ColumnProps, ColumnState> {

    constructor() {
        super();
        this.state = {
            isTaskBeingAdded: false,
            isBeingEdited: false,
            isHoverMode: false
        };
    }

    render() {

        const taskCount = this.props.tasks.length;
        const tasks = this.props.tasks.map((task) => {
            return (
                <TaskComponent
                    type="task"
                    data={{id: task.id, sourceColumnId: this.props.column.id}}
                    key={task.id}
                    task={task}
                    column={this.props.column}
                    columnList={this.props.columnList}
                />
            );
        });

        const isAboveWipLimit = taskCount > this.props.column.wipLimit;

        const isHalfCol = this.props.column.options && this.props.column.options.size === ColumnSize.HALF;
        const classNames = classSet({
            "column": true,
            "column-above-limit": isAboveWipLimit,
            "in-background": this.props.inBackground,
            "half-col": isHalfCol
        });

        return (
            <div
                ref={this.props.innerRef}
                className={classNames}>

                <div className="column-header" title="double click to edit" onDoubleClick={e => this.editColumn(e)}>
                    <div>{this.props.column.name}</div>
                    <div className="wip">{taskCount} / {this.props.column.wipLimit}</div>
                </div>
                <div className="task-container" onDoubleClick={this.onAddTask}>
                    {tasks}
                </div>
                <TaskEditDialog
                    opened={this.state.isTaskBeingAdded}
                    onCloseEditTask={this.closeEditTask}
                    onEditSubmitted={this.onTaskSubmitted}
                    dialogTitle="Add a New Task"
                    columnList={this.props.columnList}
                    currentColumnId={this.props.column.id}
                />
                 <ColumnEditDialog
                    opened={this.state.isBeingEdited}
                    onEditClose={this.closeEditColumn}
                    column={this.props.column}
                    onEditSubmitted={this.onEditColumnSubmitted}
                />
            </div>
        );
    }

    @bind
    private onAddTask() {
        this.setState({isTaskBeingAdded: true});
    }

    private editColumn(e: React.MouseEvent<HTMLElement>) {
        this.setState({isBeingEdited: true});
        e.stopPropagation();
    }

    @bind
    private onEditColumnSubmitted(name: string, wipLimit: number, options: ColumnOptions) {
        if (name !== null && Number.isInteger(wipLimit) && wipLimit > 0) {
            name = name.trim();
            if (name.length > 0) {
                BoardActions.editColumn(this.props.column, name, wipLimit, options);
            }
        }

        this.setState({isBeingEdited: false});
    }

    @bind
    private closeEditTask() {
        this.setState({isTaskBeingAdded: false});
    }

    @bind
    private closeEditColumn() {
        this.setState({isBeingEdited: false});
    }

    @bind
    private onTaskSubmitted(desc: string, longdesc: string, presentationalOptions: TaskPresentationalOptions, baseColumnId?: string) {
        BoardActions.addTask(this.props.column, desc, longdesc, presentationalOptions, baseColumnId);
    }

}

const DraggableDroppableColumnComponent = droppable(draggable<ColumnProps>(ColumnComponent));
export default DraggableDroppableColumnComponent;
