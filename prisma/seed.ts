import { prisma } from "../lib/db"

async function main() {
    const tulizoProduct = await prisma.medicalProduct.upsert({
        where: { name: "Tulizo Bora Insurance Cover" },
        update: {},
        create: {
            name: "Tulizo Bora Insurance Cover",
            benefits: {
                create: [
                    { name: "IP 1M, OP 500K, Mat 250K" },
                    { name: "IP 2M, OP 700K, Mat 550K" },
                    { name: "IP 3M, OP 500K" }
                ]
            }
        }
    });

    console.log({tulizoProduct})
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })