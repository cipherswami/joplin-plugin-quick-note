# Quick Note

Quick Note is joplin plugin which allows you to instantly open a dedicated note for capturing ideas, tasks, or reminders — either on startup or via a customizable keyboard shortcut.

<link rel="icon" type="image/x-icon" href="docs/assets/icon-32.png">

<div align=center>
  <p>Capture ideas instantly with a dedicated Quick Note.</p>
</div>

## Features

- Open a Quick Note on Joplin startup.
- Set any note as your Quick Note.
- Open Quick Note anytime with **Alt+Q** (customizable shortcut).
- Toolbar button for one-click access.
- Easily unset the Quick Note when no longer needed.

## Installation

There are two ways to install Quick Note:

### **Joplin Market Place**

- Open Joplin → Tools → Options → Plugins → `Search`.
- Search for **Quick Note** and install directly.

### **Build from source**

- Clone the repositroy:

  ```bash
  git clone https://github.com/cipherswami/joplin-plugin-quick-note.git
  ```

- Install dependencies:

  ```bash
    npm install
  ```

* Generate the plugin package (`.jpl` will be created in the `publish/` directory):

  ```bash
  npm run dist
  ```

* In Joplin, go to **Tools → Options → Plugins → Install from file**, then select the generated `.jpl` to install it.

## Usage

1. Select a note → **Tools → Quick Note → Set as Quick Note**.
2. Quick Note automatically opens on Joplin startup (can be disabled in settings).
3. Press **Alt+Q** (or your configured shortcut) to open the Quick Note instantly.
4. To unset the Quick Note, use **Unset Quick Note** from the menu.

## Commands

- **Open Quick Note** → Opens your Quick Note.
- **Set as Quick Note** → Sets the current note as your Quick Note.
- **Unset Quick Note** → Removes the Quick Note.

## Settings

Navigate to **Tools → Options → Quick Note** to configure:

- **Open on Startup**: Automatically open the Quick Note when Joplin starts.
- **Quick Note ID**: The ID of the note set as Quick Note.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests on [GitHub](https://github.com/cipherswami/joplin-plugin-quick-note).
