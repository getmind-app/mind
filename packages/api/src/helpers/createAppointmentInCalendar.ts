import { addHours } from "date-fns";
import { google, type calendar_v3 } from "googleapis";

import {
    type Address,
    type Appointment,
    type Patient,
    type Therapist,
} from "@acme/db";

import { getTherapistAndPatient } from "../appointments/getTherapistAndPatient";
import { type TrpcContext } from "../trpc";
import { getUser } from "../users/getUser";
import { getOAuth2GoogleClient } from "./getOAuth2GoogleClient";

export const createAppointmentInCalendar = async ({
    appointment,
    prisma,
}: {
    appointment: Appointment;
    prisma: TrpcContext["prisma"];
}) => {
    const calendar = google.calendar({
        version: "v3",
        auth: await getOAuth2GoogleClient(),
    });
    const [therapist, patient] = await getTherapistAndPatient({
        prisma,
        appointment,
    });

    try {
        console.log("therapist.userId", therapist.userId);
        const therapistUser = await getUser(therapist.userId);

        const modality =
            appointment.modality === "ONLINE" ? "online" : "presencial";
        const therapistPronoun = therapist.gender === "MALE" ? "o" : "a";

        const requestBody = makeRequestBody(
            patient,
            therapist,
            modality,
            therapistPronoun,
            appointment,
            String(therapistUser.emailAddresses[0]?.emailAddress),
        );

        try {
            const newAppointment = await calendar.events.insert({
                calendarId: "primary",
                conferenceDataVersion: 1,
                requestBody,
            });

            return newAppointment;
        } catch (error) {
            console.error("Error creating appointment in calendar", error);
            throw new Error("Error creating appointment in calendar");
        }
    } catch (error) {
        console.error("Error fetching therapist user", error);
        throw new Error("Error fetching therapist user");
    }
};

const appointmentTypeToEmoji: {
    [key in Appointment["type"]]: string;
} = {
    FIRST_IN_RECURRENCE: "🔷",
    RECURRENT: "🔵",
    SINGLE: "🟡",
    SINGLE_REPEATED: "🟢",
};

function makeRequestBody(
    patient: Patient,
    therapist: Therapist & { address: Address | null },
    modality: "online" | "presencial",
    therapistPronoun: string,
    appointment: Appointment,
    therapistEmail: string,
): calendar_v3.Schema$Event {
    return {
        summary: `${appointmentTypeToEmoji[appointment.type]} Sessão ${
            patient.name
        } e ${therapist.name}`,
        description: `Conversa ${modality} de ${patient.name} com ${therapistPronoun} terapeuta ${therapist.name}`,
        start: {
            dateTime: appointment.scheduledTo.toISOString(),
            timeZone: "America/Sao_Paulo",
        },
        end: {
            dateTime: addHours(appointment.scheduledTo, 1).toISOString(),
            timeZone: "America/Sao_Paulo",
        },
        attendees: [
            {
                email: therapistEmail,
                organizer: true,
            },
            {
                email: patient.email,
            },
        ],
        reminders: {
            useDefault: false,
            overrides: [
                {
                    method: "email",
                    minutes: 60,
                },
                {
                    method: "popup",
                    minutes: 10,
                },
            ],
        },
        ...(modality === "online"
            ? {
                  conferenceData: {
                      createRequest: {
                          requestId: appointment.id,
                          conferenceSolutionKey: {
                              type: "hangoutsMeet",
                          },
                      },
                  },
              }
            : {
                  location: `${therapist.address?.street}, ${therapist.address?.number} - ${therapist.address?.neighborhood}`,
              }),
    };
}
