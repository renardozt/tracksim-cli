#!/usr/bin/env node

import { Command } from 'commander';
import { createRequire } from 'module';
import installCommand from './src/commands/install.js';
import uninstallCommand from './src/commands/uninstall.js';

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

const program = new Command();

program
  .name('tracksim-cli')
  .description('Native Tracksim integration and management CLI tool')
  .version(`v${version}`);

program
  .command('install <game>')
  .description('Downloads Tracksim and installs it into the specified game (ets2 or ats)')
  .option('--game-dir <path>', 'Manually specify the game data directory')
  .option('--prefix-dir <path>', 'Manually specify the game Proton prefix directory')
  .action(installCommand);

program
  .command('uninstall <game>')
  .description('Removes Tracksim from the specified game (ets2 or ats)')
  .option('--game-dir <path>', 'Manually specify the game data directory')
  .option('--prefix-dir <path>', 'Manually specify the game Proton prefix directory')
  .action(uninstallCommand);

program.parse(process.argv);