module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    originalName: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER },
    url: { type: DataTypes.STRING },
    downloads: { type: DataTypes.INTEGER, defaultValue: 0 },
    sharedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  });
  return File;
};
