import * as React from "react";
import ColumnComponent from "./ColumnComponent";
import dispatcher from "../Dispatcher";
import {Column} from "../model/column";
import {Priority} from "../Dispatcher";
import TrashZone from "./TrashZone";
import {BoardStore} from "../stores/BoardStore";
import {Task} from "../model/Task";
import ColumnDropZone from "./ColumnDropZone";
import * as BoardActions from "../actions/boardActions";
import {ColumnInsertionMode} from "../model/TaskModel";

require("./board.css");

interface BoardState {
    columns: Array<Column> | null;
    boardId: string;
    columnTasks: Map<string, Array<Task>> | null;
    columnBeingDragged: boolean;
}

export default class Board extends React.Component<{}, BoardState> {

    constructor() {
        super();
        this.state = {
            columns: [],
            boardId: "",
            columnTasks: null,
            columnBeingDragged: false
        };

        this.onMovedToTrash = this.onMovedToTrash.bind(this);
        this.onColumnBeingDragged = this.onColumnBeingDragged.bind(this);
        this.onColumnDraggedEnd = this.onColumnDraggedEnd.bind(this);

    }

    componentWillMount() {
        dispatcher.register((actionName, store: BoardStore) => {
            switch (actionName) {
                case "refreshBoard":
                    this.syncState(store);
                    break;
            }
        }, Priority.FIRST);
    }

    private syncState(store: BoardStore) {

        if (store.currentBoard !== null) {
            const boardId = store.currentBoard.id;
            this.setState({
                boardId,
                columns: store.columnsInBoard,
                columnTasks: store.columnTasks
            });
        }
    }

    private onDropColumn(columnId: string, _type: string, data: any) {
        BoardActions.moveTask(data.id, data.sourceColumnId, columnId);
    }

    private onMovedToTrash(type: string, data: any) {

        if (type === "task") {
            BoardActions.deleteTask(data.sourceColumnId, data.id);
        } else if (type === "column") {
            BoardActions.removeColumn(this.state.boardId, data.id);
        }

    }

    private onColumnDroppedIntoZone(targetColumnId: string, insertionMode: ColumnInsertionMode, _type: string, data: any) {
        BoardActions.reorderColumns(this.state.boardId, data.id, targetColumnId, insertionMode);
    }

    private onColumnBeingDragged() {
        this.setState({columnBeingDragged: true});
    }

    private onColumnDraggedEnd() {
        this.setState({columnBeingDragged: false});
    }

    render() {

        let columns;
        columns = (this.state.columns || []).map((column, i) => {

            let tasks;
            if (this.state.columnTasks) {
                tasks = this.state.columnTasks.get(column.id) || [];
            }

            let rightColumnDropZone;
            let leftColumnDropZone;
            if (this.state.columnBeingDragged) {

                const filterTypeFunc = (type) => type === "column";

                rightColumnDropZone = <ColumnDropZone
                    onDrop={this.onColumnDroppedIntoZone.bind(this, column.id, ColumnInsertionMode.AFTER)}
                    filterTypeFunc={filterTypeFunc}
                />;

                if (i === 0) {
                    leftColumnDropZone = <ColumnDropZone
                        onDrop={this.onColumnDroppedIntoZone.bind(this, column.id, ColumnInsertionMode.BEFORE)}
                        filterTypeFunc={filterTypeFunc}
                    />
                }
            }

            return (
                <ColumnComponent
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    type="column"
                    data={{id: column.id}}
                    filterTypeFunc={(type, data) => (type === "task" && data.sourceColumnId !== column.id)}
                    onDrop={this.onDropColumn.bind(this, column.id)}
                    onDragStart={this.onColumnBeingDragged}
                    onDragEnd={this.onColumnDraggedEnd}
                    inBackground={this.state.columnBeingDragged}
                    rightEar={rightColumnDropZone}
                    leftEar={leftColumnDropZone}
                />
            );

        });

        return (
            <div>
                {columns}
                <TrashZone onDrop={this.onMovedToTrash}/>
            </div>
        );
    }

}