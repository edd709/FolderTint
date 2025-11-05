import * as vscode from "vscode";
import emoji from "./lists/emoji.json";
import {
  checkIfItFirstTimeRun,
  getColorOptions,
  getPathColors,
  getUpdatedPathColors,
  updateConfigPathColors,
  userPathLessPath,
} from "./utils";
import { PathsColors } from "./types";

let colorDisposable: vscode.Disposable;
let styleClipboard: { color?: string; badge?: string } | null = null;

const colorize = () => {
  if (colorDisposable) {
    colorDisposable.dispose();
  }

  let pathColors = getPathColors();

  let provider: vscode.FileDecorationProvider = {
    provideFileDecoration: (
      uri: vscode.Uri,
      _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FileDecoration> => {
      const projectPath = userPathLessPath(uri.fsPath);

      const matchingPaths = pathColors
        .filter((item) => {
          if (item.nodeOnly) {
            return projectPath === item.folderPath;
          } else {
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

const changeConfig = (pathColor: Partial<PathsColors>, toRemove = false) => {
  const pathColors = getUpdatedPathColors(pathColor, toRemove);
  updateConfigPathColors(pathColors);
  colorize();
};

const registerContextMenu = (context: vscode.ExtensionContext) => {
  let setColorDisposable = vscode.commands.registerCommand(
    "folder-tint.applyTint",
    (_, context2: vscode.Uri[]) => {
      const options = getColorOptions(context);

      vscode.window
        .showQuickPick(options, {
          placeHolder: "Choose a color: ",
        })
        .then((selected) => {
          if (!selected) {
            return;
          }

          changeConfig({
            folderPath: context2.map((item) => userPathLessPath(item.fsPath)),
            color: selected.id,
          });
        });
    }
  );

  let setColorNodeDisposable = vscode.commands.registerCommand(
    "folder-tint.applyTintNode",
    (_, context2: vscode.Uri[]) => {
      const options = getColorOptions(context);

      vscode.window
        .showQuickPick(options, {
          placeHolder: "Choose a node color: ",
        })
        .then((selected) => {
          if (!selected) {
            return;
          }

          changeConfig({
            folderPath: context2.map((item) => userPathLessPath(item.fsPath)),
            color: selected.id,
            nodeOnly: true,
          });
        });
    }
  );

  let setBadgeDisposable = vscode.commands.registerCommand(
    "folder-tint.apllyLabel",
    function (_, context2: vscode.Uri[]) {
      vscode.window
        .showInputBox({
          prompt: "Set folder badge",
          placeHolder: "WS",
          validateInput: (text: string): string | null => {
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
            folderPath: context2.map((item) => userPathLessPath(item.fsPath)),
            badge: value,
          });
        });
    }
  );

  let setEmojiBadgeDisposable = vscode.commands.registerCommand(
    "folder-tint.applyIcon",
    function (_, context2: vscode.Uri[]) {
      vscode.window
        .showQuickPick(
          emoji.map(({ description, emoji }) => ({
            label: emoji,
            description,
          })),
          {
            placeHolder: "Choose emoji badge: ",
          }
        )
        .then((selected) => {
          if (!selected) {
            return;
          }

          changeConfig({
            folderPath: context2.map((item) => userPathLessPath(item.fsPath)),
            badge: selected.label,
          });
        });
    }
  );

  let copyStyleDisposable = vscode.commands.registerCommand(
    "folder-tint.copyStyle",
    function (_, context2: vscode.Uri[]) {
      if (context2.length === 0) {
        vscode.window.showWarningMessage("No folder selected to copy style from.");
        return;
      }

      const selectedPath = userPathLessPath(context2[0].fsPath);
      const pathColors = getPathColors();
      
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
    }
  );

  let pasteStyleDisposable = vscode.commands.registerCommand(
    "folder-tint.pasteStyle",
    function (_, context2: vscode.Uri[]) {
      if (!styleClipboard) {
        vscode.window.showWarningMessage("No style in clipboard. Copy a style first.");
        return;
      }

      const config: Partial<PathsColors> = {
        folderPath: context2.map((item) => userPathLessPath(item.fsPath))
      };

      if (styleClipboard.color) {
        config.color = styleClipboard.color;
      }
      if (styleClipboard.badge) {
        config.badge = styleClipboard.badge;
      }

      changeConfig(config);
      vscode.window.showInformationMessage("Style pasted successfully!");
    }
  );

  let clearColorizerDisposable = vscode.commands.registerCommand(
    "folder-tint.resetChanges",
    function (_, context2: vscode.Uri[]) {
      vscode.window;

      changeConfig(
        {
          folderPath: context2.map((item) => userPathLessPath(item.fsPath)),
        },
        true
      );
    }
  );

  context.subscriptions.push(setColorDisposable);
  context.subscriptions.push(setColorNodeDisposable);
  context.subscriptions.push(setBadgeDisposable);
  context.subscriptions.push(setEmojiBadgeDisposable);
  context.subscriptions.push(copyStyleDisposable);
  context.subscriptions.push(pasteStyleDisposable);
  context.subscriptions.push(clearColorizerDisposable);
};

export function activate(context: vscode.ExtensionContext) {
  checkIfItFirstTimeRun(context);
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

export function deactivate() {}
