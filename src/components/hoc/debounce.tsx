import * as React from "react";
import {Component} from "react";
import * as debounce from "lodash.debounce";

interface CancellableFunction extends Function {
    cancel: () => void;
}

export function debounceRender<P>(Comp: new(props: Readonly<P>) => Component<P>, delayMs: number): new(props: Readonly<P>) => Component<P> {

    return class extends Component<P> {

        private readonly debounceUpdate: CancellableFunction;

        constructor(props: Readonly<P>) {
            super(props);

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
