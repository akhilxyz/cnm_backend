import { Sequelize } from 'sequelize';
import { env } from '../common/utils/envConfig';


// Passing parameters separately (other dialects)
const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
  host: env.DB_HOST,
  dialect: 'mysql',
  logging: false,
});

export async function syncDB(){
  return await sequelize.sync({ alter: true }) // or { force: true } during dev
}


export default sequelize;
