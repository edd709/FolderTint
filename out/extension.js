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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const emoji_json_1 = __importDefault(require("./lists/emoji.json"));
const utils_1 = require("./utils");
let colorDisposable;
let styleClipboard = null;
const colorize = () => {
    if (colorDisposable) {
        colorDisposable.dispose();
    }
    let pathColors = (0, utils_1.getPathColors)();
    let provider = {
        provideFileDecoration: (uri, _token) => {
            const projectPath = (0, utils_1.userPathLessPath)(uri.fsPath);
            const matchingPaths = pathColors
                .filter((item) => {
                if (item.nodeOnly) {
                    return projectPath === item.folderPath;
                }
                else {
                    return projectPath.includes(item.folderPath);
                }
            })
                .sort((a, b) => b.folderPath.length - a.folderPath.length);
            const bestFit = matchingPaths[0];
            const bestFitColor = matchingPaths.find((item) => item.color)?.color;
            const bestFitBadge = matchingPaths.find((item) => item.badge)?.badge;
            const newColor = bestFitColor
                ? new vscode.ThemeColor(bestFitColor)
                : undefined;
            const newBadge = bestFitBadge ? bestFitBadge : undefined;
            if (bestFit) {
                return new vscode.FileDecoration(newBadge, "", newColor);
            }
            return new vscode.FileDecoration();
        },
    };
    colorDisposable = vscode.window.registerFileDecorationProvider(provider);
};
const changeConfig = (pathColor, toRemove = false) => {
    const pathColors = (0, utils_1.getUpdatedPathColors)(pathColor, toRemove);
    (0, utils_1.updateConfigPathColors)(pathColors);
    colorize();
};
const registerContextMenu = (context) => {
    let setColorDisposable = vscode.commands.registerCommand("folder-tint.applyTint", (_, context2) => {
        const options = (0, utils_1.getColorOptions)(context);
        vscode.window
            .showQuickPick(options, {
            placeHolder: "Choose a color: ",
        })
            .then((selected) => {
            if (!selected) {
                return;
            }
            changeConfig({
                folderPath: context2.map((item) => (0, utils_1.userPathLessPath)(item.fsPath)),
                color: selected.id,
            });
        });
    });
    let setColorNodeDisposable = vscode.commands.registerCommand("folder-tint.applyTintNode", (_, context2) => {
        const options = (0, utils_1.getColorOptions)(context);
        vscode.window
            .showQuickPick(options, {
            placeHolder: "Choose a node color: ",
        })
            .then((selected) => {
            if (!selected) {
                return;
            }
            changeConfig({
                folderPath: context2.map((item) => (0, utils_1.userPathLessPath)(item.fsPath)),
                color: selected.id,
                nodeOnly: true,
            });
        });
    });
    let setBadgeDisposable = vscode.commands.registerCommand("folder-tint.apllyLabel", function (_, context2) {
        vscode.window
            .showInputBox({
            prompt: "Set folder badge",
            placeHolder: "WS",
            validateInput: (text) => {
                if (text.length > 2) {
                    return "Must be no more than 2 symbols";
                }
                return null;
            },
        })
            .then((value) => {
            if (!value) {
                return;
            }
            changeConfig({
                folderPath: context2.map((item) => (0, utils_1.userPathLessPath)(item.fsPath)),
                badge: value,
            });
        });
    });
    let setEmojiBadgeDisposable = vscode.commands.registerCommand("folder-tint.applyIcon", function (_, context2) {
        vscode.window
            .showQuickPick(emoji_json_1.default.map(({ description, emoji }) => ({
            label: emoji,
            description,
        })), {
            placeHolder: "Choose emoji badge: ",
        })
            .then((selected) => {
            if (!selected) {
                return;
            }
            changeConfig({
                folderPath: context2.map((item) => (0, utils_1.userPathLessPath)(item.fsPath)),
                badge: selected.label,
            });
        });
    });
    let copyStyleDisposable = vscode.commands.registerCommand("folder-tint.copyStyle", function (_, context2) {
        if (context2.length === 0) {
            vscode.window.showWarningMessage("No folder selected to copy style from.");
            return;
        }
        const selectedPath = (0, utils_1.userPathLessPath)(context2[0].fsPath);
        const pathColors = (0, utils_1.getPathColors)();
        const matchingPaths = pathColors
            .filter((item) => selectedPath.includes(item.folderPath))
            .sort((a, b) => b.folderPath.length - a.folderPath.length);
        const bestFit = matchingPaths[0];
        if (!bestFit || (!bestFit.color && !bestFit.badge)) {
            vscode.window.showInformationMessage("No style found to copy from this folder.");
            return;
        }
        styleClipboard = {
            color: bestFit.color,
            badge: bestFit.badge
        };
        vscode.window.showInformationMessage("Style copied to clipboard!");
    });
    let pasteStyleDisposable = vscode.commands.registerCommand("folder-tint.pasteStyle", function (_, context2) {
        if (!styleClipboard) {
            vscode.window.showWarningMessage("No style in clipboard. Copy a style first.");
            return;
        }
        const config = {
            folderPath: context2.map((item) => (0, utils_1.userPathLessPath)(item.fsPath))
        };
        if (styleClipboard.color) {
            config.color = styleClipboard.color;
        }
        if (styleClipboard.badge) {
            config.badge = styleClipboard.badge;
        }
        changeConfig(config);
        vscode.window.showInformationMessage("Style pasted successfully!");
    });
    let clearColorizerDisposable = vscode.commands.registerCommand("folder-tint.resetChanges", function (_, context2) {
        vscode.window;
        changeConfig({
            folderPath: context2.map((item) => (0, utils_1.userPathLessPath)(item.fsPath)),
        }, true);
    });
    context.subscriptions.push(setColorDisposable);
    context.subscriptions.push(setColorNodeDisposable);
    context.subscriptions.push(setBadgeDisposable);
    context.subscriptions.push(setEmojiBadgeDisposable);
    context.subscriptions.push(copyStyleDisposable);
    context.subscriptions.push(pasteStyleDisposable);
    context.subscriptions.push(clearColorizerDisposable);
};
function activate(context) {
    (0, utils_1.checkIfItFirstTimeRun)(context);
    const workspace = vscode?.workspace?.workspaceFolders?.[0];
    if (!workspace) {
        return;
    }
    registerContextMenu(context);
    colorize();
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("folder-color.pathColors")) {
            colorize();
        }
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map