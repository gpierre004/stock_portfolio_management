import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Company = sequelize.define('company', {
    ticker: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'companies',
    timestamps: true
  });

  return Company;
};
