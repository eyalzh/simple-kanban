import * as React from "react";
import {allowBinds, bind, classSet} from "../../util";
import {findDOMNode} from "react-dom";

export interface DropdownOption {
    value: string;
    label: string;
    section: string;
    data?: any;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    mapOptionToClass: (option: DropdownOption) => string;
    className: string;
    showCaret: boolean;
    placement: "left" | "right"
}

interface DropdownState {
    isOpen: boolean;
}

@allowBinds
export default class Dropdown extends React.Component<DropdownProps, DropdownState> {

    private mounted: boolean;

    constructor () {
        super();
        this.state = {
            isOpen: false
        };
        this.mounted = true;
    }

    componentDidMount() {
        document.addEventListener("click", this.handleDocumentClick, false);
    }

    componentWillUnmount() {
        this.mounted = false;
        document.removeEventListener("click", this.handleDocumentClick, false);
    }

    @bind
    handleClick() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    onSelectOption(value: string, event: React.SyntheticEvent<HTMLElement>) {

        event.stopPropagation();
        event.preventDefault();

        if (this.props.onChange) {
            this.props.onChange(value);
        }

        this.setState({isOpen: false});

    }

    renderOption(option: DropdownOption, newSection: boolean) {
        const optionClass = this.props.mapOptionToClass(option);
        const optionClasses = {
            "is-selected": option.value === this.props.value,
            "Dropdown-section-start": newSection
        };
        optionClasses[optionClass] = true;
        optionClasses[`Dropdown-option`] = true;

        const value = option.value || option.label;
        const label = option.label || option.value;

        return (
            <div
                key={value}
                className={classSet(optionClasses)}
                onClick={this.onSelectOption.bind(this, value)}>
                {label}
            </div>
        );
    }

    buildMenu() {

        const { options } = this.props;

        if (options.length === 0) {
            return <div className={`Dropdown-noresults`}>No options</div>;
        }

        let lastSection = options[0].section;
        const optionsEls = options.map((option) => {
            const newSection = lastSection !== option.section;
            lastSection = option.section;
            return this.renderOption(option, newSection);
        });

        return optionsEls;
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

        const placeHolderValue = this.props.placeholder;

        let dropdownMenuClassSet = classSet({
            ['Dropdown-menu']: true,
            ['Dropdown-left-placement']: this.props.placement === "left"
        })

        const menu = this.state.isOpen ? <div className={dropdownMenuClassSet}>{this.buildMenu()}</div> : null;

        let dropdownClassSet = classSet({
            [className]: true,
            [`Dropdown-root`]: true,
            "is-open": this.state.isOpen
        });

        return (
            <div className={dropdownClassSet}>
                <div className={`Dropdown-control`} onClick={this.handleClick}>
                    <div className={`Dropdown-placeholder`}>{placeHolderValue}</div>
                    {this.props.showCaret ? <span className={`Dropdown-arrow`} /> : null}
                </div>
                {menu}
            </div>
        );
    }
}
