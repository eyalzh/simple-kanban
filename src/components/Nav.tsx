import * as React from "react";
import dispatcher from "../Dispatcher";
import {BoardStore} from "../stores/BoardStore";

require("./nav.css");

interface NavState {
    currentBoard: string;
}

export default class Nav extends React.Component<{}, NavState> {

    constructor() {
        super();
        this.state = {
            currentBoard: ""
        };
    }

    componentWillMount() {
        dispatcher.register((actionName, store) => {
            switch(actionName) {
                case "refreshBoard":
                    this.syncSelBoard(store);
                    break;
            }
        });
    }

    private syncSelBoard(store: BoardStore) {

        const boards = store.boards;
        const currentBoard = store.currentBoard;

        if (currentBoard !== null) {
            const boardName = boards.get(currentBoard);
            if (typeof boardName !== "undefined") {
                this.setState({
                    currentBoard: boardName
                });
            }
        }

    }

    render() {
        return (
            <div className="nav">
                Lightweight Kanban Board - {this.state.currentBoard}
            </div>
        )
    }

}