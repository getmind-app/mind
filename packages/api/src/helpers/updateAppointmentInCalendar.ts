import { google, type calendar_v3 } from "googleapis";

import { getOAuth2GoogleClient } from "./getOAuth2GoogleClient";

export const updateAppointmentInCalendar = async (
    eventId: string,
    updateData: calendar_v3.Schema$Event,
) => {
    const calendar = google.calendar({
        version: "v3",
        auth: await getOAuth2GoogleClient(),
    });

    const response = await calendar.events.update({
        calendarId: "primary",
        eventId,
        sendUpdates: "all",
        requestBody: updateData,
    });

    return response;
};
