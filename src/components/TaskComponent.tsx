import * as React from "react";
import {Task} from "../model/task";
import * as BoardActions from "../actions/boardActions";
import {Column} from "../model/Column";
import TaskEditDialog from "./dialogs/TaskEditDialog";
import AnnotatedHashtagDiv from "./AnnotatedHashtagDiv";
import {draggable, Referrable} from "./hoc/dragAndDrop";
import {allowBinds, bind, calcColorBasedOnBackground} from "../util";

interface TaskProps extends Referrable {
    task: Task;
    column: Column;
    columnList: Column[] | null;
}

interface TaskState {
    isBeingEdited: boolean;
}

@allowBinds
class TaskComponent extends React.Component<TaskProps, TaskState> {

    constructor() {
        super();
        this.state = {
            isBeingEdited: false
        };
    }

    render() {

        const {desc, presentationalOptions, counters} = this.props.task;

        let bgColor, sideColor;
        if (presentationalOptions) {
            bgColor = presentationalOptions.color;
            sideColor = presentationalOptions.sideColor;
        }

        let counterValue: number | null = null;
        if (counters && counters.length > 0) {
            counterValue = counters[0].value;
        }

        return (
            <div
                ref={this.props.innerRef}
                className="task"
                onDoubleClick={e => this.editTask(e)}
                style={{backgroundColor: bgColor}}>

                <AnnotatedHashtagDiv
                    text={desc}
                    counterValue={counterValue}
                    appliedClassName="hashtag"
                    className="task-title"
                    color={calcColorBasedOnBackground(bgColor)} />

                <TaskEditDialog
                    task={this.props.task}
                    opened={this.state.isBeingEdited}
                    onCloseEditTask={this.closeEditTask}
                    onEditSubmitted={this.onTaskSubmitted}
                    dialogTitle="Edit Task"
                    columnList={this.props.columnList}
                    currentColumnId={this.props.column.id}
                />

                {sideColor ? <div className="side-color-marker" style={{backgroundColor: sideColor}} /> : null}

            </div>
        );
    }

    private editTask(e: React.MouseEvent<HTMLElement>) {
        this.setState({isBeingEdited: true});
        e.stopPropagation();
    }

    @bind
    private onTaskSubmitted(desc, longdesc, presentationalOptions, baseColumnId) {
        BoardActions.editTask(this.props.task.id, desc, longdesc, presentationalOptions, baseColumnId);
    }

    @bind
    private closeEditTask() {
        this.setState({isBeingEdited: false});
    }

}

const DraggableTaskComponent = draggable<TaskProps>(TaskComponent);
export default DraggableTaskComponent;