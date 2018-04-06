import {calcColorBasedOnBackground} from "../src/util";
import {expect} from "chai";
import "mocha";

describe("util", function() {

    it("calcColorBasedOnBackground should return white for a dark background", function() {

        const darkGrey = "#333333";
        const color = calcColorBasedOnBackground(darkGrey);
        expect(color).to.eql("#fff");

    });

    it("calcColorBasedOnBackground should throw an Error on color strings which are not 7 characters", function() {

        const grey = "#999"; // same as #999999

        const fn = function() {
            calcColorBasedOnBackground(grey);
        };

        expect(fn).to.throw(Error);

    });

    it("calcColorBasedOnBackground should return black for a light background", function() {

        const lightYellow = "#d9e18f";
        const color = calcColorBasedOnBackground(lightYellow);
        expect(color).to.eql("#000");

    });

});
