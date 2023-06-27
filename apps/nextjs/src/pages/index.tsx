import type { NextPage } from "next";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import {
  FaAndroid,
  FaApple,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

import Abdul from "../../assets/abdul.jpeg";
import AppIcon from "../../assets/app_icon.png";
import Gustavo from "../../assets/gustavo2.jpg";

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
        className={`${nunitoSans.variable} flex h-screen flex-col items-center justify-center gap-8 bg-gradient-to-r from-[#202356] to-[#032b50] font-nunito-sans text-white`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-center">
            <Image src={AppIcon} width={64} height={64} alt="Mind app icon" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Mind</h1>
          </div>
        </div>
        <h2 className="text-center text-lg">
          Schedule and payment management <br /> for therapy sessions
        </h2>
        <a href="https://drive.google.com/file/d/17eLDNSTf1d6JOi_rno87TqVCkSjuFAf4/view?usp=drive_link">
          <div className="rounded-md bg-white px-4 py-2 font-bold text-blue-500 backdrop-blur-sm backdrop-filter hover:bg-off-white">
            Quick demo
          </div>
        </a>
        <div className="flex w-full max-w-lg flex-col items-center justify-center gap-2">
          <h3 className="text-2xl">Meet the founders</h3>
          <div className="flex w-full justify-center gap-12 pt-4">
            <div className="flex flex-col items-center gap-2">
              <Image
                className="rounded-full"
                width={64}
                height={64}
                src={Gustavo}
                alt="Gustavo Fior"
              />
              <p className="text-center text-lg font-bold">Gustavo Fior</p>
              <div className="flex justify-between gap-3">
                <a
                  target="_blank"
                  className="text-center transition duration-300 ease-in-out hover:text-slate-300"
                  href="mailto:gustavo@getmind.app"
                >
                  {<FaEnvelope />}
                </a>
                <a
                  target="_blank"
                  className="text-center transition duration-300 ease-in-out hover:text-slate-300"
                  href="https://www.linkedin.com/in/gustavo-fior-a910781b4/"
                >
                  {<FaLinkedin />}
                </a>
                <a
                  target="_blank"
                  className="text-center transition duration-300 ease-in-out hover:text-slate-300"
                  href="https://github.com/gustavo-fior"
                >
                  {<FaGithub />}
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Image
                className="rounded-full"
                width={64}
                height={64}
                src={Abdul}
                alt="Abdul Haidar"
              />
              <p className="text-center text-lg font-bold">Abdul Haidar</p>
              <div className="flex justify-between gap-3">
                <a
                  target="_blank"
                  className="text-center transition duration-300 ease-in-out hover:text-slate-300"
                  href="mailto:abdul@getmind.app"
                >
                  {<FaEnvelope />}
                </a>
                <a
                  target="_blank"
                  className="text-center transition duration-300 ease-in-out hover:text-slate-300"
                  href="https://www.linkedin.com/in/abdulhdr/"
                >
                  {<FaLinkedin />}
                </a>
                <a
                  target="_blank"
                  className="text-center transition duration-300 ease-in-out hover:text-slate-300"
                  href="https://github.com/abdulhdr1"
                >
                  {<FaGithub />}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
