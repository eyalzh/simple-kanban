import * as React from "react";

interface UploadFieldProps {
    accept: string;
    onFileRead: (text: string) => void;
}

export default class TextUploadField extends React.Component<UploadFieldProps, {}> {

    constructor() {
        super();
        this.handleFiles = this.handleFiles.bind(this);
    }

    handleFiles(event: React.FormEvent<HTMLInputElement>) {
        const files = event.currentTarget.files;

        if (files) {
            const reader = new FileReader();

            reader.onerror = () => {
                console.error("could not read text from file", files[0].name);
            };

            reader.onload = () => {
                const DONE_READY_STATE = 2;
                if (reader.readyState === DONE_READY_STATE) {
                    this.props.onFileRead(reader.result);
                }
            };

            reader.readAsText(files[0]);
        }

    }

    render() {
        return (
            <input type="file" accept={this.props.accept} onChange={this.handleFiles} />
        );
    }

}