import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

const Redirect: NextPage = () => {
    return (
        <>
            <Head>
                <title>Mind</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
        </>
    );
};
export default Redirect;

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { redirectUrl } = context.query;

    if (redirectUrl) {
        return {
            redirect: {
                destination: redirectUrl as string,
                permanent: false,
            },
        };
    }

    return {
        redirect: {
            destination: "/",
            permanent: false,
        },
    };
};
