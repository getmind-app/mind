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
                <title>Política de Privacidade - Mind</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main
                className={`${nunitoSans.variable} flex min-h-screen flex-col items-center justify-center px-8 py-24 align-middle font-nunito-sans text-black md:px-32`}
            >
                <div className="flex flex-col items-center justify-center gap-y-12 align-middle">
                    <div className="flex items-center justify-center gap-24 align-middle">
                        <div className="mb-8 flex w-full max-w-xl flex-col items-center gap-6">
                            <Image
                                className="mb-6 w-16"
                                src={Icon}
                                alt="Mind logo"
                            />
                            <h1 className="text-3xl font-bold">
                                POLÍTICA DE PRIVACIDADE DA MIND
                            </h1>
                            <small className="text-slate-700">
                                Última atualização: 23/09/2023
                            </small>
                            <h2 className="justify-start text-left text-xl text-slate-800">
                                1. INTRODUÇÃO
                            </h2>
                            <p className="text-lg text-slate-500">
                                O aplicativo Mind ("nós", "nosso") respeita a
                                privacidade de seus usuários ("você", "seu") e
                                se compromete a proteger suas informações
                                pessoais. Esta Política de Privacidade explica
                                como coletamos, usamos, compartilhamos e
                                protegemos suas informações pessoais quando você
                                usa nosso aplicativo. Ao usar nosso aplicativo,
                                você concorda com a coleta, uso e
                                compartilhamento de suas informações pessoais
                                conforme descrito nesta Política de Privacidade.
                            </p>
                            <h2 className="text-xl text-slate-800">
                                2. COLETA DE INFORMAÇÕES
                            </h2>
                            <h3 className="text-lg text-slate-800">
                                2.1. Para Terapeutas
                            </h3>
                            <div className="text-lg text-slate-500">
                                <p>
                                    Quando você se cadastra como terapeuta em
                                    nosso aplicativo, coletamos as seguintes
                                    informações:
                                </p>
                                <ul className="list-inside list-disc">
                                    <li>Nome</li>
                                    <li>Data de Nascimento </li>
                                    <li>CPF </li>
                                    <li>Telefone </li>
                                    <li>
                                        Número do CRP (Conselho Regional de
                                        Psicologia)
                                    </li>
                                    <li>
                                        Endereço para atendimento pessoal (se
                                        aplicável)
                                    </li>
                                </ul>
                            </div>
                            <h3 className="text-lg text-slate-800">
                                2.2. Para Pacientes
                            </h3>
                            <p className="text-lg text-slate-500">
                                Para pacientes que utilizam os provedores de
                                autenticação da Apple e Google, coletamos as
                                informações fornecidas por esses provedores,
                                como nome e e-mail.
                            </p>
                            <h2 className="text-xl text-slate-800">
                                3. USO DE INFORMAÇÕES
                            </h2>
                            <div className="w-full text-lg text-slate-500">
                                <p>Usamos suas informações para:</p>
                                <ul className="list-inside list-disc">
                                    <li>Identificação de usuários</li>
                                    <li> Prevenção de fraudes</li>
                                    <li> Administração do sistema</li>
                                    <li>
                                        Comunicação entre paciente e terapeuta.
                                    </li>
                                </ul>
                            </div>
                            <h2 className="text-xl text-slate-800">
                                4. COMPARTILHAMENTO DE INFORMAÇÕES
                            </h2>
                            <div className="w-full text-lg text-slate-500">
                                <p>Compartilhamos suas informações com:</p>
                                <ul className="list-inside list-disc">
                                    <li>
                                        Terapeutas, para garantir sua segurança
                                    </li>
                                    <li>
                                        Processador de pagamentos, para fins de
                                        prevenção de fraudes financeiras.
                                    </li>
                                </ul>
                            </div>
                            <h2 className="text-xl text-slate-800">
                                5. ARMAZENAMENTO DE INFORMAÇÕES
                            </h2>
                            <p className="text-lg text-slate-500">
                                Suas informações serão armazenadas em nossos
                                bancos de dados, contratados através de serviços
                                terceiros, e são mantidas enquanto a conta do
                                usuário estiver ativa no aplicativo.
                            </p>
                            <h2 className="text-xl text-slate-800">
                                6. ACESSO, ALTERAÇÃO E EXCLUSÃO DE INFORMAÇÕES
                            </h2>
                            <p className="text-lg text-slate-500">
                                Você pode solicitar a alteração ou exclusão de
                                seus dados e conta em{" "}
                                <Link
                                    className="underline"
                                    target="_blank"
                                    href={"https://getmind.app/contact"}
                                >
                                    https://getmind.app/contact
                                </Link>
                                .
                            </p>
                            <h2 className="text-xl text-slate-800">
                                7. IDADE MÍNIMA
                            </h2>
                            <p className="text-lg text-slate-500">
                                O aplicativo é indicado para maiores de 18 anos,
                                apesar de não restringir seu acesso para
                                pacientes de menor idade.
                            </p>
                            <h2 className="text-xl text-slate-800">
                                8. ALTERAÇÕES NA POLÍTICA DE PRIVACIDADE
                            </h2>
                            <p className="text-lg text-slate-500">
                                Notificaremos os usuários sobre alterações nesta
                                Política de Privacidade por e-mail.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Home;
