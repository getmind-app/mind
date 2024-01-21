import {
    type Address,
    type Appointment,
    type Patient,
    type Therapist,
} from "@acme/db";

import { type TrpcContext } from "../trpc";

export async function getTherapistAndPatient({
    prisma,
    appointment,
}: {
    prisma: TrpcContext["prisma"];
    appointment: Appointment;
}): Promise<[Therapist & { address: Address | null }, Patient]> {
    const [therapist, patient] = await Promise.all([
        prisma.therapist.findUniqueOrThrow({
            where: {
                id: appointment.therapistId,
            },
            include: {
                address: true,
            },
        }),
        prisma.patient.findUniqueOrThrow({
            where: {
                id: appointment.patientId,
            },
        }),
    ]);

    return [therapist, patient];
}
