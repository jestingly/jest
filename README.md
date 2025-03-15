# JEST® | Jest Game Engine

JEST® is a full-featured 2D game engine inspired by Graal, built in JavaScript. It provides a pseudo-OS framework where developers can create applications, including **JestPlay**, a complete game engine for tile-based worlds, animations, and asset management.

## Features

- **Tile-based game mechanics** similar to Graal.
- **Dynamic asset loading** via JestFiler, JestTransmitter, and JestGallery.
- **Event-driven system** for handling in-game interactions.
- **Customizable animation system** using JestFantascope.
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

### **JestPlay: The Game Engine**
JestPlay is a full **2D game development framework** running inside Jest OS. It provides:
- **Tile-based world rendering** using JestGameboard.
- **Player movement & animations** handled by JestPlayer.
- **Dynamic asset management** through JestFiler, JestGallery, and JestTransmitter.
- **Advanced animation playback** with JestFantascope.

### **Core Components:**

- **JestPlay** → The main game client that launches inside Jest OS.
- **JestGameboard** → Manages the game world, objects, and rendering.
- **JestPlayer** → Handles player movement, animations, and interactions.
- **JestFiler** → Handles all file-based operations (downloads, preloading, definitions).
- **JestTransmitter** → Loads, caches, and prevents redundant network requests.
- **JestGallery** → Organizes and loads **image assets** into categories.
- **JestFantascope** → Plays animations for characters, NPCs, and effects.

### **How to Launch JestPlay**

1. Install Jest as a **browser extension**.
2. Click on the Jest icon in the toolbar.
3. Navigate to **JestPlay** from the Jest Apps menu.
4. The game will launch inside a **windowed UI** within Jest OS.

## Asset Management

### **How Assets Are Loaded & Preloaded**
- **JestFiler** manages all **file operations**, handling downloads and preloading.
- **JestTransmitter** ensures efficient asset delivery, using caching and request control.
- **JestGallery** organizes **image-based assets** into structured categories.
- **JestFantascope** applies **animations** to characters, tiles, and world objects.

### **Adding Custom Assets**
To add new tilesets, NPCs, or sounds:
1. Place assets in the appropriate folders (`images/`, `sounds/`, etc.).
2. Modify `JestGallery.js` to register your custom assets.
3. Update `JestFiler.js` to ensure the engine recognizes the new files.
4. Use direct asset inquiries in JestTransmitter to load assets dynamically.

### **Overriding & Customizing Assets**
- **Modify `JestGallery`** to categorize and replace images.
- **Adjust `JestFantascope`** for sprite-based animation effects.
- **Use `JestFiler` to define parsing rules for new asset formats.**
- **Extend `JestPlayer.js`** to swap out player animations and sprite sheets.

### **Customizing Animation Sequences**
- JestFantascope enables frame-based **sprite animations**.
- Modify `JestFantascope.js` to adjust animation speeds, transitions, and effects.
- Animation events can be triggered dynamically using custom event handlers.

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
