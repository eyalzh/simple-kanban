import { render } from "react-dom";
import * as React from "react";
import Nav from "./components/Nav";
import Board from "./components/Board";
import Toolbar from "./components/Toolbar";
import taskModel from "./model/model";
import {setModel} from "./context";
import initializeModel from "./model/initializeModel";
import * as BoardActions from "./actions/boardActions";

require("./main.css");

setModel(taskModel);
initializeModel(taskModel).then(() => {

    const cont = document.getElementById("cont");

    if (cont === null) {
        throw new Error("Could not find main container element.");
    }

    render(
        <div>
            <Nav />
            <Board  />
            <Toolbar />
        </div>
        , cont);


    BoardActions.dispatchRefreshBoard();

});

window.addEventListener("keydown", (e) => {
    const ALT_B = 66;
    if(e.altKey && e.keyCode === ALT_B) {
        taskModel.getNextBoard()
            .then((nextBoard) => {
                if (nextBoard !== null) {
                    BoardActions.switchBoard(nextBoard);
                }
            });
        e.preventDefault();
    }
}, false);