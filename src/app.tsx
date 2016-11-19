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

taskModel.init()

    .then(() => {
        return initializeModel(taskModel);
    })

    .then(() => {

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

    })

    .then(() => {
        window.addEventListener("keydown", (e) => {
            const B_KEY = 66;
            if (e.altKey && e.keyCode === B_KEY) {
                taskModel.getNextBoard()
                    .then((nextBoard) => {
                        if (nextBoard !== null) {
                            BoardActions.switchBoard(nextBoard.id);
                        }
                    });
                e.preventDefault();
            }
        }, false);
    })

    .catch((reason) => {
       console.error("Error while initializing app", reason);
    });
