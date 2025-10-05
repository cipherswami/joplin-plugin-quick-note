/*************************************************************
 * @file				: index.ts
 * @description	: Main file for Quick Note plugin.
 * @author			: Aravind Potluri <aravindswami135@gmail.com>
 *************************************************************/

import joplin from 'api';
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import { SettingItemType, ToastType } from 'api/types';
import {createLogger, LogLevel} from './logger'

/**
 * Initialize logger
 * Change LogLevel here: DEBUG, INFO, WARN, ERROR, or NONE
 */
const logger = createLogger('[QuickNote]', LogLevel.ERROR);

/**
 * Global plugin state
 */
const PLUGIN_ID = 'quickNote';
const SETTINGS = {
  SECTION: `${PLUGIN_ID}.settings`,
  NOTE_ID: 'noteId',
  OPEN_ON_STARTUP: 'openOnStartup',
} as const;
const COMMANDS = {
  OPEN: `${PLUGIN_ID}.open`,
  SET: `${PLUGIN_ID}.set`,
  UNSET: `${PLUGIN_ID}.unset`,
} as const;
let quickNoteId: string = '';
let openOnStartup: boolean = false;

/**
 * Plugin registration
 */
joplin.plugins.register({
  onStart: async function () {
    logger.info('Plugin initialization started');

    try {
      // Register settings section
      await joplin.settings.registerSection(SETTINGS.SECTION, {
        label: 'Quick Note',
        iconName: 'fas fa-file-alt',
      });
      logger.debug('Settings section registered successfully');

      // Register settings
      await joplin.settings.registerSettings({
        [SETTINGS.OPEN_ON_STARTUP]: {
          value: true,
          type: SettingItemType.Bool,
          section: SETTINGS.SECTION,
          public: true,
          label: 'Open on Startup',
          description: 'Automatically open the Quick Note when Joplin starts.',
        },
        [SETTINGS.NOTE_ID]: {
          value: '',
          type: SettingItemType.String,
          section: SETTINGS.SECTION,
          public: true,
          label: 'Quick Note ID',
          description: 'Enter the note ID here to set it as Quick note.',
        },
      });
      logger.debug('Settings registered successfully');

      // Register commands
      await joplin.commands.register({
        name: COMMANDS.OPEN,
        label: 'Open Quick Note',
        iconName: 'fas fa-file-alt',
        execute: openQuickNote,
      });

      await joplin.commands.register({
        name: COMMANDS.SET,
        label: 'Set as Quick Note',
        iconName: 'fas fa-check',
        execute: setAsQuickNote,
      });

      await joplin.commands.register({
        name: COMMANDS.UNSET,
        label: 'Unset Quick Note',
        iconName: 'fas fa-times',
        execute: unsetQuickNote,
      });
      logger.debug('Commands registered successfully');

      // Create Quick Note menu
      await joplin.views.menus.create(
        'quickNoteMenu',
        'Quick Note',
        [
          { commandName: COMMANDS.SET },
          { commandName: COMMANDS.UNSET },
          { commandName: COMMANDS.OPEN, accelerator: 'Alt+Q' },
        ],
        MenuItemLocation.Tools
      );
      logger.debug('Menu created successfully');

      // Create toolbar button
      await joplin.views.toolbarButtons.create(
        'quickNoteOpenBtn',
        COMMANDS.OPEN,
        ToolbarButtonLocation.NoteToolbar
      );
      logger.debug('Toolbar button created successfully');

      // Load settings
      const settingsValues = await joplin.settings.values([
        SETTINGS.NOTE_ID,
        SETTINGS.OPEN_ON_STARTUP,
      ]);
      quickNoteId = String(settingsValues[SETTINGS.NOTE_ID] || '');
      openOnStartup = Boolean(settingsValues[SETTINGS.OPEN_ON_STARTUP]);
      logger.info('Settings loaded', { quickNoteId, openOnStartup });

      // Auto open Quick Note if enabled
      if (quickNoteId && openOnStartup) {
        logger.debug('Attempting to open Quick Note on startup');
        try {
          await joplin.commands.execute('openNote', quickNoteId);
          logger.info('Quick Note opened on startup');
        } catch (error) {
          logger.error('Failed to open Quick Note on startup', error);
        }
      }

      logger.info('Plugin initialization completed successfully');
    } catch (error) {
      logger.error('Plugin initialization failed', error);
      throw error;
    }

    // Event Listeners
    await joplin.settings.onChange(async (event) => {
      logger.debug('Settings change detected', event);

      if (event.keys.includes(SETTINGS.NOTE_ID) || event.keys.includes(SETTINGS.OPEN_ON_STARTUP)) {
        const settingsValues = await joplin.settings.values([
          SETTINGS.NOTE_ID,
          SETTINGS.OPEN_ON_STARTUP,
        ]);
        quickNoteId = String(settingsValues[SETTINGS.NOTE_ID] || '');
        openOnStartup = Boolean(settingsValues[SETTINGS.OPEN_ON_STARTUP]);
        logger.info('Settings updated', { quickNoteId, openOnStartup });
      }
    });
  },
});

/**
 * Display a toast message
 * @param message The message to show
 * @param type Toast type (Info, Success, Error)
 * @returns Promise<void>
 */
async function showToast(message: string, type: ToastType = ToastType.Info): Promise<void> {
  await joplin.views.dialogs.showToast({ message, type });
}

/**
 * Open the currently set Quick Note
 * @returns Promise<void>
 */
async function openQuickNote(): Promise<void> {
  logger.debug('openQuickNote command invoked');
  
  if (!quickNoteId) {
    logger.warn('Quick Note ID is not set');
    await showToast('Quick Note is not set', ToastType.Info);
    return;
  }

  try {
    logger.debug(`Opening Quick Note with ID: ${quickNoteId}`);
    await joplin.commands.execute('openNote', quickNoteId);
    logger.info('Quick Note opened successfully');
  } catch (error) {
    logger.error('Failed to open Quick Note', error);
    await showToast('Failed to open Quick Note', ToastType.Error);
  }
}

/**
 * Set the currently selected note as the Quick Note
 * @returns Promise<void>
 */
async function setAsQuickNote(): Promise<void> {
  logger.debug('setAsQuickNote command invoked');
  
  const [noteId] = await joplin.workspace.selectedNoteIds();

  if (!noteId) {
    logger.warn('No note selected for setting as Quick Note');
    await showToast('No note is selected', ToastType.Info);
    return;
  }

  try {
    logger.debug(`Setting note as Quick Note: ${noteId}`);
    quickNoteId = noteId;
    await joplin.settings.setValue(SETTINGS.NOTE_ID, noteId);
    logger.info('Quick Note set successfully', { noteId });
    await showToast('Current note is set as Quick Note', ToastType.Success);
  } catch (error) {
    logger.error('Failed to set Quick Note', error);
    await showToast('Failed to set Quick Note.', ToastType.Error);
  }
}

/**
 * Unset the Quick Note
 * @returns Promise<void>
 */
async function unsetQuickNote(): Promise<void> {
  logger.debug('unsetQuickNote command invoked');
  
  try {
    const previousId = quickNoteId;
    quickNoteId = '';
    await joplin.settings.setValue(SETTINGS.NOTE_ID, '');
    logger.info('Quick Note unset successfully', { previousId });
    await showToast('Quick Note is unset now', ToastType.Success);
  } catch (error) {
    logger.error('Failed to unset Quick Note', error);
    await showToast('Failed to unset Quick Note', ToastType.Error);
  }
}