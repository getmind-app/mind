import clerk from "@clerk/clerk-sdk-node";
import { google } from "googleapis";

export const getOAuth2GoogleClient = async () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
    );

    console.log(
        "Got OAuth2 Google client: process.env.SCHEDULE_USER_ID: ",
        process.env.SCHEDULE_USER_ID,
    );

    const user = await clerk.users.getUser(process.env.SCHEDULE_USER_ID || "");

    console.log("Got OAuth2 Google client: user, ", user);

    const [ScheduleUserOAuthAccessToken] =
        await clerk.users.getUserOauthAccessToken(
            process.env.SCHEDULE_USER_ID || "",
            "oauth_google",
        );

    console.log(
        "Got OAuth2 Google client: ScheduleUserOAuthAccessToken: ",
        ScheduleUserOAuthAccessToken,
    );

    oauth2Client.setCredentials({
        access_token: ScheduleUserOAuthAccessToken?.token,
    });

    return oauth2Client;
};
