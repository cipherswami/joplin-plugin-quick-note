# Quick Note

Quick Note is a Joplin plugin that lets you instantly open a dedicated note either automatically on startup or anytime via a keyboard shortcut.

## Features

- 🚀 Automatically open Quick Note on Joplin startup (can be disabled)
- 📝 Set **any existing note** as your Quick Note
- ⌨️ Open Quick Note anytime with **Alt + Q** (customizable)
- 🔄 Easily unset or change the Quick Note

## Installation

1. **From Market-Place (Recommended)**

- Open Joplin and navigate to **Tools → Options → Plugins → Search**
- Search for **Quick Note**
- Click **Install** and restart Joplin

2. **From Source**

- Build the plugin package file (.jpl):

  ```bash
  git clone https://github.com/cipherswami/joplin-plugin-quick-note.git
  cd joplin-plugin-quick-note
  npm install
  npm run dist
  ```

- Then in Joplin, Go to **Tools → Options → Plugins → Install from file**
- Select the generated `.jpl` file from the `publish/` directory

## Usage

**Set a Quick Note:**

- Open a note and go to **Tools → Quick Note → Set as Quick Note**, OR
- Paste the Note ID in **Tools → Options → Quick Note → Quick NoteID**, OR
- Open desired note and run the **Set as Quick Note** command

**Access Quick Note:**

- Press **Alt + Q** _(customizable shortcut)_, OR
- Click the **Quick Note** toolbar button, OR
- Go to **Tools → Quick Note → Open Quick Note**, OR
- Run the **Open Quick Note** command

_Note: Opens automatically on startup (can be disable in settings)_

**Remove Quick Note:**

- Go to **Tools → Quick Note → Unset Quick Note**, OR
- Run the **Unset Quick Note** command

## Settings

Access settings at **Tools → Options → Quick Note**:

- **Open on Startup** - Automatically open Quick Note when Joplin launches
- **Quick Note ID** - The NoteID of your designated Quick Note

## Support & Community

### Getting Help

- **Questions & Discussions**: Join the conversation on the [Joplin Forum](https://discourse.joplinapp.org/t/quick-note/47445)
- **Bug Reports**: Report issues on [GitHub Issues](https://github.com/cipherswami/joplin-plugin-quick-note/issues).

### Contributing

Contributions are welcome! Visit the [GitHub repository](https://github.com/cipherswami/joplin-plugin-quick-note) to submit pull requests or suggest new features.
