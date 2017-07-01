import * as React from 'react';
import {DragEvent, Component} from "react";

export interface Referrable {
    innerRef?: (instance: HTMLElement | null) => any;
    internalInnerRef?: (instance: HTMLElement) => any;
}

export interface DraggableProps {
    type: string;
    data: object;
}

interface DragContext {
    type: string;
    data: object;
}

let dragContext: DragContext | null = null;

export function draggable<P>(Comp: new() => Component<P & Referrable, {}>): new() => Component<P & DraggableProps, {}> {

    return class extends Component<P & DraggableProps & Referrable, {}> {

        constructor() {
            super();
            this.onRefUpdate = this.onRefUpdate.bind(this);
        }

        onRefUpdate(node: HTMLElement | null) {
            if (node) {
                node.draggable = true;
                node.ondragstart = this.dragStart.bind(this);
                if (this.props.innerRef) {
                    this.props.innerRef(node);
                }
            }
        }

        render () {
            const { innerRef, ...newProps } = this.props as any;
            return <Comp innerRef={this.onRefUpdate} {...newProps}/>
        }

        private dragStart(e: DragEvent<HTMLElement>) {
            const {type, data} = this.props;
            const clonedContextData = Object.assign({}, data);
            dragContext = {type, data: clonedContextData};
            e.dataTransfer.setData("text/plain", ""); // We don't use dataTransfer, but firefox requires it
            e.stopPropagation();
        }
    };

}

interface DroppableInterface {
    onDrop: (type: string, data: any) => void;
    filterTypeFunc?: (type: string, data: any) => boolean;
}

export function droppable<P>(Comp: new() => Component<P & Referrable, {}>): new() => Component<P & DroppableInterface, {}> {

    return class extends Component<P & DroppableInterface & Referrable, {}> {

        constructor() {
            super();
            this.onRefUpdate = this.onRefUpdate.bind(this);
        }

        onRefUpdate(node: HTMLElement | null) {
            if (node) {
                node.ondrop = this.onDrop.bind(this);
                node.ondragover = this.onDragOver.bind(this);
                if (this.props.innerRef) {
                    this.props.innerRef(node);
                }
            }
        }

        render() {
            const { innerRef, ...newProps } = this.props as any;
            return (
                <Comp innerRef={this.onRefUpdate} {...newProps} />
            )
        }

        private onDrop() {

            const context = dragContext;

            if (context === null) {
                throw new Error("could not drop entity - context is not set");
            }

            this.props.onDrop(context.type, context.data);

        }

        private onDragOver(e: React.DragEvent<HTMLElement>) {

            const context = dragContext;

            if (context !== null) {
                const {type, data} = context;

                if (! this.props.filterTypeFunc || this.props.filterTypeFunc(type, data)) {
                    e.preventDefault();
                }
            }

        }

    }

}
