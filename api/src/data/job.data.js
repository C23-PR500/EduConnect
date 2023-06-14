export default async (Job, Skill) => {
  const jobs = [
    {
      name: 'Teacher',
      companyName: 'KenzieTech International Corporation',
      salary: 25000,
      level: 'Associate',
      city: 'Semarang',
      area: 'Central Java',
      country: 'Indonesia',
      latitude: 16.5,
      longitude: 5.5,
      skills: ['Teaching', 'Communication'],
    },
    {
      name: 'Mentor',
      companyName: 'Ammar Compute Solutions, Inc.',
      salary: 50000,
      level: 'Senior',
      city: 'Sorong',
      area: 'Southwest Papua',
      country: 'Indonesia',
      latitude: 5.7,
      longitude: 9.5,
      skills: ['Mentoring', 'Leadership'],
    },
    {
      name: 'Tutor',
      companyName: 'Farisoft Ltd.',
      salary: 35000,
      level: 'Senior',
      city: 'Lhokseumawe',
      area: 'Aceh',
      country: 'Indonesia',
      latitude: 9.5,
      longitude: 2.5,
      skills: ['Tutoring', 'Problem Solving'],
    },
  ];

  for (const job of jobs) {
    const { skills, ...jobData } = job;
    const createdJob = await Job.create(jobData);

    const skillInstances = await Skill.findAll({ where: { name: skills } });

    await createdJob.setSkills(skillInstances);
  }
};