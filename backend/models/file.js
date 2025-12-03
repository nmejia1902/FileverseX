module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define("File", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    originalName: { type: DataTypes.STRING, allowNull: false },
    filename: { type: DataTypes.STRING, allowNull: false }, // solo el nombre
    mimeType: DataTypes.STRING,
    size: DataTypes.INTEGER,
    downloads: { type: DataTypes.INTEGER, defaultValue: 0 },
  });

  return File;
};
