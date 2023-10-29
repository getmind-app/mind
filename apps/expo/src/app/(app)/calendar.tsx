import { useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    RefreshControl,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { Card } from "../../components/Card";
import { CardSkeleton } from "../../components/CardSkeleton";
import { Refreshable } from "../../components/Refreshable";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Title } from "../../components/Title";
import { getShareLink } from "../../helpers/getShareLink";
import { isMoreThan24HoursLater } from "../../helpers/isMoreThan24HoursLater";
import { useUserIsProfessional } from "../../hooks/user/useUserIsProfessional";
import { api } from "../../utils/api";
import {
    type Appointment,
    type AppointmentStatus,
    type Patient,
    type Therapist,
} from ".prisma/client";

export default function CalendarScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const utils = api.useContext();
    const { user } = useUser();

    const {
        data: appointments,
        isLoading,
        isError,
    } = api.appointments.findAll.useQuery();

    const onRefresh = async () => {
        setRefreshing(true);
        await utils.appointments.findAll.invalidate();
        setRefreshing(false);
    };

    if (isLoading) {
        return (
            <BaseLayout refreshing={refreshing} onRefresh={onRefresh}>
                <CardSkeleton />
            </BaseLayout>
        );
    }

    if (isError) {
        return (
            <BaseLayout refreshing={refreshing} onRefresh={onRefresh}>
                <AppointmentCardError />
            </BaseLayout>
        );
    }

    if (!appointments || appointments.length === 0) {
        return (
            <BaseLayout refreshing={refreshing} onRefresh={onRefresh}>
                <EmptyState />
            </BaseLayout>
        );
    }

    return (
        <BaseLayout refreshing={refreshing} onRefresh={onRefresh}>
            <View className="pb-20">
                {appointments.map((appoinment) =>
                    user ? (
                        <AppointmentCard
                            key={appoinment.id}
                            appointment={appoinment}
                            metadata={user.publicMetadata}
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
        <ScreenWrapper>
            <Refreshable
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <Title title={t({ message: "Calendar" })} />
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
        <View className="mt-4 rounded-xl bg-white shadow-sm">
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

function AppointmentCard({
    appointment,
    metadata,
}: {
    appointment: Appointment & { therapist: Therapist } & { patient: Patient };
    metadata: UserPublicMetadata;
}) {
    const [open, setOpen] = useState(false);
    const { user } = useUser();
    const isProfessional = useUserIsProfessional();

    return (
        <Card key={appointment.id}>
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
                    <Status status={appointment.status} />
                    <Text className="pt-2 font-nunito-sans text-xl">
                        {new Intl.DateTimeFormat("en", {
                            weekday: "long",
                        }).format(new Date(appointment.scheduledTo))}
                        , {new Date(appointment.scheduledTo).getDate()}/
                        {new Date(appointment.scheduledTo).getMonth() + 1}
                    </Text>
                    <View className="flex flex-row pt-2">
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            <Trans>with</Trans>
                            {"  "}
                        </Text>
                        <Image
                            className="rounded-full"
                            alt={`${appointment.therapist.name}'s profile picture`}
                            source={{
                                uri: isProfessional
                                    ? appointment.patient.profilePictureUrl
                                    : appointment.therapist.profilePictureUrl,
                                width: 20,
                                height: 20,
                            }}
                        />
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {"  "}
                            {isProfessional
                                ? appointment.patient.name
                                : appointment.therapist.name}{" "}
                            {appointment.modality === "ONLINE"
                                ? t({ message: "via Google Meet" })
                                : t({ message: "in person" })}
                        </Text>
                    </View>
                    {isProfessional && appointment.status == "ACCEPTED" && (
                        <View>
                            <Text
                                className={`fontnunito-sans pt-2 ${
                                    appointment.isPaid
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            >
                                {appointment.isPaid ? "Paid" : "Not paid"}
                            </Text>
                        </View>
                    )}
                </View>
                <View className=" flex flex-col items-center justify-between">
                    <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
                        {new Date(appointment.scheduledTo).getHours()}:
                        {new Date(appointment.scheduledTo).getMinutes() == 0
                            ? "00"
                            : new Date(appointment.scheduledTo).getMinutes()}
                    </Text>
                    {(appointment.status == "PENDENT" && isProfessional) ||
                    (appointment.status == "ACCEPTED" &&
                        isMoreThan24HoursLater(appointment.scheduledTo) &&
                        !isProfessional) ? (
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
                    {metadata.role == "professional" ? (
                        <TherapistOptions appointment={appointment} />
                    ) : (
                        <PatientOptions appointment={appointment} />
                    )}
                </View>
            ) : null}
        </Card>
    );
}

function TherapistOptions({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    return (
        <View className="flex flex-col gap-2 pl-2 pt-2">
            {appointment.status === "PENDENT" ? (
                <SessionConfirmation appointment={appointment} />
            ) : null}
        </View>
    );
}

function PatientOptions({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    if (
        appointment.status === "ACCEPTED" &&
        isMoreThan24HoursLater(appointment.scheduledTo)
    )
        return <SessionCancel appointment={appointment} />;

    return null;
}

function SessionConfirmation({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    const utils = api.useContext();

    const { mutate } = api.appointments.update.useMutation({
        onSuccess: async () => {
            await utils.appointments.findAll.invalidate();
        },
    });

    const handleSessionConfirmation = (newStatus: AppointmentStatus) => {
        mutate({
            id: appointment.id,
            scheduledTo: appointment.scheduledTo,
            modality: appointment.modality,
            status: newStatus,
            isPaid: appointment.isPaid,
            therapistId: appointment.therapistId,
            patientId: appointment.patientId,
        });
    };

    return (
        <View className="flex flex-row items-center pt-4 align-middle">
            <Text className="text-base">
                <Trans>Accept the session?</Trans>
            </Text>
            <View className="flex flex-row gap-2 pl-3">
                <TouchableOpacity
                    onPress={() => {
                        handleSessionConfirmation("ACCEPTED");
                    }}
                >
                    <View className="rounded-lg bg-green-400 shadow-sm">
                        <Text className="px-3 py-2 text-white">
                            <Trans>Yes</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        handleSessionConfirmation("REJECTED");
                    }}
                >
                    <View className="rounded-lg bg-red-400 shadow-sm">
                        <Text className="px-3 py-2 text-white">
                            <Trans>No</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function SessionCancel({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    const utils = api.useContext();
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate } = api.appointments.update.useMutation({
        onSuccess: async () => {
            await utils.appointments.findAll.invalidate();
        },
    });

    const handleSessionCancel = () => {
        mutate({
            id: appointment.id,
            scheduledTo: appointment.scheduledTo,
            modality: appointment.modality,
            status: "CANCELED",
            isPaid: appointment.isPaid,
            therapistId: appointment.therapistId,
            patientId: appointment.patientId,
        });
    };

    // TODO: make modal a component, prettify it and add some transparency to the background (bg-opacity-x does not work idk why)
    return (
        <>
            <Modal animationType="fade" transparent visible={modalVisible}>
                <TouchableWithoutFeedback
                    onPress={() => setModalVisible(false)}
                >
                    <View className="flex h-full flex-col items-center justify-center bg-off-white align-middle">
                        <View className="w-72 items-center gap-4 rounded-lg bg-white px-6 py-4 align-middle shadow-sm">
                            <Text className="font-nunito-sans-bold text-2xl">
                                <Trans>Are you sure?</Trans>
                            </Text>
                            <Pressable
                                className="rounded-lg bg-red-400 "
                                onPress={() => {
                                    handleSessionCancel();
                                    setModalVisible(false);
                                }}
                            >
                                <Text className="px-6 py-3 text-center font-nunito-sans-bold text-lg text-white">
                                    <Trans>Cancel</Trans>
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <View className="flex flex-row items-center pt-4 align-middle">
                <Text className="text-base">
                    <Trans>Cancel the session?</Trans>
                </Text>
                <View className="pl-3">
                    <TouchableOpacity
                        onPress={() => {
                            setModalVisible(true);
                        }}
                    >
                        <View className="rounded-lg bg-red-400 shadow-sm">
                            <Text className="px-3 py-2 text-white">
                                <Trans>Yes</Trans>
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const statusMapper: {
    [key in AppointmentStatus]: {
        color: string;
        circleColor: string;
    };
} = {
    ACCEPTED: {
        color: "green-600",
        circleColor: "green",
    },
    PENDENT: {
        color: "yellow-300",
        circleColor: "yellow",
    },
    REJECTED: {
        color: "red-500",
        circleColor: "red",
    },
    CANCELED: {
        color: "red-500",
        circleColor: "red",
    },
};

function Status({ status }: { status: AppointmentStatus }) {
    const textColor = statusMapper[status].color;
    const circleColor = statusMapper[status].circleColor;

    return (
        <View className="flex flex-row items-center align-middle">
            <FontAwesome size={12} name="circle" color={circleColor} />
            <Text
                className={`text-${textColor} pl-2 font-nunito-sans-bold text-base`}
            >
                {status}
            </Text>
        </View>
    );
}
