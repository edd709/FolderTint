"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpdatedPathColors = void 0;
const useConfig_1 = require("./useConfig");
const getUpdatedPathColors = (pathColor, toRemove = false) => {
    const pathColors = [...(0, useConfig_1.getPathColors)()];
    pathColor.folderPath?.forEach((pathItem) => {
        const existingPath = pathColors?.find((item) => item.folderPath === pathItem);
        if (toRemove && existingPath) {
            const index = pathColors.indexOf(existingPath);
            pathColors.splice(index, 1);
        }
        else if (existingPath) {
            existingPath.color = pathColor.color || existingPath.color;
            existingPath.badge = pathColor.badge || existingPath.badge;
            if (pathColor.nodeOnly !== undefined) {
                existingPath.nodeOnly = pathColor.nodeOnly;
            }
        }
        else {
            pathColors.push({
                folderPath: pathItem,
                ...(pathColor.color && { color: pathColor.color }),
                ...(pathColor.badge && { badge: pathColor.badge }),
                ...(pathColor.nodeOnly !== undefined && { nodeOnly: pathColor.nodeOnly }),
            });
        }
    });
    return pathColors;
};
exports.getUpdatedPathColors = getUpdatedPathColors;
//# sourceMappingURL=getUpdatedPathColors.js.map