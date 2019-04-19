import * as React from "react";
import dispatcher from "../../Dispatcher";
import {FullStore} from "../../stores/BoardStore";
import {Board} from "../../model/Board";
import Toolbar from "./Toolbar";
import BoardSelector from "./BoardSelector";
import * as BoardActions from "../../actions/boardActions";
import {allowBinds, bind} from "../../util";

import "./nav.css";

interface NavState {
    currentBoard: Board | null;
    boards: Array<Board> | null;
    initialized: boolean;
}

@allowBinds
export default class Nav extends React.Component<{}, NavState> {

    constructor(props) {
        super(props);
        this.state = {
            currentBoard: null,
            boards: null,
            initialized: false
        };
    }

    componentDidMount() {
        dispatcher.register((actionName, store: FullStore) => {
            switch (actionName) {
                case "refreshFull":
                    this.syncSelBoard(store);
                    break;
            }
        });
    }

    // tslint:disable-next-line
    shouldComponentUpdate(_nextProps, nextState: NavState) {
        const {currentBoard} = nextState;
        return (currentBoard === null
            || this.state.currentBoard === null
            || currentBoard.id !== this.state.currentBoard.id
            || currentBoard.name !== this.state.currentBoard.name
            || currentBoard.isArchived !== this.state.currentBoard.isArchived);
    }

    render() {

        if (! this.state.initialized) {
            return null;
        }

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

    private syncSelBoard(store: FullStore) {

        const {currentBoard, boards} = store;

        this.setState({
            currentBoard,
            boards,
            initialized: true
        });

    }

    @bind
    private changeBoard(selectedBoardId: string) {
        BoardActions.switchBoard(selectedBoardId);
    }

}
