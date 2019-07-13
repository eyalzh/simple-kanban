import * as React from "react";
import {classSet} from "../../util";

interface FormFieldProps {
    caption: string;
    direction?: "row" | "column";
    children: any;
}

export default function FormField(props: FormFieldProps) {

    const {caption} = props;

    const classes = classSet({
        "form-field-container": true,
        "form-field-direction-column": props.direction === "column"
    });

    return (
        <div className={classes}>
            <div className="form-field-caption">{caption}</div>
            <div className="form-field">{props.children}</div>
        </div>
    );

}
