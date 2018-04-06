import * as React from "react";
import {Component} from "react";
import * as debounce from "lodash.debounce";

interface CancellableFunction extends Function {
    cancel: () => void;
}

export function debounceRender<P>(Comp: new() => Component<P, {}>, delayMs: number): new() => Component<P, {}> {

    return class extends Component<P, {}> {

        private debounceUpdate: CancellableFunction;

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

        componentWillUnmount() {
            this.debounceUpdate.cancel();
        }

        render() {
            return <Comp {...this.props} />;
        }

    };

}
