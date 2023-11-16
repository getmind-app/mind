import { google } from "googleapis";

import { type Appointment, type Patient } from "@acme/db";

import { getOAuth2GoogleClient } from "./getOAuth2GoogleClient";

export const createAppointmentInCalendar = async (
    therapistName: string,
    therapistEmail: string,
    appointment: Appointment,
    patient: Patient,
) => {
    const calendar = google.calendar({
        version: "v3",
        auth: await getOAuth2GoogleClient(),
    });

    // end date is 1 hour after start date
    const endDate = new Date(appointment.scheduledTo);
    endDate.setHours(endDate.getHours() + 1);

    const requestBody: any = {
        summary: `Sessão do ${patient.name} com ${therapistName}`,
        description: `Conversa do ${patient.name} com o terapeuta ${therapistName}`,
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
    }

    const newAppointment = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody,
    });

    return newAppointment;
};
