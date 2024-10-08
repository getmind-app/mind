// @ts-nocheck
// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

// Create the default Metro config
const config = getDefaultConfig(projectRoot);

if (!config.resolver) {
    throw new Error("Cannot find resolver config");
}

if (!config.resolver.sourceExts) {
    throw new Error("Cannot find resolver config");
}

// Add the additional `cjs` extension to the resolver
config.resolver.sourceExts.push("cjs");
config.resolver.assetExts = [...config.resolver.assetExts, "ttf", "otf"];

// https://github.com/expo/expo/issues/21568
config.resolver.assetExts = [...config.resolver.assetExts, "ttf", "otf"];

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
];
// https://github.com/expo/expo/issues/19870
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
