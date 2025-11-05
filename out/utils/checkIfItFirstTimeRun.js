"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfItFirstTimeRun = void 0;
const vscode = __importStar(require("vscode"));
function checkIfItFirstTimeRun(context) {
    const firstTimeRunFlag = "FOLDER_TINT_FIRST_RUN";
    if (context.globalState.get(firstTimeRunFlag, true)) {
        vscode.window
            .showInformationMessage("To activate folder colors feature in VSCode, please reload the editor now.", "Reload")
            .then((selection) => {
            if (selection === "Reload") {
                vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
        });
        context.globalState.update(firstTimeRunFlag, false);
    }
}
exports.checkIfItFirstTimeRun = checkIfItFirstTimeRun;
//# sourceMappingURL=checkIfItFirstTimeRun.js.map