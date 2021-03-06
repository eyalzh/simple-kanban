import * as React from "react";
import {actionModalStyle} from "./dialogModalStyle";
import * as Modal from "react-modal";
import {ReactElement} from "react";

interface DialogProps {
    opened: boolean;
    onRequestClose: () => void;
    onOpen: () => void;

    title: string;
    buttons: ReactElement;
    info: ReactElement | null;

}

export default class ActionDialog extends React.Component<DialogProps> {

    render() {
        return (
            <Modal
                isOpen={this.props.opened}
                onRequestClose={this.props.onRequestClose}
                onAfterOpen={this.props.onOpen}
                style={actionModalStyle}>

                <div className="dialog-title">
                    {this.props.title}
                </div>

                <div className="dialog-main-container">
                    {this.props.children}
                </div>

                <div className="dialog-buttons-bar">
                    {this.props.buttons}
                    {this.props.info}
                </div>

            </Modal>
        );
    }

}
