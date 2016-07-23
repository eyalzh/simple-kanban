import {expect} from "chai";
import {Dispatcher, Priority} from "../src/Dispatcher";

describe("dispatcher", function () {

    it("should boardcast all registered functions when an event is fired", function () {

        let func1Called = false;
        let func2Called = false;
        const dispatcher = new Dispatcher();

        dispatcher.register(function () {
            func1Called = true;
        });

        dispatcher.register(function () {
            func2Called = true;
        });

        dispatcher.dispatch("foo", {});

        expect(func1Called).to.eql(true);
        expect(func2Called).to.eql(true);

    });

    it("should broadcast the event based on priority", function () {

        let callOrder = [];
        const dispatcher = new Dispatcher();

        dispatcher.register(function () {
            callOrder.push(1);
        }, Priority.LAST);

        dispatcher.register(function () {
            callOrder.push(2);
        }, Priority.FIRST);

        dispatcher.dispatch("foo", {});

        expect(callOrder).to.deep.equal([2, 1]);

    });

    it("removeListener should remove the callback and not call it on the next dispatch", function () {

        const dispatcher = new Dispatcher();
        let funcCalled = false;

        const fn = function () {
            funcCalled = true;
        };

        dispatcher.register(fn);
        dispatcher.removeListener(fn);

        dispatcher.dispatch("foo", {});

        expect(funcCalled).to.eql(false);

    });

    it("removeListener should only remove the callback specified and still call other callbacks", function () {

        const dispatcher = new Dispatcher();
        let funcCalled = false;
        let otherFuncCalled = false;

        const fnToBeRemoved = function () {
            funcCalled = true;
        };

        const someOtherFn = function () {
            otherFuncCalled = true;
        };

        dispatcher.register(fnToBeRemoved);
        dispatcher.register(someOtherFn);
        dispatcher.removeListener(fnToBeRemoved);

        dispatcher.dispatch("foo", {});

        expect(funcCalled).to.equal(false);
        expect(otherFuncCalled).to.equal(true);

    });

    it("should still dispatch a callback after removing a different callback (complex scenario)", function () {

        const dispatcher = new Dispatcher();
        let firstCount = 0;
        let secondCount = 0;

        const firstFn = function () {
            firstCount++;
        };

        const secondFn = function () {
            secondCount++;
        };

        dispatcher.register(firstFn, Priority.FIRST);
        dispatcher.register(secondFn);

        dispatcher.dispatch("foo", {});
        dispatcher.removeListener(secondFn);
        dispatcher.dispatch("foo", {});

        expect(firstCount).to.equal(2);
        expect(secondCount).to.equal(1);

    });


});
