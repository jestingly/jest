# JEST® | Jest Game Engine

JEST® is a lightweight 2D game engine inspired by Graal, written in JavaScript. It features an asset/resource management system and aims to provide an interactive framework for browser-based games.

## Features

- **Tile-based game mechanics** similar to Graal.
- **Dynamic asset management** for loading sprites, sounds, and other resources.
- **Event-driven system** for handling in-game interactions.
- **Customizable game logic** using JavaScript.
- **Lightweight and optimized** for browser performance.
- **Pseudo-OS Interface** with simulated windowed applications.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/jestingly/jest.git
   cd jest
   ```
2. Install dependencies (if applicable):
   ```sh
   npm install
   ```
3. Run the game locally:
   ```sh
   npm start
   ```

## Usage

JEST functions as a **browser extension-based pseudo-OS** with its own application framework. The core system mimics a Windows-like startup environment where users can interact with **DockShortcut icons** and launch apps inside **simulated window GUIs**.

### **JestPlay (Game Application)**

JestPlay is the primary game client inside Jest. It runs as an application within Jest OS and features:

- **Tile-based world rendering** using JestGameboard.
- **Player movement & animations** handled by JestPlayer.
- **Sound, tileset, and NPC management** via JestGameboard.
- **Event-driven system** with a TaskManager for game logic.

### **Core Components:**

- **JestPlay** → The main game client that launches inside Jest OS.
- **JestGameboard** → Manages the game world, objects, and rendering.
- **JestPlayer** → Handles player movement, animations, and interactions.
- **TaskManager** → Manages game logic execution and background tasks.
- **Panel System** → Simulated OS window framework for applications.

### **How to Launch JestPlay**

1. Install Jest as a **browser extension**.
2. Click on the Jest icon in the toolbar.
3. Navigate to **JestPlay** from the Jest Apps menu.
4. The game will launch inside a **windowed UI** within Jest OS.

## Asset Management

### **How Assets Are Loaded & Preloaded**

- Jest uses **JestLibraryRegistry** to register and manage asset libraries.
- The **librarian in JSOSEnvironment** handles retrieving assets dynamically.
- **JestGameboard** loads and manages:
  - `tilesets` → Stores **JestTileset** objects for map rendering.
  - `overworlds` → Stores **JestOverworld** objects (NPCs, interactables, etc.).
  - `sounds` → Manages **JestSound** objects for sound effects.

### **Adding Custom Assets**

To add new tilesets, NPCs, or sounds:

1. Place assets in the appropriate folders (`images/`, `sounds/`, etc.).
2. Modify `JestGameboard.js` to register your custom assets.
3. Ensure assets are referenced properly within `JestLibraryRegistry`.
4. Use `TaskManager` to load assets dynamically at runtime.

### **Overriding Existing Assets**

- Modify `JestLibraryRegistry` to replace asset references.
- Update `JestGameboard`'s `tilesets` or `overworlds` object to use new assets.
- Use `JestPlayer.js` to change player animations and models.

### **Customization & Modding**

- Modify `JestGameboard.js` to create custom maps, NPCs, and objects.
- Extend `JestPlayer.js` to add new abilities and animations.
- Use `TaskManager.js` to add interactive events and scripted behaviors.

## Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`
3. Commit changes: `git commit -m "Added new feature"`
4. Push the branch: `git push origin feature-branch`
5. Open a pull request.

## License

This project is licensed under the MIT License. See `LICENSE` for details.

## Contact

For questions or support, open an issue or reach out via [your contact info].
