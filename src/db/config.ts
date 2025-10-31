import { Sequelize } from 'sequelize';
import { env } from '../common/utils/envConfig';


// Passing parameters separately (other dialects)

console.log("env.DB_NAME", env.DB_NAME)
console.log("env.DB_USER", env.DB_USER)
console.log("env.DB_PASS", env.DB_PASS)
console.log("env.DB_HOST", env.DB_HOST)



const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
  host: env.DB_HOST,
  dialect: 'mysql',
  logging: false,
});

export async function syncDB(){
  return await sequelize.sync({ alter: true }) // or { force: true } during dev
}


export default sequelize;
