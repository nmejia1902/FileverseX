module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT, allowNull: true },
    avatarUrl: { type: DataTypes.STRING, allowNull: true },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    canUpload: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
canDownload: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
canShare: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
canViewReports: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
storageQuotaMB: {
  type: DataTypes.INTEGER,
  allowNull: true,  // null = sin límite
},
usedStorageBytes: {
  type: DataTypes.BIGINT,
  defaultValue: 0,
},

  });
  return User;
};
