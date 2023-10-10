# eu-vehicles-js

## Development Phase

1. Clone this repository
```bash
git clone https://github.com/jjasferreira/eu-vehicles-js.git
```

2. Install [`nvm`](https://github.com/nvm-sh/nvm#install--update-script) (recommended) or Node.js and npm separately via `apt`:
```bash
sudo apt install nodejs
sudo apt install npm
```

3. Install dependencies, including Tailwind CSS via `npm`:
```bash
npm i
```

4. Start the Tailwind CLI build process to scan your template files for classes and build your CSS
```bash
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
```