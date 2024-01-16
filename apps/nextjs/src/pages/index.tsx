import type { NextPage } from "next";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRightShort } from "react-icons/bs";
import { HiOutlineCalendar, HiOutlineCash, HiSearch } from "react-icons/hi";

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
    return (
        <>
            <Head>
                <title>Mind</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="shortcut icon" href="/favicon.ico" />
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
                                Therapy made easy, <br />{" "}
                                <span className="text-blue-500">
                                    for everyone
                                </span>
                            </h1>
                            <p className="text-lg text-slate-500">
                                Mind helps you to find the best therapist,
                                schedule
                                <br /> appointments and pay for them. See our{" "}
                                <a
                                    href="https://getmind.app/privacy"
                                    className="text-slate-800 duration-500 hover:text-slate-500"
                                >
                                    privacy policy
                                </a>
                                .
                            </p>

                            <div className="flex items-center gap-6 align-middle">
                                <Link href="https://www.youtube.com/watch?v=EuF4Mvld-Kc&ab_channel=GustavoFior">
                                    <button className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-400">
                                        Quick demo
                                    </button>
                                </Link>
                                <Link href="mailto:contact@getmind.app">
                                    <div className="group duration-200">
                                        <div className="flex items-center gap-1.5">
                                            <p>Talk to us</p>
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
                    {/* <div className="flex items-center justify-center gap-4">
                        <div className="flex w-[23rem] flex-col gap-6">
                            <HiSearch size={40} color="#3b82f6" />

                            <h2 className="text-3xl font-bold">Searching</h2>
                            <p className="w-[18rem] text-lg text-slate-500">
                                We know that finding a therapist can be hard.
                                Here you can filter by price, location and more.
                            </p>
                        </div>
                        <div className="flex w-[23rem] flex-col gap-6">
                            <HiOutlineCalendar size={40} color="#3b82f6" />

                            <h2 className="text-3xl font-bold">Scheduling</h2>
                            <p className="w-[18rem] text-lg text-slate-500">
                                See all of your appointments in one place. You
                                can schedule, reschedule and cancel like a
                                breeze.
                            </p>
                        </div>
                        <div className="flex w-[23rem] flex-col gap-6">
                            <HiOutlineCash size={40} color="#3b82f6" />
                            <h2 className="text-3xl font-bold">Payment</h2>
                            <p className="w-[18rem] text-lg text-slate-500">
                                Still paying after every session? <br />
                                Just add your card and we will take care of the
                                rest.
                            </p>
                        </div>
                    </div> */}
                </div>
                <div className="hidden md:block">
                    <p className="text-center text-lg md:pb-2">Available on</p>
                    <div className="flex items-center gap-2">
                        <Link href="https://apps.apple.com/us/app/mind/id6467673373">
                            <div className="transition duration-300 hover:opacity-70">
                                <Image
                                    className="w-24 md:w-36"
                                    src={AppStore}
                                    alt="App store"
                                />
                            </div>
                        </Link>
                        <Link href="https://play.google.com/store/apps/details?id=app.getmind">
                            <div className="transition duration-300 hover:opacity-70">
                                {" "}
                                <Image
                                    className="w-28 md:w-40"
                                    src={PlayStore}
                                    alt="Play store"
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Home;
