import clerk from "@clerk/clerk-sdk-node";
import { endOfMonth, startOfMonth } from "date-fns";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export type PatientReport = {
    patientId: string;
    patientName: string;
    patientProfilePicture: string;
    patientDocument: string;
    total: number;
    appointments: {
        id: string;
        scheduledTo: Date;
        amount: number;
        paidAt?: Date;
    }[];
};

export type ReportByTherapist = {
    patients: PatientReport[];
};

export const financesRouter = createTRPCRouter({
    getReportByTherapist: protectedProcedure.query(async ({ ctx }) => {
        const user = await clerk.users.getUser(ctx.auth.userId);

        const therapist = await ctx.prisma.therapist.findUnique({
            where: {
                userId: user.id,
            },
            select: {
                id: true,
            },
        });

        if (!therapist?.id) {
            throw new Error("Therapist not found");
        }

        const now = new Date();

        const appointments = await ctx.prisma.appointment.findMany({
            where: {
                therapistId: therapist.id,
                scheduledTo: {
                    gte: startOfMonth(now),
                    lt: endOfMonth(now),
                },
                status: "ACCEPTED",
                isPaid: true,
            },
            include: {
                patient: true,
                therapist: true,
            },
            orderBy: {
                scheduledTo: "desc",
            },
        });

        const appointmentsByPatient = appointments.reduce<
            Record<string, PatientReport>
        >((acc, appointment) => {
            if (acc[appointment.patientId]) {
                (acc[appointment.patientId] as PatientReport).total +=
                    appointment.therapist.hourlyRate;

                acc[appointment.patientId]?.appointments.push({
                    id: appointment.id,
                    scheduledTo: appointment.scheduledTo,
                    amount: appointment.therapist.hourlyRate,
                    paidAt: appointment.paidAt ?? undefined,
                });
            } else {
                acc[appointment.patientId] = {
                    patientId: appointment.patientId,
                    patientName: appointment.patient.name,
                    patientDocument: appointment.patient.document,
                    patientProfilePicture:
                        appointment.patient.profilePictureUrl,
                    total: appointment.therapist.hourlyRate,
                    appointments: [
                        {
                            id: appointment.id,
                            scheduledTo: appointment.scheduledTo,
                            amount: appointment.therapist.hourlyRate,
                            paidAt: appointment.paidAt ?? undefined,
                        },
                    ],
                };
            }

            return acc;
        }, {});

        return {
            patients: Object.values(appointmentsByPatient),
        };
    }),
});
