import Sequelize from 'sequelize';
import { dbms, dbhost, dbuser, dbpassword } from '../components/config/config';

let mutableDb;

if (dbms === 'sqlite3') {
  mutableDb = new Sequelize({
    host: dbhost,
    dialect: 'sqlite',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    storage: './openiotdash_objects.db'
  });
}

if (dbms === 'postgres') {
  // Using psql "create database openiotdash_objects;"
  // "create role openiotdash with login password 'openiotdash';"
  // "grant all privileges on database openiotdash_objects to openiotdash;"
  mutableDb = new Sequelize('openiotdash_objects', dbuser, dbpassword, {
    host: dbhost,
    dialect: 'postgres',
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
    },
  });
}

const sql = mutableDb; // make immutable

module.exports = {
  sql,
  Sequelize,
};
