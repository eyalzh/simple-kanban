import {
    CounterText,
    parseTaskTitle,
    RegularText,
    TagText
} from "../src/components/annotations/AnnotationParser";
import {expect} from "chai";

describe("annotation parser", function() {

    it("should parse correctly regular text as a single RegularText part", () => {

        const text = "this is a regular text";

        const parts = parseTaskTitle(text);

        expect(parts).to.eql([{
            component: RegularText,
            text: "this is a regular text"
        }]);

    });

    it("should parse correctly regular text with a counter in the end as 2 parts", () => {

        const text = "text with counter #1";

        const parts = parseTaskTitle(text);

        expect(parts).to.eql(
            [
            {
                component: RegularText,
                text: "text with counter "
            },
            {
                component: CounterText,
                text: "#1"
            }
            ]
        );

    });

    it("should parse correctly regular text with a counter in the middle as 3 parts", () => {

        const text = "text with counter #1 in the middle";

        const parts = parseTaskTitle(text);

        expect(parts).to.eql(
            [
                {
                    component: RegularText,
                    text: "text with counter "
                },
                {
                    component: CounterText,
                    text: "#1"
                },
                {
                    component: RegularText,
                    text: " in the middle"
                },
            ]
        );

    });

    it("should parse correctly regular text with a counter and link", () => {

        const text = "foo #1 bar baz";

        const parts = parseTaskTitle(text);

        expect(parts).to.eql(
            [
                {component: RegularText, text: "foo "},
                {component: CounterText, text: "#1"},
                {component: RegularText, text: " bar baz"}
            ]
        );

    });

    it("should parse correctly text with tags", () => {

        const text = "some text with #tag in it";

        const parts = parseTaskTitle(text);

        expect(parts).to.eql(
            [
                {component: RegularText, text: "some text with "},
                {component: TagText, text: "#tag"},
                {component: RegularText, text: " in it"},
            ]
        );

    });

});
