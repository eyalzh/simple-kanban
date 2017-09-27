import { render } from "react-dom";
import * as React from "react";
import Nav from "./components/nav/Nav";
import Board from "./components/Board";
import taskModel from "./model/model";
import {setModel, setCatalog} from "./context";
import initializeModel from "./model/initializeModel";
import * as BoardActions from "./actions/boardActions";
import TemplateCatalog from "./model/Templates/TemplateCatalog";

require("./main.css");

setModel(taskModel);
setCatalog(new TemplateCatalog());

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
            </div>
            , cont);


        BoardActions.dispatchRefreshBoard();

    })

    .catch((reason) => {
       console.error("Error while initializing app", reason);
    });
