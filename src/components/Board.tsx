import * as React from "react";
import ColumnComponent from "./ColumnComponent";
import dispatcher from "../Dispatcher";
import {Column} from "../model/column";
import {Priority} from "../Dispatcher";
import TrashZone from "./TrashZone";
import {BoardStore} from "../stores/BoardStore";
import {Task} from "../model/Task";
import * as BoardActions from "../actions/boardActions";
import {reorderArray} from "../model/util";

require("./board.css");

interface BoardState {
    columns: Array<Column> | null;
    boardId: string;
    columnTasks: Map<string, Array<Task>> | null;
    columnIdBeingDragged: string|null;
}

export default class Board extends React.Component<{}, BoardState> {

    constructor() {
        super();
        this.state = {
            columns: [],
            boardId: "",
            columnTasks: null,
            columnIdBeingDragged: null
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

    private onDropColumn(columnId: string, type: string, data: any) {

        switch (type) {
            case "task":
                BoardActions.moveTask(data.id, data.sourceColumnId, columnId);
                break;
            case "column":
                BoardActions.setOrder(this.state.boardId, (this.state.columns || []).map(col => col.id));
                break;

            default:
        }

    }

    private onDragEnter(targetColumnId: string, type: string, data: any) {

        if (type !== "column" || data.id === targetColumnId) {
            return;
        }

        const columns = this.state.columns || [];

        const firstIdx = columns.findIndex(col => col.id === data.id);
        const secondIdx = columns.findIndex(col => col.id === targetColumnId);

        const newlyOrderedColumns = reorderArray(columns, firstIdx, secondIdx);

        this.setState({columns: newlyOrderedColumns});
    }

    private onMovedToTrash(type: string, data: any) {

        switch(type) {
            case "task":
                BoardActions.deleteTask(data.sourceColumnId, data.id);
                break;

            case "column":
                BoardActions.removeColumn(this.state.boardId, data.id);
                break;

            default:
        }

    }

    private onColumnBeingDragged(columnId: string) {
        this.setState({columnIdBeingDragged: columnId});
    }

    private onColumnDraggedEnd() {
        this.setState({columnIdBeingDragged: null});
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
                    filterTypeFunc={(type, data) => !(type === "task" && data.sourceColumnId === column.id)}
                    onDrop={this.onDropColumn.bind(this, column.id)}
                    onDragStart={this.onColumnBeingDragged.bind(this, column.id)}
                    onDragEnd={this.onColumnDraggedEnd}
                    onDragEnter={this.onDragEnter.bind(this, column.id)}
                    inBackground={this.state.columnIdBeingDragged !== null && this.state.columnIdBeingDragged !== column.id}
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