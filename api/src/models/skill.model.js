export default (sequelize, Sequelize) => {
  const Skill = sequelize.define("skill", {
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
  });

  return Skill;
};