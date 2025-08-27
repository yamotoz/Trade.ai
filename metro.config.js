const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Suporte a SVG
config.resolver.assetExts.push('svg');
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Suporte a NativeWind
config.resolver.sourceExts.push('cjs');

module.exports = config;
