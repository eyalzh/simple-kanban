import * as React from "react";
import * as Modal from "react-modal";
import * as BoardActions from "../../actions/boardActions";
import TabbedOptions from "../tabs/TabbedOptions";
import Tab from "../tabs/Tab";
import {dialogModalStyle} from "./dialogModalStyle";
import TextUploadField from "../fields/TextUploadField";
import {allowBinds, bind} from "../../util";
import TutorialTemplate from "../../model/Templates/TutorialTemplate";
import DownloadLink from "../fields/DownloadLink";
import {modelExporter} from "../../model/model";

interface OptionsDialogProps {
    opened: boolean;
    onClosed: () => void;
    onFileImport: (text: string) => void;
}

interface OptionsDialogState {
    activeTab: string;
    downloadLinkCreated: boolean;
}

@allowBinds
export default class OptionsDialog extends React.Component<OptionsDialogProps, OptionsDialogState> {

    constructor() {
        super();
        this.state = {
            activeTab: "import-export",
            downloadLinkCreated: false
        };
    }

    render() {

        const title = "General Options";
        let downloadLink: JSX.Element | null = null;

        if (this.state.downloadLinkCreated) {

            const dataProvider = async () => {
                const data = await modelExporter.export();
                return JSON.stringify(data);
            };

            downloadLink = (
                <DownloadLink
                    label="click here to download the export file"
                    fileNamePrefix="kanban_export"
                    dataProvider={dataProvider}/>
            );

        }

        return (
            <Modal isOpen={this.props.opened}
                   onRequestClose={this.props.onClosed}
                   style={dialogModalStyle}
                   contentLabel={title}>

                <div>
                    <h1>{title}</h1>

                    <TabbedOptions activeTab={this.state.activeTab} onTabChange={this.onTabChange}>

                        <Tab id="import-export" name="import/export">
                            <div className="sub-section">
                                <div className="sub-section-title">Import from JSON file</div>
                                <TextUploadField accept=".json" onFileRead={this.onImportFileRead} />
                            </div>
                            <div className="sub-section">
                                <div className="sub-section-title">Export data to JSON</div>
                                <button onClick={this.showDownloadLink}>Create export link</button>
                                <div className="export-link">
                                    {downloadLink}
                                </div>

                            </div>
                        </Tab>

                        <Tab id="data-storage" name="data storage">
                            <div className="sub-section">
                                <div className="sub-section-title">Data Management</div>
                                <button className="remove-btn" onClick={this.resetAllDataClicked}>Reset all data</button>
                            </div>
                        </Tab>

                        <Tab id="tutorial" name="tutorial">
                            <div className="sub-section">
                                <div className="sub-section-title">Tutorial</div>
                                <button onClick={this.onAddTutorialBoard}>Add tutorial board</button>
                            </div>
                        </Tab>

                        <Tab  id="about" name="about">
                            <div className="section-title">About</div>
                            <p>
                                For more info about this project,
                                please see the <a href="https://github.com/eyalzh/simple-kanban" target="_blank">github page</a>
                            </p>
                        </Tab>

                    </TabbedOptions>

                </div>

            </Modal>
        );

    }

    @bind
    private resetAllDataClicked() {
        if (window.confirm("Wait, are you sure you want to reset ALL data?")) {
            BoardActions.clear();
        }
    }

    @bind
    private onTabChange(tabId) {
        this.setState({activeTab: tabId});
    }

    @bind
    private onImportFileRead(text) {
        this.props.onFileImport(text);
    }

    @bind
    private onAddTutorialBoard() {
        BoardActions.addBoard("Tutorial", new TutorialTemplate());
        this.props.onClosed();
    }

    @bind
    private showDownloadLink() {
        this.setState({downloadLinkCreated: true});
    }

}
