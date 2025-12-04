import 'dotenv/config'
import { Prisma, PrismaClient } from '../prisma/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter: pool })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({ adapter: pool })
  }
  prisma = global.prisma
}

export { prisma, Prisma }
