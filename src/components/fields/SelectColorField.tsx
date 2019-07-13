import * as React from "react";
import {allowBinds, bind} from "../../util";

interface SelectColorFieldProps {
    value?: string;
    onChange: (color: string) => void;
}

@allowBinds
export default class SelectColorField extends React.Component<SelectColorFieldProps> {

    render() {
        return <input
            className="select-color-field"
            value={this.props.value}
            onChange={this.onChange}
            type="color" />;
    }

    @bind
    private onChange(ev: React.FormEvent<HTMLInputElement>) {
        const value = ev.currentTarget.value;
        this.props.onChange(value);
    }

}
