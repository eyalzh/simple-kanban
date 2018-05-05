import * as React from "react";
import ColumnComponent from "./ColumnComponent";
import dispatcher from "../Dispatcher";
import {Column} from "../model/Column";
import {Priority} from "../Dispatcher";
import TrashZone from "./TrashZone";
import {FullStore} from "../stores/BoardStore";
import {Task} from "../model/Task";
import * as BoardActions from "../actions/boardActions";
import {allowBinds, bind, reorderArray} from "../util";
import {Board as BoardModel} from "../model/Board";

import "./board.css";

interface BoardState {
    columns: Array<Column> | null;
    boards: Array<BoardModel>;
    boardId: string;
    columnTasks: Map<string, Array<Task>> | null;
    columnIdBeingDragged: string | null;
}

@allowBinds
export default class Board extends React.Component<{}, BoardState> {

    constructor() {
        super();
        this.state = {
            columns: [],
            boards: [],
            boardId: "",
            columnTasks: null,
            columnIdBeingDragged: null
        };
    }

    componentWillMount() {
        dispatcher.register((actionName, store: FullStore) => {
            switch (actionName) {
                case "refreshFull":
                case "refreshCurrentBoard":
                    this.syncState(store);
                    break;
            }
        }, Priority.FIRST);
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
                    columnList={this.state.columns}
                    boardList={this.state.boards}
                />
            );

        });

        return (
            <div className="board-container">
                {columns}
                <TrashZone onDrop={this.onMovedToTrash}/>
            </div>
        );
    }

    private syncState(store: FullStore) {

        if (store.currentBoard !== null) {
            const boardId = store.currentBoard.id;
            const boards = store.boards || this.state.boards;
            this.setState({
                boardId,
                columns: store.columnsInBoard,
                boards,
                columnTasks: store.columnTasks,
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

    @bind
    private onMovedToTrash(type: string, data: any) {

        switch (type) {
            case "task":
                BoardActions.deleteTask(data.sourceColumnId, data.id);
                break;

            case "column":
                BoardActions.removeColumn(this.state.boardId, data.id);
                break;

            default:
        }

    }

    @bind
    private onColumnBeingDragged(columnId: string) {
        this.setState({columnIdBeingDragged: columnId});
    }

    @bind
    private onColumnDraggedEnd() {
        this.setState({columnIdBeingDragged: null});
    }

}
