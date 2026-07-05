# CRUD Demo — Express + React

## Structure
```
crud-demo/
├── backend/        Express API (port 3000)
│   ├── index.js
│   └── package.json
└── frontend/       Vite + React (port 5173)
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── index.css
```

## Run

**Terminal 1 — backend**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev
```

Open → http://localhost:5173

## Endpoints (localhost:3000)

| Method | Path         | Body                        | Description |
|--------|--------------|-----------------------------|-------------|
| GET    | /users       | —                           | List all    |
| GET    | /users/:id   | —                           | Get one     |
| POST   | /users       | { name, email, role }       | Create      |
| PUT    | /users/:id   | { name, email, role }       | Update      |
| DELETE | /users/:id   | —                           | Delete      |
| GET    | /health      | —                           | Health check|

## Test with curl
```bash
# list
curl http://localhost:3000/users

# create
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","role":"Engineer"}'

# update
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"new@test.com","role":"Manager"}'

# delete
curl -X DELETE http://localhost:3000/users/1
```

## Notes
- Data is in-memory — restarting backend resets it
- CORS is whitelisted for localhost:5173 only
- API log panel in the UI shows every request live
