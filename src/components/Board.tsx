import * as React from "react";
import ColumnComponent from "./ColumnComponent";
import dispatcher from "../Dispatcher";
import {Column} from "../model/column";
import TaskModel from "../model/TaskModel";
import {Priority} from "../Dispatcher";
import TrashZone from "./TrashZone";

require("./board.css");

interface BoardProps {
    model: TaskModel;
}

interface BoardState {
    columns: Array<Column|undefined>;
    boardId: string;
}

export default class Board extends React.Component<BoardProps, BoardState> {

    constructor() {
        super();
        this.state = {
            columns: [],
            boardId: ""
        };
    }

    componentWillMount() {

        dispatcher.register((actionName) => {
            switch(actionName) {
                case "addColumn":
                case "refreshAll":
                case "refreshBoard":
                    this.syncState();
                    break;
            }
        }, Priority.FIRST);

        this.syncState();
    }

    private syncState() {
        const boardId = this.props.model.getCurrentBoard();
        if (boardId !== null) {
            this.setState({
                boardId,
                columns: this.props.model.getColumnsByBoard(boardId)
            });
        }
    }

    render() {

        const columns = this.state.columns.map((column) => {
            if (column) {
                return (
                    <ColumnComponent
                        key={column.id}
                        column={column}
                        model={this.props.model}
                        boardId={this.state.boardId}
                    />
                )
            }
        });

        return (
            <div>
                {columns}
                <TrashZone />
            </div>
        );
    }

}