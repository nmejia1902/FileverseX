# Backend - FileverseX

## Pasos

1. Copia `.env.example` a `.env` y configura tus datos de MySQL y admin.
2. Crea la base de datos en MySQL con el nombre de `DB_NAME`.
3. Ejecuta:

   ```bash
   cd backend
   npm install
   npm run init-admin   # crea el usuario administrador
   npm run dev          # o npm start
   ```

Endpoints principales:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/files/upload`
- `GET  /api/files/my`
- `GET  /api/files/download/:id`
- `POST /api/collections/`
- `POST /api/collections/:id/add`
- `POST /api/collections/:id/like`
- `GET  /api/admin/users`
- `POST /api/admin/users/:id/block`
- `POST /api/admin/files/:id/remove`
- `GET  /api/stats/user`
- `GET  /api/stats/top-collections`
- `GET  /api/stats/export/csv`
- `GET  /api/stats/export/json`
