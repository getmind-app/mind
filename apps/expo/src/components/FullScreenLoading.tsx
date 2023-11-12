import { View } from "react-native";

import { Header } from "./Header";
import { Loading } from "./Loading";

export function FullScreenLoading() {
    return (
        <>
            <Header />
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f8f8f8",
                }}
            >
                <Loading size={"large"} />
            </View>
        </>
    );
}
