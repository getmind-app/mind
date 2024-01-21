import type * as Notification from "expo-notifications";
import { format } from "date-fns";

import { type Appointment, type AppointmentStatus } from "@acme/db";

import { getTherapistAndPatient } from "../appointments/getTherapistAndPatient";
import { sendPushNotification } from "../helpers/sendPushNotification";
import { type TrpcContext } from "../trpc";
import { getUser } from "../users/getUser";

export async function notifyAppointmentStatusChange({
    appointment,
    newStatus,
    prisma,
}: {
    appointment: Appointment;
    newStatus: AppointmentStatus;
    prisma: TrpcContext["prisma"];
}) {
    if (newStatus === "PENDENT") {
        return;
    }

    const [date, hour] = format(appointment.scheduledTo, "dd HH");
    const [therapist, patient] = await getTherapistAndPatient({
        prisma,
        appointment,
    });

    if (newStatus === "CANCELED") {
        const therapistUser = await getUser(therapist.userId);
        await sendPushNotification({
            expoPushToken: therapistUser.publicMetadata
                .expoPushToken as Notification.ExpoPushToken,
            title: "Sessão cancelada ❌",
            body: `${patient.name} cancelou a sessão no dia ${date} às ${hour}h.`,
        });
        return;
    }

    const patientUser = await getUser(patient.userId);
    if (newStatus === "REJECTED") {
        await sendPushNotification({
            expoPushToken: patientUser.publicMetadata
                .expoPushToken as Notification.ExpoPushToken,
            title: "Sessão cancelada ❌",
            body: `${therapist.name} não vai poder atender você no dia ${date} às ${hour}h.`,
        });
        return;
    }

    if (newStatus === "ACCEPTED") {
        await sendPushNotification({
            expoPushToken: patientUser.publicMetadata
                .expoPushToken as Notification.ExpoPushToken,
            title: "Sessão confirmada! 🎉",
            body: `${therapist.name} aceitou sua sessão no dia ${date} às ${hour}h.`,
        });
        return;
    }

    const _exhaustive: never = newStatus;
}
