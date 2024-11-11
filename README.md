# AoE2DE Current Game
Utility app for Age of Empires 2: Definitive Edition. Displays current game info, including team bonuses, for provided player. Data is updated automatically using websockets. Since the game doesn't have an official public API, data is taken from [aoe2companion](https://www.aoe2companion.com/).

## Running

### Building CSS
Generates optimized CSS file based on usages in html files (requires [Tailwind CLI](https://tailwindcss.com/docs/installation)):
```
npx tailwindcss -o dist/public/main.css
```

### Compiling and running
First install depndencies:
```
npm install
```
Then compile typescript and run the app with:
```
npm start
```
