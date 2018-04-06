import * as React from "react";
import {getCatalog} from "../../context";
import {Template} from "../../model/Templates/Template";
import * as Modal from "react-modal";
import {dialogContainerStyle, dialogModalStyle} from "./dialogModalStyle";
import {allowBinds, bind} from "../../util";
import {Board} from "../../model/Board";

interface BoardEditDialogProps {
    opened: boolean;
    onEditClose: () => void;
    onRemoveBoard: () => void;
    onEditSubmitted: (boardName: string, selectedTemplate: Template | undefined, isArchived: boolean) => void;
    board?: Board | null;
}

interface BoardEditDialogState {
    name: string;
    selectedTemplate: string | undefined;
    isArchived: boolean;
}

@allowBinds
export default class BoardEditDialog extends React.Component<BoardEditDialogProps, BoardEditDialogState> {

    private fieldInput: HTMLInputElement | null = null;

    constructor(props) {
        super(props);

        const catalog = getCatalog();

        this.state = {
            name: "",
            selectedTemplate: catalog.getTemplates()[0].getName(),
            isArchived: false
        };
    }

    componentWillReceiveProps(props: BoardEditDialogProps) {

        let name = "", isArchived: boolean = false;

        if (props.board) {
            name = props.board.name;
            isArchived = !!props.board.isArchived;
        }

        this.setState({name, isArchived});
    }

    render() {

        let title;

        let templatesBox: JSX.Element | null = null;
        let archivedCheckbox: JSX.Element | null = null;

        if (this.props.board) {
            title = "Edit Board";
            archivedCheckbox = (
                <div className="archived-section">
                    <input
                        type="checkbox"
                        id="is-archived"
                        onChange={this.onIsActiveChanged}
                        checked={this.state.isArchived} />
                    <label htmlFor="is-archived">Archived?</label>
                </div>
            );

        } else {
            title = "Add Board";
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

        const buttons = (
            <p>
                <button onClick={this.onEditSubmitted}>Submit</button>&nbsp;
                <button onClick={this.props.onEditClose}>Cancel</button>&nbsp;
            </p>
        );

        return (
            <Modal
                isOpen={this.props.opened}
                onRequestClose={this.props.onEditClose}
                onAfterOpen={this.onEditDialogOpen}
                style={dialogModalStyle}
                contentLabel="Edit Board Dialog">

                <div style={dialogContainerStyle}>

                    <h1>{title}</h1>
                    <p>
                        Board name
                    </p>
                    <p>
                        <input
                            value={this.state.name}
                            onChange={this.onNameChange}
                            ref={(input) => { this.fieldInput = input; }}
                            onKeyPress={this.onKeyPressed} />
                    </p>

                    {templatesBox}
                    {archivedCheckbox}

                    {buttons}

                </div>

            </Modal>
        );
    }

    @bind
    private onKeyPressed(ev: React.KeyboardEvent<HTMLElement>) {
        if (ev.key === "Enter") {
            this.onEditSubmitted();
        }
    }

    @bind
    private onNameChange(e: React.FormEvent<HTMLInputElement>) {
        const name = e.currentTarget.value;
        this.setState({name});
    }

    @bind
    private onIsActiveChanged(e: React.FormEvent<HTMLInputElement>) {
        this.setState({isArchived: e.currentTarget.checked});
    }

    @bind
    private onEditSubmitted() {

        let template: Template | undefined;
        if (this.state.selectedTemplate) {
            template = getCatalog().getTemplateByName(this.state.selectedTemplate);
        }
        this.props.onEditSubmitted(this.state.name, template, this.state.isArchived);
    }

    @bind
    private onEditDialogOpen() {
        if (this.fieldInput) {
            this.fieldInput.focus();
        }
    }

    private onSelectTemplate(e: React.FormEvent<HTMLElement>) {
        const selectedTemplate = (e.target as HTMLInputElement).value;
        this.setState({selectedTemplate});
    }
}
