import type { NextPage } from "next";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRightShort } from "react-icons/bs";
import { HiOutlineCalendar, HiOutlineCash, HiSearch } from "react-icons/hi";

import Icon from "../../assets/icon.png";
import Mockup from "../../assets/render.png";

const nunitoSans = Nunito_Sans({
    subsets: ["latin"],
    variable: "--font-nunito-sans",
    weight: ["400", "700"],
});

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>Mind</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main
                className={`${nunitoSans.variable} flex flex-col items-center justify-center px-8 py-24 align-middle font-nunito-sans text-black md:px-32`}
            >
                <div className="flex flex-col items-center justify-center gap-y-12 align-middle">
                    <div className="flex items-center justify-center gap-24 align-middle">
                        <div className="mb-8 flex flex-col gap-6">
                            <Image
                                className="mb-6 w-16"
                                src={Icon}
                                alt="Mind logo"
                            />
                            <h1 className="text-5xl font-bold">
                                Terapia mais fácil, <br />{" "}
                                <span className="text-blue-500">
                                    pra todo mundo
                                </span>
                            </h1>
                            <p className="text-lg text-slate-500">
                                A Mind te ajuda a encontrar o melhor terapeuta,
                                agendar
                                <br /> sessões e pagar por elas sem dor de
                                cabeça.
                            </p>
                            <div className="flex items-center gap-6 align-middle">
                                <Link href="https://www.youtube.com/watch?v=EuF4Mvld-Kc&ab_channel=GustavoFior">
                                    <button className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-400">
                                        Demonstração
                                    </button>
                                </Link>
                                <Link href="mailto:contact@getmind.app">
                                    <div className="group duration-200">
                                        <div className="flex items-center gap-1.5">
                                            <p>Fale com a gente</p>
                                            <div className="hidden items-center transition-transform duration-500 group-hover:translate-x-1 md:block">
                                                <BsArrowRightShort size={24} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Image
                                className="w-[36rem]"
                                src={Mockup}
                                alt="Mind app mockups"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex w-[23rem] flex-col gap-6">
                            <HiSearch size={40} color="#3b82f6" />

                            <h2 className="text-3xl font-bold">Busca</h2>
                            <p className="w-[18rem] text-lg text-slate-500">
                                Achar a pessoa certa é complicado. Aqui você
                                pode filtrar por preço, localização, método e
                                muito mais.
                            </p>
                        </div>
                        <div className="flex w-[23rem] flex-col gap-6">
                            <HiOutlineCalendar size={40} color="#3b82f6" />

                            <h2 className="text-3xl font-bold">Agendamento</h2>
                            <p className="w-[18rem] text-lg text-slate-500">
                                Escolha o melhor horário para você e agende
                                sessões sem precisar ligar ou mandar mensagem.
                            </p>
                        </div>
                        <div className="flex w-[23rem] flex-col gap-6">
                            <HiOutlineCash size={40} color="#3b82f6" />
                            <h2 className="text-3xl font-bold">Pagamento</h2>
                            <p className="w-[18rem] text-lg text-slate-500">
                                Pagar depois de cada sessão? Aqui você cadastra
                                seu cartão e nós cuidamos dos pagamentos!
                            </p>
                        </div>
                    </div>
                </div>
                {/* <div className="hidden md:block">
                    <p className="text-center text-lg md:pb-2">Soon on</p>
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
                </div> */}
            </main>
        </>
    );
};

export default Home;
