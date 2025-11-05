"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userPathLessPath_1 = require("../userPathLessPath");
jest.mock("vscode");
describe("userPathLessPath", () => {
    it("should replace path prefix properly for nix paths", () => {
        const a = (0, userPathLessPath_1.userPathLessPath)("/Users/test/Work/ProjectName/some/folder");
        expect(a).toBe("ProjectName/some/folder/");
    });
    it("should replace path prefix properly for windows paths", () => {
        const a = (0, userPathLessPath_1.userPathLessPath)("C:\\User\\Work\\ProjectName\\some\\folder");
        expect(a).toBe("ProjectName\\some\\folder\\");
    });
});
//# sourceMappingURL=userPathLessPath.test.js.map