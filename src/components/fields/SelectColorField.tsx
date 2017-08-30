import * as React from "react";

require("./fields.css");

interface SelectColorFieldProps {
    value: string;
    onChange: (color: string) => void;
}

export default class SelectColorField extends React.Component<SelectColorFieldProps, {}> {

    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    private onChange(ev: React.FormEvent<HTMLInputElement>) {
        const value = ev.currentTarget.value;
        this.props.onChange(value);
    }

    render() {
        return <input
            className="select-color-field"
            value={this.props.value}
            onChange={this.onChange}
            type="color" />;
    }

}