"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorOptions = void 0;
const getIconPath_1 = require("./getIconPath");
const colors_json_1 = __importDefault(require("../lists/colors.json"));
const getColorOptions = (context) => {
    return colors_json_1.default.map(({ id, description, defaults }) => ({
        label: description,
        id: id,
        iconPath: (0, getIconPath_1.getIconPath)(context, defaults.dark),
    }));
};
exports.getColorOptions = getColorOptions;
//# sourceMappingURL=getColorOptions.js.map