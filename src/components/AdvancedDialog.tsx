import * as React from "react";
import * as Modal from "react-modal";
import * as BoardActions from "../actions/boardActions";

interface AdvancedDialogProps {
    isOpened: boolean;
    onClosed: () => void;
}

export default class AdvancedDialog extends React.Component<AdvancedDialogProps, {}> {

    constructor() {
        super();
        this.resetAllDataClicked = this.resetAllDataClicked.bind(this);
        this.exportDB = this.exportDB.bind(this);
    }

    render() {

        const title = "Advanced Options";

        return (
            <Modal isOpen={this.props.isOpened}
                   onRequestClose={this.props.onClosed}
                   contentLabel={title}>

                <div>
                    <h1>{title}</h1>

                    <div className="subtitle">Data Storage</div>
                    <div className="button-row">
                        <button onClick={this.exportDB}>Export DB (TBD)</button>
                        <button className="remove-btn" onClick={this.resetAllDataClicked}>Reset all data</button>
                    </div>
                </div>

            </Modal>
        );

    }

    private resetAllDataClicked() {
        if (window.confirm("Wait, are you sure you want to reset ALL data?")) {
            BoardActions.clear();
        }
    }

    private exportDB() {
        BoardActions.dumpDB();
    }

}