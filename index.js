#!/usr/bin/env node

import { Command } from 'commander';
import { createRequire } from 'module';
import installCommand from './src/commands/install.js';
import uninstallCommand from './src/commands/uninstall.js';

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

const program = new Command();

program
  .name('tracksim-linux')
  .description('Native Tracksim integration and management tool for Linux (TruckersMP)')
  .version(`v${version}`);

program
  .command('install')
  .description('Downloads Tracksim and installs it into the TruckersMP Wine prefix')
  .action(installCommand);

program
  .command('uninstall')
  .description('Removes Tracksim from the TruckersMP Wine prefix')
  .action(uninstallCommand);

program.parse(process.argv);