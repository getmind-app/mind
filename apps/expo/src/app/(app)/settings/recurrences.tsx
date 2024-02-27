import { useState } from "react";
import {
    Alert,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { format } from "date-fns";

import { BasicText } from "../../../components/BasicText";
import { Card } from "../../../components/Card";
import { CardSkeleton } from "../../../components/CardSkeleton";
import { Header } from "../../../components/Header";
import { LargeButton } from "../../../components/LargeButton";
import { Refreshable } from "../../../components/Refreshable";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { getShareLink } from "../../../helpers/getShareLink";
import { getTranslatedDay } from "../../../helpers/getTranslatedDay";
import { useUserRecurrences } from "../../../hooks/recurrence/useUserRecurrences";
import { useUserIsProfessional } from "../../../hooks/user/useUserIsProfessional";
import { api } from "../../../utils/api";
import { type Frequency, type RecurrenceStatus } from ".prisma/client";

type Recurrence = NonNullable<
    ReturnType<typeof useUserRecurrences>["data"]
>[number];

export default function RecurrencesScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const utils = api.useContext();
    const { user } = useUser();

    const recurrences = useUserRecurrences();

    const onRefresh = async () => {
        setRefreshing(true);
        await utils.recurrences.allUserRecurrences.invalidate();
        setRefreshing(false);
    };

    if (recurrences.isLoading) {
        return (
            <BaseLayout refreshing={refreshing} onRefresh={onRefresh}>
                <CardSkeleton />
            </BaseLayout>
        );
    }

    if (recurrences.isError) {
        console.log(recurrences.error);
        return (
            <BaseLayout refreshing={refreshing} onRefresh={onRefresh}>
                <AppointmentCardError />
            </BaseLayout>
        );
    }

    if (!recurrences.data || recurrences.data.length === 0) {
        return (
            <BaseLayout refreshing={refreshing} onRefresh={onRefresh}>
                <EmptyState />
            </BaseLayout>
        );
    }

    return (
        <BaseLayout refreshing={refreshing} onRefresh={onRefresh}>
            <View className="pb-20">
                {recurrences.data.map((recurrence) =>
                    user ? (
                        <RecurrenceCard
                            key={recurrence.id}
                            recurrence={recurrence}
                        />
                    ) : null,
                )}
            </View>
        </BaseLayout>
    );
}

function BaseLayout({
    refreshing,
    onRefresh,
    children,
}: {
    refreshing: boolean;
    onRefresh: () => void;
    children: React.ReactNode;
}) {
    return (
        <ScreenWrapper paddingTop={0}>
            <Refreshable
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <Header title={t({ message: "Recurrences" })} />
                {children}
            </Refreshable>
        </ScreenWrapper>
    );
}

