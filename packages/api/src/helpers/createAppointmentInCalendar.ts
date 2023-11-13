import { google } from "googleapis";

import { type Appointment } from "@acme/db";

export const createAppointmentInCalendar = async (
    userToken: string,
    otherPartName: string,
    appointment: Appointment,
    therapistEmail: string,
    patientEmail: string,
) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
        access_token: userToken,
    });

    const calendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
    });

    // end date is 1 hour after start date
    const endDate = new Date(appointment.scheduledTo);
    endDate.setHours(endDate.getHours() + 1);

    // creating calendar event with meet link and in brazil timezone
    const newAppointment = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
            summary: otherPartName,
            description: "Sessão de terapia com " + otherPartName,
            start: {
                dateTime: appointment.scheduledTo.toISOString(),
                timeZone: "America/Sao_Paulo",
            },
            end: {
                dateTime: endDate.toISOString(),
                timeZone: "America/Sao_Paulo",
            },
            conferenceData: {
                createRequest: {
                    requestId: appointment.id,
                    conferenceSolutionKey: {
                        type: "hangoutsMeet",
                    },
                },
            },
            attendees: [
                {
                    email: therapistEmail,
                    organizer: true,
                },
                {
                    email: patientEmail,
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
        },
    });

    return newAppointment;
};
