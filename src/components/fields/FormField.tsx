import * as React from "react";

require("./fields.css");

interface FormFieldProps {
    caption: string;
    children: any;
}

export default function FormField(props: FormFieldProps) {

    const {caption} = props;

    return (
        <div className="form-field-container">
            <div className="form-field-caption">{caption}</div>
            <div className="form-field">{props.children}</div>
        </div>
    );

}