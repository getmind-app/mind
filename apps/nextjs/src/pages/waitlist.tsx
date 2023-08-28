import { useState } from "react";
import type { NextPage } from "next";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
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
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const [isValidEmail, setIsValidEmail] = useState(true);

    const { mutate } = api.waitlist.create.useMutation({
        onSuccess: () => {
            setSuccess(true);

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
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
                    {success && (
                        <div
                            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000 ${
                                success ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <div className="rounded-lg bg-white p-4 shadow-lg">
                                <h3 className="text-center text-xl font-semibold text-green-500">
                                    Muito obrigado! :)
                                </h3>
                            </div>
                        </div>
                    )}
                    <div className="mb-8 flex flex-col gap-6">
                        <Image
                            className="mb-6 w-16"
                            src={Icon}
                            alt="Mind logo"
                        />
                        <h2 className="text-5xl font-bold">
                            <span className="text-blue-500">
                                Foque na conversa,{" "}
                            </span>
                            <br /> a gente cuida do resto!
                        </h2>
                        <p className="text-lg text-slate-500">
                            Entre na lista de espera e seja um dos primeiros a
                            <br />
                            melhorar a experiência de terapia.
                        </p>
                        <div className="flex items-center gap-6 align-middle">
                            <input
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                                placeholder="Seu email"
                                className={`border-b-2 bg-off-white px-4 py-2 ${
                                    !isValidEmail ? "border-red-500" : ""
                                }`}
                            />
                            <button
                                className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-400"
                                onClick={() => {
                                    handleCreateEmail();
                                }}
                            >
                                <div className="group duration-200">
                                    <div className="flex items-center gap-1">
                                        <p>Entrar</p>
                                        <div className="hidden items-center transition-transform duration-500 group-hover:translate-x-1 md:block">
                                            <BsArrowRightShort size={24} />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                        {!isValidEmail && (
                            <p className="text-sm text-red-500">
                                Email inválido.
                            </p>
                        )}
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
