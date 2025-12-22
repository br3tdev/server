import { prisma } from "../lib/db";

export default class MedicalService {
    static async getMedicalProductBenefits() {
        try {
            const benefits = await prisma.medicalBenefits.findMany();
            if (!benefits) return null;
            return benefits;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
}