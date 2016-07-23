import * as React from "react";
import TaskModel from "../model/TaskModel";
import dispatcher from "../Dispatcher";

require("./nav.css");

interface NavProps {
    model: TaskModel;
}

interface NavState {
    currentBoard: string;
}

export default class Nav extends React.Component<NavProps, NavState> {

    componentWillMount() {
        dispatcher.register((actionName) => {
            switch(actionName) {
                case "refreshBoard":
                    this.syncSelBoard();
                    break;
            }
        });
        this.syncSelBoard();
    }

    private syncSelBoard() {

        const boards = this.props.model.getBoards();
        const currentBoard = this.props.model.getCurrentBoard();

        this.setState({
            currentBoard: boards.get(currentBoard)
        })
    }

    render() {
        return (
            <div className="nav">
                Lightweight Kanban Board - {this.state.currentBoard}
            </div>
        )
    }

}