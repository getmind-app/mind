import { ActivityIndicator, Image, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { useUserHasProfileImage } from "../hooks/user/useUserHasProfileImage";

export function UserPhoto({
    userId,
    alt,
    url,
    width = 32,
    height = 32,
    iconSize = 20,
}: {
    userId: string | null;
    alt: string;
    url?: string;
    width?: number;
    height?: number;
    iconSize?: number;
}) {
    const { data, isLoading } = useUserHasProfileImage({
        userId,
    });

    if (isLoading)
        return (
            <View
                className={`flex items-center justify-center rounded-full bg-slate-200`}
                style={{ width, height }}
            >
                <ActivityIndicator />
            </View>
        );

    if (!data?.ok)
        return (
            <View
                className={`flex items-center justify-center rounded-full bg-slate-200`}
                style={{ width, height }}
            >
                <AntDesign name="user" size={iconSize} />
            </View>
        );

    return (
        <Image
            className="flex items-center justify-center rounded-full"
            alt={alt}
            source={{
                uri: url ?? data.imageUrl,
                width,
                height,
            }}
        />
    );
}
