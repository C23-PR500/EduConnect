export default async (Job) => {
  Job.bulkCreate([
    { 
      name: 'Teacher', 
      companyName: 'KenzieTech International', 
      salary: 25000, 
      level: 'Associate', 
      city: 'Semarang', 
      area: 'Central Java', 
      country: 'Indonesia',
      latitude: 16.5,
      longitude: 5.5,
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
    },
  ]);
};