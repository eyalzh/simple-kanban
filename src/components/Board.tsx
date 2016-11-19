import * as React from "react";
import ColumnComponent from "./ColumnComponent";
import dispatcher from "../Dispatcher";
import {Column} from "../model/column";
import {Priority} from "../Dispatcher";
import TrashZone from "./TrashZone";
import {BoardStore} from "../stores/BoardStore";
import {Task} from "../model/Task";

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

    render() {

        let columns;
        if (this.state.columns) {
            columns = this.state.columns.map((column) => {
                let tasks;
                if (this.state.columnTasks) {
                    tasks = this.state.columnTasks.get(column.id) || [];
                }
                if (column) {
                    return (
                        <ColumnComponent
                            key={column.id}
                            column={column}
                            boardId={this.state.boardId}
                            tasks={tasks}
                        />
                    );
                }
            });
        }


        return (
            <div>
                {columns}
                <TrashZone />
            </div>
        );
    }

}