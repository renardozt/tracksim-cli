import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { GAMES, DIRS } from './constants.js';

const isWin = os.platform() === 'win32';
const homeDirectory = os.homedir();

const STEAM_PATHS = [
  path.join(homeDirectory, '.local', 'share', 'Steam'),
  path.join(homeDirectory, '.steam', 'steam'),
  path.join(homeDirectory, '.steam', 'root'),
  path.join(homeDirectory, '.var', 'app', 'com.valvesoftware.Steam', '.local', 'share', 'Steam'), // Flatpak
  'C:\\Program Files (x86)\\Steam',
  'C:\\Program Files\\Steam',
  'D:\\Steam',
  'E:\\Steam'
];

/**
 * Searches for Steam library folders defined in libraryfolders.vdf.
 * @returns {string[]} An array of paths to Steam libraries.
 */
function findSteamLibraryPaths() {
  const libraries = [];
  for (const steamPath of STEAM_PATHS) {
    const vdfPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
    if (fs.existsSync(vdfPath)) {
      const vdfContent = fs.readFileSync(vdfPath, 'utf-8');
      const lines = vdfContent.split('\n');
      
      let currentPath = null;
      for (const line of lines) {
        const pathMatch = line.match(/"path"\s+"([^"]+)"/);
        if (pathMatch) {
          currentPath = pathMatch[1];
        }
        
        // Find apps block and track paths containing known game app ids
        if (currentPath && (line.includes(`"${GAMES.ets2.appId}"`) || line.includes(`"${GAMES.ats.appId}"`))) {
           if (!libraries.includes(currentPath)) {
              libraries.push(currentPath);
           }
        }
      }
    }
  }
  return libraries;
}

/**
 * Auto-detects the data directory and prefix directory for a given game.
 * @param {string} gameId The ID of the game ('ets2' or 'ats').
 * @returns {{dataDir: string, prefixDir: string|null}|null} The paths, or null if not found.
 */
export function detectGamePaths(gameId) {
  const game = GAMES[gameId];
  if (!game) return null;

  if (!isWin) {
    // 1. Check for truckersmp-cli native paths
    const truckersmpDataDir = path.join(homeDirectory, '.local', 'share', 'truckersmp-cli', game.name, 'data');
    const truckersmpPrefixDir = path.join(homeDirectory, '.local', 'share', 'truckersmp-cli', game.name, 'prefix', 'pfx');
    
    if (fs.existsSync(truckersmpDataDir) && fs.existsSync(truckersmpPrefixDir)) {
      console.log(chalk.green(`✓ Auto-detected truckersmp-cli environment for ${game.name}.`));
      return {
        dataDir: truckersmpDataDir,
        prefixDir: truckersmpPrefixDir
      };
    }
  }

  // 2. Fallback to Steam auto-detection
  const libraries = findSteamLibraryPaths();
  for (const lib of libraries) {
    const manifestPath = path.join(lib, 'steamapps', `appmanifest_${game.appId}.acf`);
    if (fs.existsSync(manifestPath)) {
      return {
        dataDir: path.join(lib, 'steamapps', 'common', game.name),
        prefixDir: isWin ? null : path.join(lib, 'steamapps', 'compatdata', game.appId, 'pfx')
      };
    }
  }
  
  return null;
}

/**
 * Resolves the configuration setup required for a game command.
 * Merges manual CLI options, stored configurations, and auto-detection.
 * @param {string} gameId 'ets2' or 'ats'
 * @param {Object} options CLI options from commander
 * @param {Object} configurationData Data loaded from config.json
 * @returns {{game: Object, dataDir: string, prefixDir: string|null, isWin: boolean}}
 */
export function resolveGameSetup(gameId, options, configurationData) {
  const game = GAMES[gameId];
  if (!game) {
    throw new Error(`Invalid game specified: ${gameId}. Available options are: ets2, ats`);
  }

  let dataDir = options.gameDir;
  let prefixDir = options.prefixDir;
  const needsPrefix = !isWin;

  // Attempt to use stored configuration if options aren't fully provided
  if (!dataDir || (needsPrefix && !prefixDir)) {
    if (configurationData.games && configurationData.games[gameId]) {
      dataDir = dataDir || configurationData.games[gameId].dataDir;
      if (needsPrefix) {
        prefixDir = prefixDir || configurationData.games[gameId].prefixDir;
      }
    }
  }

  // Attempt auto-detection if still lacking required paths
  let autoDetected = false;
  if (!dataDir || (needsPrefix && !prefixDir)) {
    console.log(chalk.blueBright(`Attempting to auto-detect ${game.name} paths from Steam...`));
    const detectedPaths = detectGamePaths(gameId);
    if (detectedPaths) {
      dataDir = dataDir || detectedPaths.dataDir;
      if (needsPrefix) {
        prefixDir = prefixDir || detectedPaths.prefixDir;
      }
      autoDetected = true;
      console.log(chalk.green('✓ Auto-detected Steam installation.'));
    } else {
      throw new Error(`Could not auto-detect ${game.name}. Please specify --game-dir${needsPrefix ? ' and --prefix-dir' : ''} manually.`);
    }
  }

  return { game, dataDir, prefixDir, isWin, autoDetected };
}

/**
 * Returns the target plugins directory for a given game data directory.
 */
export function getPluginsDirectory(dataDir) {
  return path.join(dataDir, ...DIRS.PLUGINS_BASE);
}

/**
 * Returns the target ProgramData TrackSim directory based on the OS and prefix.
 */
export function getProgramDataDirectory(prefixDir) {
  return isWin 
    ? path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', DIRS.TRACKSIM)
    : path.join(prefixDir, DIRS.DRIVE_C, DIRS.PROGRAM_DATA, DIRS.TRACKSIM);
}
