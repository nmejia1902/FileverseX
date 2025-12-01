module.exports = (sequelize, DataTypes) => {
  const Collection = sequelize.define('Collection', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    likes: { type: DataTypes.INTEGER, defaultValue: 0 },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  });
  return Collection;
};
