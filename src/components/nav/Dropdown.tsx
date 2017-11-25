import * as React from "react";
import {allowBinds, bind, classSet} from "../../util";
import {findDOMNode} from "react-dom";

export interface DropdownOption {
    value: string;
    label: string;
    data: any;
}

interface DropdownProps {
    options: DropdownOption[];
    value: any;
    placeholder: string;
    onChange: (option: DropdownOption) => void;
    mapOptionToClass: (option: DropdownOption) => string;
    className: string;
}

interface DropdownState {
    selected: DropdownOption;
    isOpen: boolean;
}

@allowBinds
export default class Dropdown extends React.Component<DropdownProps, DropdownState> {

    private mounted: boolean;

    constructor (props) {
        super(props);
        this.state = {
            selected: props.value || {
                label: props.placeholder,
                value: ""
            },
            isOpen: false
        };
        this.mounted = true;
    }

    componentWillReceiveProps (newProps) {
        if (newProps.value && newProps.value !== this.state.selected) {
            this.setState({selected: newProps.value});
        } else if (!newProps.value) {
            this.setState({selected: {
                label: newProps.placeholder,
                value: "",
                data: {}
            }});
        }
    }

    componentDidMount() {
        document.addEventListener("click", this.handleDocumentClick, false);
        document.addEventListener("touchend", this.handleDocumentClick, false);
    }

    componentWillUnmount() {
        this.mounted = false;
        document.removeEventListener("click", this.handleDocumentClick, false);
        document.removeEventListener("touchend", this.handleDocumentClick, false);
    }

    @bind
    handleMouseDown(event) {

        if (event.type === "mousedown" && event.button !== 0) return;

        event.stopPropagation();
        event.preventDefault();

        this.setState({
            isOpen: !this.state.isOpen
        });

    }

    setValue (value, label, data) {
        let newState = {
            selected: {
                value,
                label,
                data
            },
            isOpen: false
        };
        this.fireChangeEvent(newState);
        this.setState(newState);
    }

    @bind
    fireChangeEvent (newState) {
        if (newState.selected !== this.state.selected && this.props.onChange) {
            this.props.onChange(newState.selected);
        }
    }

    renderOption (option) {
        const optionClass = this.props.mapOptionToClass(option);
        const optionClasses = {
            "is-selected": option.value === this.state.selected.value
        };
        optionClasses[optionClass] = true;
        optionClasses[`Dropdown-option`] = true;

        const value = option.value || option.label;
        const label = option.label || option.value;
        const data = option.data;

        return (
            <div
                key={value}
                className={classSet(optionClasses)}
                onMouseDown={this.setValue.bind(this, value, label, data)}
                onClick={this.setValue.bind(this, value, label, data)}>
                {label}
            </div>
        );
    }

    buildMenu () {
        let { options } = this.props;
        let ops = options.map((option) => {
            return this.renderOption(option);
        });

        return ops.length ? ops : <div className={`Dropdown-noresults`}>No options found</div>;
    }

    @bind
    handleDocumentClick (event) {
        if (this.mounted) {
            if (!findDOMNode(this).contains(event.target)) {
                if (this.state.isOpen) {
                    this.setState({ isOpen: false });
                }
            }
        }
    }

    render () {
        const {className} = this.props;

        const placeHolderValue = this.state.selected.label;
        const menu = this.state.isOpen ? <div className={`Dropdown-menu`}>{this.buildMenu()}</div> : null;

        let dropdownClass = classSet({
            [className]: true,
            [`Dropdown-root`]: true,
            "is-open": this.state.isOpen
        });

        return (
            <div className={dropdownClass}>
                <div className={`Dropdown-control`} onMouseDown={this.handleMouseDown} onTouchEnd={this.handleMouseDown}>
                    <div className={`Dropdown-placeholder`}>{placeHolderValue}</div>
                    <span className={`Dropdown-arrow`} />
                </div>
                {menu}
            </div>
        );
    }
}
