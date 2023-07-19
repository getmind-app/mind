import type { NextPage } from "next";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRightShort } from "react-icons/bs";

import AppStore from "../../assets/app_store.png";
import PlayStore from "../../assets/google_play.png";
import Icon from "../../assets/icon.png";
import Mockup from "../../assets/mock-hd.png";

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
        className={`${nunitoSans.variable} flex h-screen flex-col items-center justify-center bg-off-white px-32 align-middle font-nunito-sans text-black`}
      >
        <div className="flex items-center justify-center gap-24 align-middle">
          <div className="mb-4 flex flex-col gap-6">
            <Image
              className="mb-6"
              width={48}
              height={48}
              src={Icon}
              alt="Mind logo"
            />
            <h2 className="text-5xl font-bold">
              Therapy made easy, <br />{" "}
              <span className="text-blue-500">for everyone</span>
            </h2>
            <p className="text-lg text-slate-500">
              Mind helps you to find the best therapist, schedule
              <br /> appointments and pay for them.
            </p>
            <div className="flex items-center gap-8 align-middle">
              <Link href="https://drive.google.com/file/d/17eLDNSTf1d6JOi_rno87TqVCkSjuFAf4/view?usp=drive_link">
                <button className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-400">
                  Quick demo
                </button>
              </Link>
              <Link href="mailto:contact@getmind.app">
                <div className="group duration-200">
                  <div className="flex items-center gap-1.5">
                    <p>Talk to us</p>
                    <div className="flex items-center transition-transform duration-500 group-hover:translate-x-1">
                      <BsArrowRightShort size={24} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div>
            <Image
              width={540}
              height={540}
              src={Mockup}
              alt="Mind app mockups"
            />
          </div>
        </div>
        <div>
          <p className="pb-2 text-center text-lg">Soon on</p>
          <div className="flex items-center gap-2">
            <div>
              <Image width={120} height={120} src={AppStore} alt="App store" />
            </div>
            <div>
              <Image
                width={136}
                height={136}
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
