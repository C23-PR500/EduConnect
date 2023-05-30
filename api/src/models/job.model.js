export default (sequelize, Sequelize) => {
  const Job = sequelize.define("job", {
    id : {
      type: Sequelize.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    companyName: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'company_name'
    },
    salary: {
      type: Sequelize.INTEGER
    },
    level: {
      type: Sequelize.STRING
    },
    city: {
      type: Sequelize.STRING
    },
    area: {
      type: Sequelize.STRING,
      allowNull: false
    },
    country: {
      type: Sequelize.STRING
    },
    latitude: {
      type: Sequelize.FLOAT
    },
    longitude: {
      type: Sequelize.FLOAT
    },
  });

  return Job;
};