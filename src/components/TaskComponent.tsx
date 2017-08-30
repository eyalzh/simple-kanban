import * as React from "react";
import {Task} from "../model/task";
import * as BoardActions from "../actions/boardActions";
import {Column} from "../model/Column";
import TaskEditDialog from "./dialogs/TaskEditDialog";
import AnnotatedHashtagDiv from "./AnnotatedHashtagDiv";
import {draggable, Referrable} from "./dragAndDrop";
import {calcColorBasedOnBackground} from "../util";

interface TaskProps extends Referrable {
    task: Task;
    column: Column;
}

interface TaskState {
    isBeingEdited: boolean;
}

class TaskComponent extends React.Component<TaskProps, TaskState> {

    constructor() {

        super();

        this.state = {
            isBeingEdited: false
        };

        this.closeEditTask = this.closeEditTask.bind(this);
        this.onTaskSubmitted = this.onTaskSubmitted.bind(this);

    }

    render() {

        const {desc, longdesc, createdAt, lastUpdatedAt, presentationalOptions} = this.props.task;

        let bgColor;
        if (presentationalOptions) {
            bgColor = presentationalOptions.color;
        }

        return (
            <div
                ref={this.props.innerRef}
                className="task"
                onDoubleClick={e => this.editTask(e)}
                style={{backgroundColor: bgColor}}>

                <AnnotatedHashtagDiv
                    text={desc}
                    appliedClassName="hashtag"
                    className="task-title"
                    color={calcColorBasedOnBackground(bgColor)} />

                <TaskEditDialog
                    desc={desc}
                    longdesc={longdesc}
                    createdAt={createdAt}
                    lastUpdatedAt={lastUpdatedAt}
                    color={bgColor}
                    opened={this.state.isBeingEdited}
                    onCloseEditTask={this.closeEditTask}
                    onEditSubmitted={this.onTaskSubmitted}
                    dialogTitle="Edit Task"
                />

            </div>
        );
    }

    private editTask(e: React.MouseEvent<HTMLElement>) {
        this.setState({isBeingEdited: true});
        e.stopPropagation();

    }

    private onTaskSubmitted(desc, longdesc, presentationalOptions) {
        if (desc) {
            BoardActions.editTask(this.props.task.id, desc, longdesc, presentationalOptions);
        }
        this.setState({isBeingEdited: false});
    }

    private closeEditTask() {
        this.setState({isBeingEdited: false});
    }

}

const DraggableTaskComponent = draggable<TaskProps>(TaskComponent);
export default DraggableTaskComponent;