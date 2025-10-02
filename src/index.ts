/*************************************************************
 * @file				: index.ts
 * @description	: Main file for Quick Note plugin.
 * @author			: Aravind Potluri <aravindswami135@gmail.com>
 *************************************************************/

import joplin from 'api';
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import { SettingItemType, ToastType } from 'api/types';

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
    // Register settings section
    await joplin.settings.registerSection(SETTINGS.SECTION, {
      label: 'Quick Note',
      iconName: 'fas fa-file-alt',
    });

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

    // Create toolbar button
    await joplin.views.toolbarButtons.create(
      'quickNoteOpenBtn',
      COMMANDS.OPEN,
      ToolbarButtonLocation.NoteToolbar
    );

    // Load settings
    const settingsValues = await joplin.settings.values([
      SETTINGS.NOTE_ID,
      SETTINGS.OPEN_ON_STARTUP,
    ]);
    quickNoteId = String(settingsValues[SETTINGS.NOTE_ID] || '');
    openOnStartup = Boolean(settingsValues[SETTINGS.OPEN_ON_STARTUP]);

    // Auto open Quick Note if enabled
    if (quickNoteId && openOnStartup) {
      try {
        await joplin.commands.execute('openNote', quickNoteId);
      } catch (error) {
        console.error('Failed to open Quick Note on startup:', error);
      }
    }
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
  if (!quickNoteId) {
    await showToast('Quick Note is not set', ToastType.Info);
    return;
  }

  try {
    await joplin.commands.execute('openNote', quickNoteId);
  } catch (error) {
    console.error('Failed to open Quick Note:', error);
    await showToast('Failed to open Quick Note', ToastType.Error);
  }
}

/**
 * Set the currently selected note as the Quick Note
 * @returns Promise<void>
 */
async function setAsQuickNote(): Promise<void> {
  const [noteId] = await joplin.workspace.selectedNoteIds();

  if (!noteId) {
    await showToast('No note is selected', ToastType.Info);
    return;
  }

  try {
    quickNoteId = noteId;
    await joplin.settings.setValue(SETTINGS.NOTE_ID, noteId);
    await showToast('Current note is set as Quick Note', ToastType.Success);
  } catch (error) {
    console.error('Failed to set Quick Note:', error);
    await showToast('Failed to set Quick Note.', ToastType.Error);
  }
}

/**
 * Unset the Quick Note
 * @returns Promise<void>
 */
async function unsetQuickNote(): Promise<void> {
  quickNoteId = '';
  await joplin.settings.setValue(SETTINGS.NOTE_ID, '');
  await showToast('Quick Note is unset now', ToastType.Success);

}
