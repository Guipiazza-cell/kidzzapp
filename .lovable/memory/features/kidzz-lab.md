---
name: Kidzz Lab - Mascot Customization
description: Lab uses real Ane/Pixel mascot PNGs with CSS hue-rotate for colors, expression overlays, outfit/energy tabs, localStorage persistence
type: feature
---
- Lab replaced DynamicCharacter blob with actual Ane/Pixel mascot images
- Colors applied via CSS `hue-rotate()` on mascot PNGs
- 6 named colors: Rosa Encantado (0°), Dourado Mágico (-30°), Verde Floresta (90°), Azul Oceano (180°), Lilás Estrelado (240°), Laranja Aventura (-60° locked)
- 6 expressions: happy, curious, excited, thinking, loving (locked), challenging (locked)
- 5 outfits: scientist, superhero, explorer, astronaut (locked), chef (locked)
- 4 energy levels: calm, curious, animated, powerful
- Config saved to `localStorage` key `mascotConfig` as JSON `MascotConfig`
- `loadMascotConfig()` exported from KidzzLab for cross-screen use
- HomeScreen applies saved hue-rotate to Ane/Pixel mascots
- Dark background with forest overlay (leaves SVG, golden particles, stars)
- Save button with celebration message + auto-redirect to home
- Locked items show unlock requirements with 🔒 and description
