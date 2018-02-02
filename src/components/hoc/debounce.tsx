import * as React from "react";
import {Component} from "react";
import {debounce} from "lodash";

export function debounceRender<P>(Comp: new() => Component<P, {}>, delayMs: number): new() => Component<P, {}> {

    return class extends Component<P, {}> {

        private debounceUpdate: Function;

        constructor() {
            super();

            this.debounceUpdate = debounce(() => {
                this.forceUpdate();
            }, delayMs);
        }

        componentWillReceiveProps() {
            this.debounceUpdate();
        }

        shouldComponentUpdate() {
            return false;
        }

        render() {
            return <Comp {...this.props} />;
        }

    };

}