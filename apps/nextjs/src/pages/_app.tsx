import "../styles/globals.css";
import type { AppType } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <SessionProvider session={session}>
            <div className="min-h-screen bg-off-white">
                <Component {...pageProps} />
            </div>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
