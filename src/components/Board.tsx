import * as React from "react";
import ColumnComponent from "./ColumnComponent";
import dispatcher from "../Dispatcher";
import {Column} from "../model/column";
import {Priority} from "../Dispatcher";
import TrashZone from "./TrashZone";
import {BoardStore} from "../stores/BoardStore";
import {Task} from "../model/Task";
import * as BoardActions from "../actions/boardActions";
import {ColumnInsertionMode} from "../model/TaskModel";

require("./board.css");

interface BoardState {
    columns: Array<Column> | null;
    boardId: string;
    columnTasks: Map<string, Array<Task>> | null;
}

export default class Board extends React.Component<{}, BoardState> {

    constructor() {
        super();
        this.state = {
            columns: [],
            boardId: "",
            columnTasks: null
        };

        this.onMovedToTrash = this.onMovedToTrash.bind(this);

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

    private onDropColumn(columnId: string, type: string, data: any) {

        if (type === "task") {
            BoardActions.moveTask(data.id, data.sourceColumnId, columnId);
        } else if (type === "column") {
            BoardActions.reorderColumns(this.state.boardId, data.id, columnId, ColumnInsertionMode.AFTER);
        }

    }

    private onMovedToTrash(type: string, data: any) {

        if (type === "task") {
            BoardActions.deleteTask(data.sourceColumnId, data.id);
        } else if (type === "column") {
            BoardActions.removeColumn(this.state.boardId, data.id);
        }

    }

    render() {

        let columns;

        columns = (this.state.columns || []).map((column) => {

            let tasks;
            if (this.state.columnTasks) {
                tasks = this.state.columnTasks.get(column.id) || [];
            }

            return (
                <ColumnComponent
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    type="column"
                    data={{id: column.id}}
                    onDrop={this.onDropColumn.bind(this, column.id)}
                    filterTypeFunc={(type, data) => !(type === "task" && data.sourceColumnId === column.id)}
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