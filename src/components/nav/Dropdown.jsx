"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var util_1 = require("../../util");
var Dropdown = /** @class */ (function (_super) {
    __extends(Dropdown, _super);
    function Dropdown(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            selected: props.value || {
                label: props.placeholder,
                value: ''
            },
            isOpen: false
        };
        _this.mounted = true;
        return _this;
    }
    Dropdown.prototype.componentWillReceiveProps = function (newProps) {
        if (newProps.value && newProps.value !== this.state.selected) {
            this.setState({ selected: newProps.value });
        }
        else if (!newProps.value) {
            this.setState({ selected: {
                    label: newProps.placeholder,
                    value: ''
                } });
        }
    };
    Dropdown.prototype.componentDidMount = function () {
        document.addEventListener('click', this.handleDocumentClick, false);
        document.addEventListener('touchend', this.handleDocumentClick, false);
    };
    Dropdown.prototype.componentWillUnmount = function () {
        this.mounted = false;
        document.removeEventListener('click', this.handleDocumentClick, false);
        document.removeEventListener('touchend', this.handleDocumentClick, false);
    };
    Dropdown.prototype.handleMouseDown = function (event) {
        if (this.props.onFocus && typeof this.props.onFocus === 'function') {
            this.props.onFocus(this.state.isOpen);
        }
        if (event.type === 'mousedown' && event.button !== 0)
            return;
        event.stopPropagation();
        event.preventDefault();
        if (!this.props.disabled) {
            this.setState({
                isOpen: !this.state.isOpen
            });
        }
    };
    Dropdown.prototype.setValue = function (value, label) {
        var newState = {
            selected: {
                value: value,
                label: label
            },
            isOpen: false
        };
        this.fireChangeEvent(newState);
        this.setState(newState);
    };
    Dropdown.prototype.fireChangeEvent = function (newState) {
        if (newState.selected !== this.state.selected && this.props.onChange) {
            this.props.onChange(newState.selected);
        }
    };
    Dropdown.prototype.renderOption = function (option) {
        var optionClass = util_1.classSet((_a = {},
            _a[this.props.baseClassName + "-option"] = true,
            _a['is-selected'] = option === this.state.selected,
            _a));
        var value = option.value || option.label || option;
        var label = option.label || option.value || option;
        return (<div key={value} className={optionClass} onMouseDown={this.setValue.bind(this, value, label)} onClick={this.setValue.bind(this, value, label)}>
                {label}
            </div>);
        var _a;
    };
    Dropdown.prototype.buildMenu = function () {
        var _this = this;
        var _a = this.props, options = _a.options, baseClassName = _a.baseClassName;
        var ops = options.map(function (option) {
            if (option.type === 'group') {
                var groupTitle = (<div className={baseClassName + "-title"}>{option.name}</div>);
                var _options = option.items.map(function (item) { return _this.renderOption(item); });
                return (<div className={baseClassName + "-group"} key={option.name}>
                        {groupTitle}
                        {_options}
                    </div>);
            }
            else {
                return _this.renderOption(option);
            }
        });
        return ops.length ? ops : <div className={baseClassName + "-noresults"}>No options found</div>;
    };
    Dropdown.prototype.handleDocumentClick = function (event) {
        if (this.mounted) {
            if (!ReactDOM.findDOMNode(this).contains(event.target)) {
                if (this.state.isOpen) {
                    this.setState({ isOpen: false });
                }
            }
        }
    };
    Dropdown.prototype.render = function () {
        var _a = this.props, baseClassName = _a.baseClassName, className = _a.className;
        var disabledClass = this.props.disabled ? 'Dropdown-disabled' : '';
        var placeHolderValue = typeof this.state.selected === 'string' ? this.state.selected : this.state.selected.label;
        var value = (<div className={baseClassName + "-placeholder"}>{placeHolderValue}</div>);
        var menu = this.state.isOpen ? <div className={baseClassName + "-menu"}>{this.buildMenu()}</div> : null;
        var dropdownClass = classNames((_b = {},
            _b[className] = true,
            _b[baseClassName + "-root"] = true,
            _b['is-open'] = this.state.isOpen,
            _b));
        return (<div className={dropdownClass}>
                <div className={baseClassName + "-control " + disabledClass} onMouseDown={this.handleMouseDown.bind(this)} onTouchEnd={this.handleMouseDown.bind(this)}>
                    {value}
                    <span className={baseClassName + "-arrow"}/>
                </div>
                {menu}
            </div>);
        var _b;
    };
    __decorate([
        util_1.bind
    ], Dropdown.prototype, "handleMouseDown", null);
    __decorate([
        util_1.bind
    ], Dropdown.prototype, "fireChangeEvent", null);
    __decorate([
        util_1.bind
    ], Dropdown.prototype, "handleDocumentClick", null);
    return Dropdown;
}(React.Component));
Dropdown.defaultProps = { baseClassName: 'Dropdown' };
exports.default = Dropdown;
