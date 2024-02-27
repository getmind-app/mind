import { useState } from "react";
import {
    TouchableOpacity,
    View,
    type TouchableOpacityProps,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { MaterialIcons } from "@expo/vector-icons";
import { type Icon } from "@expo/vector-icons/build/createIconSet";

import { colors } from "../utils/colors";
import { BasicText } from "./BasicText";

interface CopyButtonProps extends TouchableOpacityProps {
    icon?: typeof MaterialIcons extends Icon<infer K, infer J> ? K : never;
    stringToCopy: string;
}

export function CopyButton({
    children,
    stringToCopy,
    icon = "content-copy",
    ...props
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handlePress() {
        try {
            if (!stringToCopy) {
                throw new Error("string not found");
            }

            await Clipboard.setStringAsync(stringToCopy);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2500);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <TouchableOpacity
            style={{
                marginTop: 10,
                width: "auto",
                padding: 4,
                alignSelf: "flex-start",
            }}
            onPress={handlePress}
            {...props}
        >
            <View
                style={{
                    width: "auto",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "row",
                    gap: 8,
                }}
            >
                <BasicText color="primaryBlue">
                    {copied ? (
                        <MaterialIcons
                            name="check"
                            size={16}
                            color={colors["green"]}
                        />
                    ) : (
                        <MaterialIcons size={16} name={icon} />
                    )}
                </BasicText>
                <BasicText
                    style={{
                        width: "auto",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                    }}
                    color={"primaryBlue"}
                >
                    {children}
                </BasicText>
            </View>
        </TouchableOpacity>
    );
}
