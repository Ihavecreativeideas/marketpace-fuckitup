const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript paths
config.resolver.alias = {
  '@': path.resolve(__dirname, 'client/src'),
  '@shared': path.resolve(__dirname, 'shared'),
};

// Enable symlinks
config.resolver.symlinks = false;

// Add server and shared directories to watchFolders
config.watchFolders = [
  path.resolve(__dirname, 'server'),
  path.resolve(__dirname, 'shared'),
  path.resolve(__dirname, 'client'),
];

// Platform-specific resolver for web compatibility
config.resolver.platforms = ['web', 'ios', 'android'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Block problematic native modules on web
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.blockList = [
    /@stripe\/stripe-react-native/,
  ];
}

module.exports = config;
