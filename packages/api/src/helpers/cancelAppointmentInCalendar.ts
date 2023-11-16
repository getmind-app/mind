import { google } from "googleapis";

import { getOAuth2GoogleClient } from "./getOAuth2GoogleClient";

export const cancelAppointmentInCalendar = async (eventId: string) => {
    const calendar = google.calendar({
        version: "v3",
        auth: await getOAuth2GoogleClient(),
    });

    const response = await calendar.events.delete({
        calendarId: "primary",
        eventId,
        sendUpdates: "all",
    });

    return response;
};
