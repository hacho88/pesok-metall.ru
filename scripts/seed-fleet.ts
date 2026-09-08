import { prisma } from "../src/lib/prisma";

const DEFAULTS = [
  { name: "Портер (до 2 т)", maxWeightKg: 2000, maxLengthMeters: 3, baseFare: 2500, perKmCharge: 35 },
  { name: "Газель (до 3 т)", maxWeightKg: 3000, maxLengthMeters: 4, baseFare: 3000, perKmCharge: 40 },
  { name: "5-тонник", maxWeightKg: 5000, maxLengthMeters: 5, baseFare: 5000, perKmCharge: 50 },
  { name: "10-тонник", maxWeightKg: 10000, maxLengthMeters: 6, baseFare: 5500, perKmCharge: 55 },
];

async function main() {
  await prisma.fleetVehicle.deleteMany();
  for (const v of DEFAULTS) {
    await prisma.fleetVehicle.create({ data: v });
  }
  console.log(`re-seeded ${DEFAULTS.length} vehicles`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect());
