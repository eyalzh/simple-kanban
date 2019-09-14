import * as React from "react";
import * as BoardActions from "../actions/boardActions";
import {Column} from "../model/Column";
import TaskEditDialog from "./dialogs/TaskEditDialog";
import AnnotatedHashtagDiv from "./annotations/AnnotatedHashtagDiv";
import {draggable, Referrable} from "./hoc/dragAndDrop";
import {allowBinds, bind, calcColorBasedOnBackground} from "../util";
import {Board} from "../model/Board";
import {getTaskSteamStatus, Task, TaskSteamStatus} from "../model/Task";

interface TaskProps extends Referrable {
    task: Task;
    column: Column;
    columnList: Column[] | null;
    boardList: Board[];
}

interface TaskState {
    isBeingEdited: boolean;
}

@allowBinds
class TaskComponent extends React.Component<TaskProps, TaskState> {

    constructor(props) {

        super(props);

        this.state = {
            isBeingEdited: false
        };
    }

    render() {

        const {desc, presentationalOptions} = this.props.task;

        let bgColor;
        if (presentationalOptions) {
            bgColor = presentationalOptions.color;
        }

        const steamStatus = getTaskSteamStatus(this.props.task);
        let sideColor: string | null  = null;

        switch (steamStatus) {
            case TaskSteamStatus.FULL:
                sideColor = "#f00";
                break;
            case TaskSteamStatus.HALF_FULL:
            case TaskSteamStatus.ALMOST_FULL:
                sideColor = "#fbb";
                break;
            default:
                sideColor = null;
        }

        return (
            <div
                ref={this.props.innerRef}
                className="task"
                onDoubleClick={e => this.editTask(e)}
                style={{backgroundColor: bgColor}}>

                <AnnotatedHashtagDiv
                    text={desc}
                    task={this.props.task}
                    className="task-title"
                    color={calcColorBasedOnBackground(bgColor)}
                    linkToBoard={this.props.task.linkToBoardId}
                    externalUrl={this.props.task.externalUrl}
                />

                <TaskEditDialog
                    task={this.props.task}
                    opened={this.state.isBeingEdited}
                    onCloseEditTask={this.closeEditTask}
                    onEditSubmitted={this.onTaskSubmitted}
                    dialogTitle="Edit Task"
                    columnList={this.props.columnList}
                    boardList={this.props.boardList}
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
    private onTaskSubmitted(
        desc,
        longdesc,
        presentationalOptions,
        baseColumnId,
        linkToBoardId,
        steamVol,
        externalUrl) {
        BoardActions.editTask(
            this.props.task.id,
            desc,
            longdesc,
            presentationalOptions,
            baseColumnId,
            linkToBoardId,
            steamVol,
            externalUrl
        );
    }

    @bind
    private closeEditTask() {
        this.setState({isBeingEdited: false});
    }

}

const DraggableTaskComponent = draggable<TaskProps>(TaskComponent);
export default DraggableTaskComponent;
