// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

// async function main() {
//   // Create the Default Admin User
//   const user = await prisma.user.upsert({
//     where: { email: 'admin@realestate.com' },
//     update: {},
//     create: {
//       email: 'admin@realestate.com',
//       password: 'temp-password', // Placeholder
//       name: 'Super Admin',
//       plan: 'enterprise',
//       agencyName: 'My Real Estate Agency'
//     },
//   })
//   console.log('✅ Default User Created:', user)
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })