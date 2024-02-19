import { TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { BasicText } from "./BasicText";

export function Warning({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action: () => void;
}) {
    return (
        <TouchableOpacity onPress={action}>
            <View
                style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    elevation: 2,
                    width: "100%",
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <AntDesign name="warning" size={24} color={"#f55353"} />
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "column",
                        }}
                    >
                        <BasicText size="lg" fontWeight="bold">
                            {title}
                        </BasicText>
                        <BasicText color="gray">{description}</BasicText>
                    </View>
                </View>
                <AntDesign name="right" size={16} color={"#f55353"} />
            </View>
        </TouchableOpacity>
    );
}
