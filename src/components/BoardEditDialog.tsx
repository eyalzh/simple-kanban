import * as React from "react";
import {getCatalog} from "../context";
import {Template} from "../model/Templates/Template";
const Modal = require("react-modal");

interface BoardEditDialogProps {
    isBeingEdited: boolean;
    onEditClose: React.MouseEventHandler;
    onRemoveBoard: Function;
    onEditSubmitted: (boardName: string, selectedTemplate: Template | undefined) => void;
    boardId?: string | null;
    boardName?: string;
}

interface BoardEditDialogState {
    name: string;
    selectedTemplate: string | undefined;
}

export default class BoardEditDialog extends React.Component<BoardEditDialogProps, BoardEditDialogState> {

    private fieldInput: HTMLInputElement;

    constructor() {
        super();

        const catalog = getCatalog();

        this.state = {
            name: "",
            selectedTemplate: catalog.getTemplates()[0].getName()
        };
    }

    componentWillReceiveProps(props: BoardEditDialogProps) {

        if (typeof props.boardName !== "undefined" && props.boardId !== null) {
            this.state.name = props.boardName;
        } else {
            this.state.name = "";
        }

        this.setState(this.state);
    }

    render() {

        let title;
        let removeBtn;
        let templatesBox = <span />;
        if (this.props.boardId !== null) {
            title = "Edit Board";
            removeBtn = (
                <button className="remove-btn" onClick={e => this.onRemoveBoard()}>Remove board</button>
            );
        } else {
            title = "Add Board";
            removeBtn = <span />; // <div> cannot be a descendant of <p>
            const catalog = getCatalog();
            templatesBox = (
                <div>
                    <p>Template</p>
                    <p><select onChange={e => this.onSelectTemplate(e)} value={this.state.selectedTemplate}>{
                        catalog.getTemplates().map((template, i) => (
                            <option key={i} value={template.getName()}>{template.getName()}</option>
                        ))
                    }</select>
                    </p>
                </div>
            );
        }

        let buttons = (
            <p>
                <button onClick={e => this.onEditSubmitted()}>Submit</button>&nbsp;
                <button onClick={this.props.onEditClose}>Cancel</button>&nbsp;
                {removeBtn}
            </p>
        );

        return (
            <Modal
                isOpen={this.props.isBeingEdited}
                onRequestClose={this.props.onEditClose}
                onAfterOpen={this.onEditDialogOpen.bind(this)}
                contentLabel="Edit Board Dialog">

                <h1>{title}</h1>
                <p>
                    Board name
                </p>
                <p>
                    <input
                        value={this.state.name}
                        onChange={this.onNameChange.bind(this)}
                        ref={(input) => {this.fieldInput = input;}}
                        onKeyPress={this.onKeyPressed.bind(this)} />
                </p>
                {templatesBox}

                {buttons}

            </Modal>
        );
    }

    private onKeyPressed(ev: React.KeyboardEvent) {
        if (ev.key === "Enter") {
            this.onEditSubmitted();
        }
    }

    private onNameChange(e: React.FormEvent) {
        const name = (e.target as HTMLInputElement).value;
        this.state.name = name;
        this.setState(this.state);
    }

    private onEditSubmitted() {

        let template: Template | undefined;
        if (this.state.selectedTemplate) {
            template = getCatalog().getTemplateByName(this.state.selectedTemplate);
        }
        this.props.onEditSubmitted(this.state.name, template);
    }

    private onRemoveBoard() {
        this.props.onRemoveBoard();
    }

    private onEditDialogOpen() {
        this.fieldInput.focus();
    }

    private onSelectTemplate(e: React.FormEvent) {
        const templateName = (e.target as HTMLInputElement).value;
        this.state.selectedTemplate = templateName;
        this.setState(this.state);
    }
}