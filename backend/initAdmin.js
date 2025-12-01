require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, initModels } = require('./models');

async function run() {
  await sequelize.authenticate();
  const { User } = initModels();
  await sequelize.sync();

  const email = process.env.ADMIN_EMAIL;
  const pass = process.env.ADMIN_PASSWORD;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log('Admin ya existe:', email);
    process.exit(0);
  }

  const hash = await bcrypt.hash(pass, 10);
  await User.create({ name: 'Admin', email, passwordHash: hash, isAdmin: true });
  console.log('Admin creado:', email);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
