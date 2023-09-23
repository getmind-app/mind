import type { NextPage } from "next";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRightShort } from "react-icons/bs";

import Icon from "../../assets/icon.png";

const nunitoSans = Nunito_Sans({
    subsets: ["latin"],
    variable: "--font-nunito-sans",
    weight: ["400", "700"],
});

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>Contato - Mind</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main
                className={`${nunitoSans.variable} flex min-h-screen flex-col items-center justify-center px-8 py-24 align-middle font-nunito-sans text-black md:px-32`}
            >
                <div className="flex flex-col items-center justify-center gap-y-12 align-middle">
                    <div className="flex items-center justify-center gap-24 align-middle">
                        <div className="mb-8 flex w-full max-w-sm flex-col items-center gap-6">
                            <Image
                                className="mb-6 w-16"
                                src={Icon}
                                alt="Mind logo"
                            />
                            <h1 className="text-5xl font-bold">
                                Entre em contato
                            </h1>
                            <p className="text-lg text-slate-500">
                                Para pedidos a cerca de alterações ou exclusão
                                de contas, informe seu CPF e e-mail cadastrado.
                            </p>
                            <div className="flex items-center gap-6 align-middle">
                                <Link href="mailto:contact@getmind.app">
                                    <div className="group duration-200">
                                        <div className="flex items-center gap-1.5 text-xl">
                                            <p>Fale conosco</p>
                                            <div className="hidden items-center transition-transform duration-500 group-hover:translate-x-1 md:block">
                                                <BsArrowRightShort size={28} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Home;
