type Callback = (actionName: string, actionPayload: any) => void;

export enum Priority {FIRST = 0, LAST = 1}

export class Dispatcher {

    private readonly fns: Array<Array<Callback>> = [];

    constructor() {
        this.fns[Priority.FIRST] = [];
        this.fns[Priority.LAST] = [];
    }

    register(callback: Callback, priority: Priority = Priority.LAST) {
        this.fns[priority].push(callback);
    }

    dispatch(actionName: string, actionPayload: any) {
        []
            .concat.apply([], this.fns)
            .forEach(fn => fn.call(this, actionName, actionPayload));
    }

    removeListener(fn: Callback) {
        this.fns.forEach(callbackList => {
            const fnIdx = callbackList.findIndex(f => f === fn);
            if (fnIdx !== -1) {
                callbackList.splice(fnIdx, 1);
            }
        });
    }

}

const dispatcher = new Dispatcher();
export default dispatcher;
