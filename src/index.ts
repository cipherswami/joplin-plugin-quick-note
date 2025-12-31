/*************************************************************
 * @file				: index.ts
 * @description	: Joplin plugin to quickly jot down notes.
 * @author			: Aravind Potluri <aravindswami135@gmail.com>
 *************************************************************/

/**
 * Imports
 */
import joplin from "api";
import {
  MenuItemLocation,
  SettingStorage,
  ToolbarButtonLocation,
} from "api/types";
import { SettingItemType, ToastType } from "api/types";
import { createLogger, LogLevel } from "./logger";

/**
 * Global Constants
 */
export const PLUGIN_ID = "QuickNote";
export const LOG_LEVEL = LogLevel.INFO;
export const SETTINGS_SECTION = {
  MAIN: `${PLUGIN_ID}.settings`,
};
export const SETTINGS_MAIN = {
  QUICK_NOTE_ID: `${SETTINGS_SECTION.MAIN}.quickNoteId`,
  OPEN_ON_STARTUP: `${SETTINGS_SECTION.MAIN}.openOnStartup`,
};
export const COMMANDS = {
  OPEN: `${PLUGIN_ID}.open`,
  SET: `${PLUGIN_ID}.set`,
  UNSET: `${PLUGIN_ID}.unset`,
};
export const INTERACTIONS = {
  TOOLBAR: `${PLUGIN_ID}.toolbar`,
  MENU: `${PLUGIN_ID}.menu`,
};

/**
 * Global Vars
 */
let settingOptions = {
  quickNoteId: "",
  openOnStartup: true,
};

/**
 * Initialize logger
 * Change LogLevel here: DEBUG, INFO, WARN, ERROR, or NONE
 */
const logger = createLogger(`[${PLUGIN_ID}]`, LOG_LEVEL);

/**
 * Plugin registration
 */
joplin.plugins.register({
  onStart: async function () {
    try {
      // Register settings section
      await joplin.settings.registerSection(SETTINGS_SECTION.MAIN, {
        label: "Quick Note",
        iconName: "fas fa-sticky-note",
      });

      // Register settings
      await joplin.settings.registerSettings({
        [SETTINGS_MAIN.OPEN_ON_STARTUP]: {
          value: true,
          type: SettingItemType.Bool,
          section: SETTINGS_SECTION.MAIN,
          public: true,
          label: "Open on Startup",
          description: "Automatically open the Quick Note when Joplin starts.",
        },
        [SETTINGS_MAIN.QUICK_NOTE_ID]: {
          value: "",
          type: SettingItemType.String,
          section: SETTINGS_SECTION.MAIN,
          public: true,
          label: "Quick Note ID",
          description: "Enter the note ID here to set it as Quick note.",
        },
      });

      // Register commands
      await joplin.commands.register({
        name: COMMANDS.OPEN,
        label: "Open Quick Note",
        iconName: "fas fa-sticky-note",
        execute: openQuickNote,
      });

      await joplin.commands.register({
        name: COMMANDS.SET,
        label: "Set as Quick Note",
        iconName: "fas fa-check",
        execute: setAsQuickNote,
      });

      await joplin.commands.register({
        name: COMMANDS.UNSET,
        label: "Unset Quick Note",
        iconName: "fas fa-times",
        execute: unsetQuickNote,
      });

      // Create menu options
      await joplin.views.menus.create(
        INTERACTIONS.MENU,
        "Quick Note",
        [
          { commandName: COMMANDS.SET },
          { commandName: COMMANDS.UNSET },
          { commandName: COMMANDS.OPEN, accelerator: "Alt+Q" },
        ],
        MenuItemLocation.Tools
      );

      // Create toolbar button
      await joplin.views.toolbarButtons.create(
        INTERACTIONS.TOOLBAR,
        COMMANDS.OPEN,
        ToolbarButtonLocation.NoteToolbar
      );

      logger.info("Plugin started successfully");
    } catch (error) {
      logger.error("Plugin failed to start", error);
      throw error;
    }

    // Load settings
    await fetchSettings();

    // Auto open Quick Note if enabled
    if (settingOptions.quickNoteId && settingOptions.openOnStartup) {
      logger.debug("Attempting to open Quick Note on startup");
      setTimeout(async () => {
        await joplin.commands.execute("openNote", settingOptions.quickNoteId);
        logger.info("Quick Note Opened on startup");
      }, 500);
    }

    // Event Listeners
    await joplin.settings.onChange(async (event) => {
      fetchSettings();
    });
  },
});

/**
 * Updates the settings
 * @returns Promise<void>
 */
async function fetchSettings(): Promise<void> {
  logger.debug("fetchSettings invoked");
  const settingsValues = await joplin.settings.values([
    SETTINGS_MAIN.QUICK_NOTE_ID,
    SETTINGS_MAIN.OPEN_ON_STARTUP,
  ]);
  settingOptions = {
    quickNoteId: settingsValues[SETTINGS_MAIN.QUICK_NOTE_ID] as string,
    openOnStartup: settingsValues[SETTINGS_MAIN.OPEN_ON_STARTUP] as boolean,
  };

  logger.debug("Settings:", {
    StartUp: settingOptions.openOnStartup,
    QuickNoteID: settingOptions.quickNoteId,
  });
}

/**
 * Display a toast message
 * @param message The message to show
 * @param type Toast type (Info, Success, Error)
 * @returns Promise<void>
 */
async function showToast(
  message: string,
  type: ToastType = ToastType.Info
): Promise<void> {
  await joplin.views.dialogs.showToast({ message, type });
}

/**
 * Open the currently set Quick Note
 * @returns Promise<void>
 */
async function openQuickNote(): Promise<void> {
  logger.debug("openQuickNote command invoked");

  if (!settingOptions.quickNoteId) {
    logger.warn("Quick Note ID is not set");
    await showToast("Quick Note is not set", ToastType.Info);
    return;
  }

  try {
    await joplin.commands.execute("openNote", settingOptions.quickNoteId);
    logger.info("Quick Note opened");
  } catch (error) {
    logger.error("Failed to open Quick Note", error);
    await showToast("Failed to open Quick Note", ToastType.Error);
  }
}

/**
 * Set the currently selected note as the Quick Note
 * @returns Promise<void>
 */
async function setAsQuickNote(): Promise<void> {
  logger.debug("setAsQuickNote command invoked");

  const [noteId] = await joplin.workspace.selectedNoteIds();

  if (!noteId) {
    logger.warn("No note selected for setting as Quick Note");
    await showToast("No note is selected", ToastType.Info);
    return;
  }

  try {
    settingOptions.quickNoteId = noteId;
    await joplin.settings.setValue(SETTINGS_MAIN.QUICK_NOTE_ID, noteId);
    logger.info("Quick Note set successfully", { noteId });
    await showToast("Current note is set as Quick Note", ToastType.Success);
  } catch (error) {
    logger.error("Failed to set Quick Note", error);
    await showToast("Failed to set Quick Note.", ToastType.Error);
  }
}

/**
 * Unset the Quick Note
 * @returns Promise<void>
 */
async function unsetQuickNote(): Promise<void> {
  logger.debug("unsetQuickNote command invoked");

  try {
    const previousId = settingOptions.quickNoteId;
    settingOptions.quickNoteId = "";
    await joplin.settings.setValue(SETTINGS_MAIN.QUICK_NOTE_ID, "");
    logger.info("Quick Note unset successfully", { previousId });
    await showToast("Quick Note is unset now", ToastType.Success);
  } catch (error) {
    logger.error("Failed to unset Quick Note", error);
    await showToast("Failed to unset Quick Note", ToastType.Error);
  }
}
