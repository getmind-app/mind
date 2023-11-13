import { useState } from "react";
import { RefreshControl } from "react-native";

import { Refreshable } from "./Refreshable";
import { ScreenWrapper } from "./ScreenWrapper";

type ScreenWrapperProps = Parameters<typeof ScreenWrapper>[0];
type RefreshableScreenWrapperProps = ScreenWrapperProps & {
    onRefresh: () => void;
};

export function RefreshableScreenWrapper({
    children,
    onRefresh,
    ...rest
}: RefreshableScreenWrapperProps) {
    const [refreshing, setRefreshing] = useState(false);

    return (
        <ScreenWrapper {...rest}>
            <Refreshable
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            onRefresh();
                            setRefreshing(false);
                        }}
                    />
                }
            >
                {children}
            </Refreshable>
        </ScreenWrapper>
    );
}