function EmptyState() {
    const router = useRouter();
    const isProfessional = useUserIsProfessional();
    const therapist = api.therapists.findByUserId.useQuery();

    return (
        <View className="rounded-xl bg-white shadow-sm">
            <View className=" px-6 pt-6">
                <Text className="font-nunito-sans text-lg">
                    <Trans>Your appointments will show up here</Trans>
                </Text>
                <Text className="font-nunito-sans text-sm text-slate-500">
                    <Trans>
                        Options for canceling and rescheduling will also be
                        available
                    </Trans>
                </Text>
            </View>
            {isProfessional ? (
                <TouchableOpacity
                    onPress={() =>
                        void getShareLink({
                            id: therapist.data?.id ?? "",
                            name: therapist?.data?.name.split(" ")[0] ?? "",
                        })
                    }
                >
                    <View className="mt-6 flex w-full flex-row items-center justify-center rounded-b-xl bg-blue-500 py-3 align-middle">
                        <MaterialIcons size={24} color="white" name="link" />
                        <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                            <Trans>Share your link</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={() => router.push("/search")}>
                    <View className="mt-6 flex w-full flex-row items-center justify-center rounded-b-xl bg-blue-500 py-3 align-middle">
                        <FontAwesome size={16} color="white" name="search" />
                        <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                            <Trans>Therapists</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

function AppointmentCardError() {
    return (
        <View>
            <Text className="font-nunito-sans text-xl">
                {t({ message: "Something went wrong" })}
            </Text>
        </View>
    );
}

function RecurrenceCard({ recurrence }: { recurrence: Recurrence }) {
    const [open, setOpen] = useState(false);
    const isProfessional = useUserIsProfessional();

    return (
        <Card key={recurrence.id}>
            <View
                style={{
                    flexDirection: "row",
                    flex: 1,
                }}
            >
                <View
                    style={{
                        flex: 3,
                    }}
                >
                    <Status status={recurrence.status} />
                    <TypeOfAppointment appointmentType={recurrence.frequency} />
                    <BasicText size="2xl">
                        {getTranslatedDay(recurrence.weekDay)} at{" "}
                        {format(recurrence.startTime, "HH:mm")} -{" "}
                        {format(recurrence.endTime, "HH:mm")}
                    </BasicText>
                    <View className="flex flex-row pt-2">
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {isProfessional
                                ? recurrence.patient.name
                                : recurrence.therapist.name}{" "}
                            {recurrence.defaultModality === "ONLINE"
                                ? t({ message: "via Google Meet" })
                                : t({ message: "in person" })}
                        </Text>
                    </View>
                    <BasicText>
                        <Trans>
                            Started in{" "}
                            {format(recurrence.startAt, "dd/MM/yyyy")}
                        </Trans>
                    </BasicText>
                </View>
                <View className=" flex flex-col items-center justify-between">
                    {recurrence.status === "ACCEPTED" ? (
                        <TouchableOpacity onPress={() => setOpen(!open)}>
                            {open ? (
                                <Feather
                                    size={24}
                                    color="#64748b"
                                    name="chevron-up"
                                />
                            ) : (
                                <Feather
                                    size={24}
                                    color="#64748b"
                                    name="chevron-down"
                                />
                            )}
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
            {open ? (
                <View className="mt-4 border-t-[1px] border-slate-500/10">
                    <Options recurrence={recurrence} />
                </View>
            ) : null}
        </Card>
    );
}

function Options({ recurrence }: { recurrence: Recurrence }) {
    return (
        <View className="flex flex-col gap-2 pl-2 pt-4">
            {recurrence.status === "ACCEPTED" ? (
                <CancelRecurrence recurrence={recurrence} />
            ) : null}
        </View>
    );
}

function CancelRecurrence({ recurrence }: { recurrence: Recurrence }) {
    const utils = api.useContext();

    const { mutateAsync, isLoading } =
        api.appointments.updateRecurrence.useMutation({
            onSuccess: async () => {
                await utils.recurrences.allUserRecurrences.invalidate();
                await utils.appointments.findAll.invalidate();
            },
        });

    const handleSessionCancel = async () => {
        await mutateAsync({
            recurrenceId: recurrence.id,
            status: "CANCELED",
        });
    };

    // TODO: make modal a component, prettify it and add some transparency to the background (bg-opacity-x does not work idk why)
    return (
        <LargeButton
            disabled={isLoading}
            color="red"
            onPress={() => {
                Alert.alert(
                    t({
                        message: "Confirm recurrence cancellation",
                    }),
                    t({
                        message: `This action can't be undone. 
                        All sessions in this recurrence will be canceled.`,
                    }),
                    [
                        {
                            text: t({ message: "Cancel" }),
                            style: "cancel",
                        },
                        {
                            text: t({ message: "Accept" }),
                            onPress: async () => {
                                await handleSessionCancel();
                            },
                        },
                    ],
                );
            }}
        >
            <Trans>{"Cancel recurrence"}</Trans>
        </LargeButton>
    );
}

function Status({ status }: { status: RecurrenceStatus }) {
    const statusMapper: {
        [key in RecurrenceStatus]: {
            color: string;
            circleColor: string;
            label: string;
        };
    } = {
        ACCEPTED: {
            color: "green-600",
            circleColor: "green",
            label: t({ message: "ACCEPTED" }),
        },
        PENDENT: {
            color: "yellow-300",
            circleColor: "yellow",
            label: t({ message: "PENDENT" }),
        },
        REJECTED: {
            color: "red-500",
            circleColor: "red",
            label: t({ message: "REJECTED" }),
        },
        CANCELED: {
            color: "red-500",
            circleColor: "red",
            label: t({ message: "CANCELED" }),
        },
    };
    const textColor = statusMapper[status].color;
    const circleColor = statusMapper[status].circleColor;
    const label = statusMapper[status].label;

    return (
        <View className="flex flex-row items-center align-middle">
            <FontAwesome size={12} name="circle" color={circleColor} />
            <Text
                className={`text-${textColor} pl-2 font-nunito-sans-bold text-base`}
            >
                {label}
            </Text>
        </View>
    );
}

function TypeOfAppointment({
    appointmentType,
}: {
    appointmentType: Frequency;
}) {
    const frequencyMapper: {
        [key in Frequency]: string;
    } = {
        BIWEEKLY: t({ message: "Biweekly" }),
        CUSTOM: t({ message: "Custom" }),
        MONTHLY: t({ message: "Monthly" }),
        WEEKLY: t({ message: "Weekly" }),
    };

    return (
        <BasicText color="black">{frequencyMapper[appointmentType]}</BasicText>
    );
}
