import { prisma } from "../lib/db";

export default class UserServices {
    static async findUserByPhoneNumber(mobileNumber: string) {
        try {
            const user = await prisma.medicalCustomer.findFirst({ where: { mobileNumber } })
            if (!user) return null;
            return user;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
}