import * as React from "react";
import dispatcher from "../../Dispatcher";
import {BoardStore} from "../../stores/BoardStore";
import {Board} from "../../model/Board";
import Toolbar from "./Toolbar";
import BoardSelector from "./BoardSelector";
import * as BoardActions from "../../actions/boardActions";
import {allowBinds, bind} from "../../util";

require("./nav.css");

interface NavState {
    currentBoard: Board | null;
    boards: Array<Board> | null;
}

@allowBinds
export default class Nav extends React.Component<{}, NavState> {

    constructor() {
        super();
        this.state = {
            currentBoard: null,
            boards: null
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

        const {currentBoard, boards} = store;

        this.setState({
            currentBoard,
            boards
        });

    }

    render() {

        return (
            <div className="nav">
                <BoardSelector
                    boards={this.state.boards}
                    currentBoard={this.state.currentBoard}
                    changeBoard={this.changeBoard}/>
                <Toolbar
                    currentBoard={this.state.currentBoard}
                />
            </div>
        );

    }

    @bind
    private changeBoard(selectedBoardId: string) {
        BoardActions.switchBoard(selectedBoardId);
    }

}