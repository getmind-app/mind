import { ScrollView } from "react-native";
import * as Linking from "expo-linking";
import { t } from "@lingui/macro";

import { BasicText } from "../../../components/BasicText";
import { Header } from "../../../components/Header";
import { ScreenWrapper } from "../../../components/ScreenWrapper";

export default function ContactPage() {
    return (
        <>
            <ScreenWrapper paddingTop={8}>
                <Header title={t({ message: "Talk to us" })} />
                <ScrollView
                    className="min-h-max"
                    showsVerticalScrollIndicator={false}
                >
                    <BasicText
                        size="lg"
                        color="gray"
                        style={{ paddingHorizontal: 4 }}
                    >
                        {t({
                            message: `If you have any questions or suggestions, 
                                we would love to hear from you.
                                `,
                        })}
                    </BasicText>
                    <BasicText
                        size="lg"
                        color="black"
                        style={{ paddingHorizontal: 4, paddingTop: 12 }}
                    >
                        {t({
                            message: `Feel free to reach out to us`,
                        })}

                        <BasicText
                            size="lg"
                            color="primaryBlue"
                            fontWeight="bold"
                        >
                            {" "}
                            {t({
                                message: `anytime! 😄`,
                            })}
                        </BasicText>
                    </BasicText>
                    <BasicText
                        size="lg"
                        color="black"
                        fontWeight="bold"
                        style={{ paddingHorizontal: 4, paddingTop: 24 }}
                    >
                        {t({
                            message: `Email:
                            `,
                        })}
                    </BasicText>
                    <BasicText
                        size="lg"
                        color="gray"
                        onPress={async () => {
                            await Linking.openURL("mailto:contact@getmind.app");
                        }}
                        style={{
                            paddingHorizontal: 4,
                            paddingTop: 4,
                            textDecorationLine: "underline",
                        }}
                    >
                        {t({
                            message: `
                            contact@getmind.app
                            `,
                        })}
                    </BasicText>
                    <BasicText
                        size="lg"
                        color="black"
                        fontWeight="bold"
                        style={{ paddingHorizontal: 4, paddingTop: 24 }}
                    >
                        {t({
                            message: `Founders WhatsApp:
                            `,
                        })}
                    </BasicText>
                    <BasicText
                        size="lg"
                        color="gray"
                        onPress={async () => {
                            await Linking.openURL(
                                "https://wa.me/5542988098933",
                            );
                        }}
                        style={{
                            paddingHorizontal: 4,
                            paddingTop: 4,
                            textDecorationLine: "underline",
                        }}
                    >
                        {t({
                            message: `
                            +55 42 98809-8933
                            `,
                        })}
                    </BasicText>
                    <BasicText
                        size="lg"
                        color="gray"
                        onPress={async () => {
                            await Linking.openURL(
                                "https://wa.me/5541992790302",
                            );
                        }}
                        style={{
                            paddingHorizontal: 4,
                            paddingTop: 8,
                            textDecorationLine: "underline",
                        }}
                    >
                        {t({
                            message: `
                            +55 41 99279-0302
                            `,
                        })}
                    </BasicText>
                </ScrollView>
            </ScreenWrapper>
        </>
    );
}
