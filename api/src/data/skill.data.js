export default async (Skill) => {
  Skill.bulkCreate([
    { name: 'Teaching' },
    { name: 'Mentoring' },
    { name: 'Tutoring' },
    { name: 'Communication' },
    { name: 'Education' },
    { name: 'Administration' },
  ]);
};