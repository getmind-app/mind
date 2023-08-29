import { useState } from "react";
import type { NextPage } from "next";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { BsArrowRightShort } from "react-icons/bs";

import { api } from "~/utils/api";
import AppStore from "../../assets/app_store.png";
import PlayStore from "../../assets/google_play.png";
import Icon from "../../assets/icon.png";
import Mockup from "../../assets/render.png";

const nunitoSans = Nunito_Sans({
    subsets: ["latin"],
    variable: "--font-nunito-sans",
    weight: ["400", "700"],
});

const Home: NextPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isValidEmail, setIsValidEmail] = useState(true);

    const { mutate } = api.waitlist.create.useMutation({
        onSuccess: async () => {
            await router.push("/success");
        },
    });

    const handleCreateEmail = () => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        if (!email.includes("@") || !emailPattern.test(email)) {
            setIsValidEmail(false);
            return;
        }

        mutate({ email });
    };

    return (
        <>
            <Head>
                <title>Mind</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main
                className={`${nunitoSans.variable} flex h-screen flex-col items-center justify-center bg-off-white px-8 align-middle font-nunito-sans text-black md:px-32`}
            >
                <div className="flex items-center justify-center gap-24 align-middle">
                    <div className="mb-8 flex flex-col gap-6">
                        <Image
                            className="mb-6 w-16"
                            src={Icon}
                            alt="Mind logo"
                        />
                        <h2 className="text-5xl font-bold">
                            <span className="text-blue-500">Obrigado! 🙂</span>
                        </h2>
                        <p className="text-lg text-slate-500">
                            Assim que tivermos a primeira versão do app, você
                            <br />
                            receberá um email com o link para download.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <Image
                            className="w-[36rem]"
                            src={Mockup}
                            alt="Mind app mockups"
                        />
                    </div>
                </div>
                <div className="hidden md:block">
                    <p className="text-center text-lg md:pb-2">
                        Logo disponível na
                    </p>
                    <div className="flex items-center gap-2">
                        <div>
                            <Image
                                className="w-24 md:w-36"
                                src={AppStore}
                                alt="App store"
                            />
                        </div>
                        <div>
                            <Image
                                className="w-28 md:w-40"
                                src={PlayStore}
                                alt="Play store"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Home;
