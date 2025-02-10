export const campusLocations = [
  {
    id: 1,
    name: "TNP"
  },
  {
    id: 2,
    name: "Shantai"
  },
  {
    id: 3,
    name: "C Cafetaria"
  },
  {
    id: 4,
    name: "Campus Cafeteria"
  },
  {
    id: 5,
    name: "Printing Station behind C"
  },
  {
    id: 6,
    name: "Saraswati"
  },
  {
    id: 7,
    name: "Bridge"
  },
  {
    id: 8,
    name: "Fountain"
  },
  {
    id: 9,
    name: "Amphitheatre"
  },
  {
    id: 10,
    name: "Backstage"
  },
  {
    id: 11,
    name: "Front Stage"
  },
  {
    id: 12,
    name: "Water Filters"
  },
  {
    id: 13,
    name: "Alarm Clock"
  },
  {
    id: 14,
    name: "Fire Extinguisher"
  },
  {
    id: 15,
    name: "Workshop"
  },
  {
    id: 16,
    name: "Dnyanprasad EDC DYPCO"
  },
  {
    id: 17,
    name: "Library"
  },
  {
    id: 18,
    name: "Sports Ground"
  },
  {
    id: 19,
    name: "Parking Area"
  },
  {
    id: 20,
    name: "Security Office"
  },
  {
    id: 21,
    name: "Medical Room"
  },
  {
    id: 22,
    name: "Food Truck"
  },
  {
    id: 23,
    name: "Soft Skills Lab"
  },
  {
    id: 24,
    name: "Admin Office"
  }
];

export const getRandomLocation = () => {
  return campusLocations[Math.floor(Math.random() * campusLocations.length)];
};