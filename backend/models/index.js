
const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize(
  'fileversex',   
  'root',         
  'manD7oka',     
  {
    host: 'localhost',
    port: 3307,   
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

  User.hasMany(File, { as: 'files', foreignKey: 'userId' });
  File.belongsTo(User, { as: 'owner', foreignKey: 'userId' });

  User.hasMany(Collection, { as: 'collections', foreignKey: 'userId' });
  Collection.belongsTo(User, { as: 'owner', foreignKey: 'userId' });

  
  Collection.belongsToMany(File, { through: 'collection_files', as: 'files' });
  File.belongsToMany(Collection, { through: 'collection_files', as: 'collections' });

  cachedModels = { User, File, Collection };
  return cachedModels;
}

module.exports = { sequelize, initModels };
