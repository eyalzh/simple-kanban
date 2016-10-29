import * as React from "react";
import dispatcher from "../Dispatcher";
import {BoardStore} from "../stores/BoardStore";

require("./nav.css");

interface NavState {
    currentBoard: string | null;
}

export default class Nav extends React.Component<{}, NavState> {

    constructor() {
        super();
        this.state = {
            currentBoard: null
        };
    }

    componentWillMount() {
        dispatcher.register((actionName, store) => {
            switch (actionName) {
                case "refreshBoard":
                    this.syncSelBoard(store);
                    break;
            }
        });
    }

    private syncSelBoard(store: BoardStore) {

        const boards = store.boards;
        const currentBoard = store.currentBoard;
        let currentBoardName: string|null = null;

        if (currentBoard !== null) {
            const boardName = boards.get(currentBoard);
            if (typeof boardName !== "undefined") {
                currentBoardName = boardName;
            }
        }

        this.setState({
            currentBoard: currentBoardName
        });

    }

    render() {

        let currentBoardIndication = "";
        if (this.state.currentBoard !== null) {
            currentBoardIndication = `- ${this.state.currentBoard}`;
        }

        return (
            <div className="nav">
                Lightweight Kanban Board {currentBoardIndication}
            </div>
        );

    }

}