import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useLingui } from "@lingui/react";
import { format } from "date-fns";

import { type Note } from "../../../../packages/db";
import { getLocale } from "../helpers/getLocale";
import { BasicText } from "./BasicText";
import { Card } from "./Card";

export function NoteCard({ note }: { note: Note }) {
    const lingui = useLingui();

    return (
        <Card>
            <View className="flex w-full flex-row items-center justify-between align-middle">
                <View className="flex w-64 flex-col">
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 8,
                        }}
                    >
                        <BasicText
                            color="primaryBlue"
                            fontWeight="bold"
                            size="2xl"
                        >
                            {note.createdAt.getDate()}
                        </BasicText>
                        <BasicText color="gray" fontWeight="bold" size="2xl">
                            {format(note.createdAt, "LLLL", {
                                locale: getLocale(lingui),
                            })}
                        </BasicText>
                    </View>
                    <BasicText size="lg">{note.content}</BasicText>
                </View>
                <TouchableOpacity
                    onPress={() => router.push("/home/notes/" + note.id)}
                >
                    <MaterialIcons
                        size={32}
                        name="chevron-right"
                        color="#3b82f6"
                    />
                </TouchableOpacity>
            </View>
        </Card>
    );
}
