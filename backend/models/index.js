// backend/models/index.js
const { Sequelize, DataTypes } = require('sequelize');

// 🔒 Conexión DIRECTA, sin depender del .env (para depurar mejor)
const sequelize = new Sequelize(
  'fileversex',   // nombre EXACTO de la base que ves en phpMyAdmin
  'root',         // usuario MySQL
  'manD7oka',     // contraseña MySQL (cámbiala si es otra, o "" si no tiene)
  {
    host: 'localhost',
    port: 3307,   // el puerto que usas en XAMPP
    dialect: 'mysql',
    logging: false,
  }
);

let cachedModels = null;

function initModels() {
  if (cachedModels) return cachedModels;

  const User = require('./user')(sequelize, DataTypes);
  const File = require('./file')(sequelize, DataTypes);
  const Collection = require('./collection')(sequelize, DataTypes);

  // Relaciones básicas
  User.hasMany(File, { as: 'files', foreignKey: 'userId' });
  File.belongsTo(User, { as: 'owner', foreignKey: 'userId' });

  User.hasMany(Collection, { as: 'collections', foreignKey: 'userId' });
  Collection.belongsTo(User, { as: 'owner', foreignKey: 'userId' });

  // Many-to-many con nombres POR DEFECTO de Sequelize
  // Esto creará una tabla collection_files con columnas:
  // CollectionId y FileId
  Collection.belongsToMany(File, { through: 'collection_files', as: 'files' });
  File.belongsToMany(Collection, { through: 'collection_files', as: 'collections' });

  cachedModels = { User, File, Collection };
  return cachedModels;
}

module.exports = { sequelize, initModels };
