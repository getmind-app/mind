import clerk from "@clerk/clerk-sdk-node";
import { google } from "googleapis";

import { type Appointment, type Patient } from "@acme/db";

export const createAppointmentInCalendar = async (
    therapistName: string,
    therapistEmail: string,
    appointment: Appointment,
    patient: Patient,
) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
    );

    const [ScheduleUserOAuthAccessToken] =
        await clerk.users.getUserOauthAccessToken(
            process.env.SCHEDULE_USER_ID || "",
            "oauth_google",
        );

    oauth2Client.setCredentials({
        access_token: ScheduleUserOAuthAccessToken?.token,
    });

    const calendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
    });

    // end date is 1 hour after start date
    const endDate = new Date(appointment.scheduledTo);
    endDate.setHours(endDate.getHours() + 1);

    const requestBody: any = {
        summary: "Sessão de terapia",
        description: `Sessão do ${patient.name} com o terapeuta ${therapistName}`,
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
