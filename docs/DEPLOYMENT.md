
**package.json** (Root)
```json
{
  "name": "mern-bug-tracker",
  "version": "1.0.0",
  "description": "Full-stack bug tracking application with testing",
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "test": "concurrently \"npm test --prefix server\" \"npm test --prefix client\"",
    "install-all": "npm install && cd server && npm install && cd ../client && npm install",
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "cypress:open": "cd client && npm run cypress:open"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}