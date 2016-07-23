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
initializeModel(taskModel);

const cont = document.getElementById("cont");

render(
    <div>
        <Nav model={taskModel}/>
        <Board model={taskModel} />
        <Toolbar model={taskModel} />
    </div>
, cont);

window.addEventListener("keydown", (e) => {
    const ALT_B = 66;
    if(e.altKey && e.keyCode === ALT_B) {
        BoardActions.switchBoard(taskModel.getNextBoard());
        e.preventDefault();
    }
}, false);