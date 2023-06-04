import type { NextPage } from "next";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import Image from "next/image";

import AppIcon from "../../assets/app_icon.png";

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
        className={`${nunitoSans.variable} flex h-screen  flex-col items-center justify-center gap-8 bg-blue-400 font-nunito-sans text-white`}
      >
        <div className="flex gap-2">
          <div className="flex items-start justify-center">
            <Image src={AppIcon} width={64} height={64} alt="Mind app icon" />
          </div>
          <div>
            <h1 className="text-4xl">Mind</h1>
            <h2 className="text-lg">
              Schedule and payment management <br /> for therapy sessions
            </h2>
            <p className="text-sm">Coming soon to Android and iOS</p>
          </div>
        </div>

        <div className="flex w-full max-w-lg flex-col items-center justify-center gap-2">
          <h3 className="text-2xl">Meet the founders</h3>
          <div className="flex w-full justify-around">
            <div>
              <p className="text-center text-lg font-bold">Gustavo Fior</p>
              <a
                target="_blank"
                className="text-center"
                href="mailto:gustavo@getmind.app"
              >
                gustavo@getmind.app
              </a>
              <div className="flex justify-between">
                <a
                  target="_blank"
                  className="text-slate-300-500"
                  href="https://www.linkedin.com/in/gustavo-fior-a910781b4/"
                >
                  LinkedIn
                </a>
                <a
                  target="_blank"
                  className="text-slate-300-500"
                  href="https://github.com/gustavo-fior"
                >
                  GitHub
                </a>
              </div>
            </div>
            <div>
              <p className="text-center text-lg font-bold">Abdul Haidar</p>
              <a
                target="_blank"
                href="mailto:abdul@getmind.app"
                className="text-center"
              >
                abdul@getmind.app
              </a>
              <div className="flex justify-between">
                <a
                  target="_blank"
                  className="text-slate-300-500"
                  href="https://www.linkedin.com/in/abdulhdr/"
                >
                  LinkedIn
                </a>
                <a
                  target="_blank"
                  className="text-slate-300-500"
                  href="https://github.com/abdulhdr1"
                >
                  GitHub
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
