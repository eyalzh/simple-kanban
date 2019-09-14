import * as React from "react";
import {Column, ColumnOptions, ColumnSize} from "../model/Column";
import TaskComponent from "./TaskComponent";
import * as BoardActions from "../actions/boardActions";
import {allowBinds, bind, classSet} from "../util";
import TaskEditDialog from "./dialogs/TaskEditDialog";
import ColumnEditDialog from "./dialogs/ColumnEditDialog";
import {draggable, droppable, Referrable} from "./hoc/dragAndDrop";
import {Board} from "../model/Board";
import {Task, TaskPresentationalOptions} from "../model/Task";

interface ColumnProps extends Referrable {
    column: Column;
    tasks: Array<Task>;
    inBackground?: boolean;
    columnList: Column[] | null;
    boardList: Board[];
}

interface ColumnState {
    isTaskBeingAdded: boolean;
    isBeingEdited: boolean;
    isHoverMode: boolean;
}

@allowBinds
class ColumnComponent extends React.Component<ColumnProps, ColumnState> {

    constructor(props) {
        super(props);
        this.state = {
            isTaskBeingAdded: false,
            isBeingEdited: false,
            isHoverMode: false
        };
    }

    render() {

        const tasks = this.props.tasks.map(task => {

            const dragContextData = {
                id: task.id,
                sourceColumnId: this.props.column.id,
                deleteWithoutConfirmation: task.longdesc.length === 0
            };

            return (
                <TaskComponent
                    type="task"
                    data={dragContextData}
                    key={task.id}
                    task={task}
                    column={this.props.column}
                    columnList={this.props.columnList}
                    boardList={this.props.boardList}
                />
            );

        });

        const taskCount = this.props.tasks.length;
        const isAboveWipLimit = taskCount > this.props.column.wipLimit;

        const isHalfCol =
            this.props.column.options &&
            this.props.column.options.size === ColumnSize.HALF;
        const classNames = classSet({
            "column": true,
            "column-above-limit": isAboveWipLimit,
            "in-background": this.props.inBackground,
            "half-col": isHalfCol
        });

        return (
            <div ref={this.props.innerRef} className={classNames}>
                <div
                    className="column-header"
                    title="double click to edit"
                    onDoubleClick={e => this.editColumn(e)}
                >
                    <div>{this.props.column.name}</div>
                    <div className="wip">
                        {taskCount} / {this.props.column.wipLimit}
                    </div>
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
                    boardList={this.props.boardList}
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
    private onEditColumnSubmitted(
        name: string,
        wipLimit: number,
        options: ColumnOptions
    ) {
        if (name !== null && Number.isInteger(wipLimit) && wipLimit > 0) {
            const trimmedName = name.trim();
            if (trimmedName.length > 0) {
                BoardActions.editColumn(
                    this.props.column,
                    trimmedName,
                    wipLimit,
                    options
                );
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
    private onTaskSubmitted(
        desc: string,
        longdesc: string,
        presentationalOptions: TaskPresentationalOptions,
        baseColumnId?: string,
        linkToBoardId?: string,
        steamVol?: number,
        externalUrl?: string
    ) {
        BoardActions.addTask(
            this.props.column,
            desc,
            longdesc,
            presentationalOptions,
            baseColumnId,
            linkToBoardId,
            steamVol,
            externalUrl
        );
    }
}

const DraggableDroppableColumnComponent = droppable(draggable<ColumnProps>(ColumnComponent));
export default DraggableDroppableColumnComponent;
