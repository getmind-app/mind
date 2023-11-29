import clerk from "@clerk/clerk-sdk-node";
import { google } from "googleapis";

export const getOAuth2GoogleClient = async () => {
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

    return oauth2Client;
};
