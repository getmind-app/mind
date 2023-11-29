import { google } from "googleapis";

import {
    type Address,
    type Appointment,
    type Patient,
    type Therapist,
} from "@acme/db";

import { getOAuth2GoogleClient } from "./getOAuth2GoogleClient";

export const createAppointmentInCalendar = async (
    therapist: Therapist & { address: Address },
    therapistEmail: string,
    appointment: Appointment,
    patient: Patient,
) => {
    const calendar = google.calendar({
        version: "v3",
        auth: await getOAuth2GoogleClient(),
    });

    const modality =
        appointment.modality === "ONLINE" ? "online" : "presencial";
    const therapistPronoun = therapist.gender === "MALE" ? "o" : "a";

    // end date is 1 hour after start date
    const endDate = new Date(appointment.scheduledTo);
    endDate.setHours(endDate.getHours() + 1);

    const requestBody: any = {
        summary: `Sessão ${patient.name} e ${therapist.name}`,
        description: `Conversa ${modality} do(a) ${patient.name} com ${therapistPronoun} terapeuta ${therapist.name}`,
        start: {
            dateTime: appointment.scheduledTo.toISOString(),
            timeZone: "America/Sao_Paulo",
        },
        end: {
            dateTime: endDate.toISOString(),
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
    };

    // Check if the modality is "ONLINE" and add conferenceData accordingly
    if (appointment.modality === "ONLINE") {
        requestBody.conferenceDataVersion = 1;
        requestBody.conferenceData = {
            createRequest: {
                requestId: appointment.id,
                conferenceSolutionKey: {
                    type: "hangoutsMeet",
                },
            },
        };
    } else {
        requestBody.location = `${therapist.address.street}, ${therapist.address.number} - ${therapist.address.neighborhood}`;
    }

    const newAppointment = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody,
    });

    return newAppointment;
};
