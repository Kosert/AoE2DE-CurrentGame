# AoE2DE Current Game
Utility app for Age of Empires 2: Definitive Edition. Displays current game info for provided player, updates automatically using websockets. Since the game doesn't have an official public API, data is taken from [aoe2companion](https://www.aoe2companion.com/).

## Running

### Building CSS
Generates optimized CSS file based on usage from html files (requires [Tailwind CLI](https://tailwindcss.com/docs/installation)):
```
npx tailwindcss -o dist/public/main.css
```

### Compiling and running
Following command will compile typescript and run the app:
```
npm start
```
Or just launch if the app is already built:
```
node dist/index.js
```
