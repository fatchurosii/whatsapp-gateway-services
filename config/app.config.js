require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  db: {
    dialect: 'sqlite',
    storage: process.env.DATABASE_STORAGE || './data/database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
};
