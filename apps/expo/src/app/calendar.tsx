import { useEffect, useState } from "react";
import {
    Image,
    LayoutAnimation,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { CardSkeleton } from "../components/CardSkeleton";
import DefaultCard from "../components/DefaultCard";
import { api } from "../utils/api";
import {
    type Appointment,
    type AppointmentStatus,
    type Patient,
    type Therapist,
} from ".prisma/client";

export default function CalendarScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useUser();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const {
        data: appointments,
        isLoading,
        refetch,
        isError,
    } = api.appointments.findAll.useQuery();

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    };

    useEffect(() => {
        if (refreshing) {
            refetch;
        }
    }, [refreshing]);

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
            <View>
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
        <ScrollView
            className="bg-off-white px-4 pt-12"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text className="pt-12 font-nunito-sans-bold text-3xl">
                <Trans>Calendar</Trans>
            </Text>
            {children}
        </ScrollView>
    );
}

function EmptyState() {
    const router = useRouter();
    return (
        <View className="rounded-xl bg-white">
            <View className="px-6 pt-6">
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
            <TouchableOpacity onPress={() => router.push("/search")}>
                <View className="mt-6 flex w-full flex-row items-center justify-center rounded-b-xl bg-blue-500 py-3 align-middle">
                    <FontAwesome size={16} color="white" name="search" />
                    <Text className="ml-4 font-nunito-sans-bold text-lg text-white">
                        <Trans>Therapists</Trans>
                    </Text>
                </View>
            </TouchableOpacity>
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

    return (
        <View
            key={appointment.id}
            className="my-2 rounded-xl bg-white p-6 shadow-sm"
        >
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
                    <Text className="font-nunito-sans text-xl">
                        {new Intl.DateTimeFormat("en", {
                            weekday: "long",
                        }).format(new Date(appointment.scheduledTo))}
                        , {new Date(appointment.scheduledTo).getDate()}/
                        {new Date(appointment.scheduledTo).getMonth() + 1}
                    </Text>
                    <View className="flex flex-row">
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            <Trans>with</Trans>
                            {"  "}
                        </Text>
                            <Image
                                className="rounded-full"
                                alt={`${appointment.therapist.name}'s profile picture`}
                                source={{
                                    uri:
                                    user?.publicMetadata.role == "professional"
                                        ? appointment.patient.profilePictureUrl
                                            : appointment.therapist
                                                  .profilePictureUrl,
                                    width: 20,
                                    height: 20,
                                }}
                            />
                            <Text className="font-nunito-sans text-sm text-slate-500">
                                {"  "}
                                {appointment.therapist.name}{" "}
                                {appointment.modality === "ONLINE"
                                    ? t({ message: "via Google Meet" })
                                    : t({ message: "in person" })}
                            </Text>
                    </View>
                    {user?.publicMetadata.role == "professional" &&
                        appointment.status == "ACCEPTED" && (
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
                <View
                    style={{
                        flex: 1,
                    }}
                >
                    <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
                        {new Date(appointment.scheduledTo).getHours()}:
                        {new Date(appointment.scheduledTo).getMinutes() == 0
                            ? "00"
                            : new Date(appointment.scheduledTo).getMinutes()}
                    </Text>
                    {appointment.status == "PENDENT" ||
                    (appointment.status == "ACCEPTED" &&
                        metadata.role == "professional") ||
                    (appointment.status == "ACCEPTED" &&
                        isMoreThan24HoursLater(appointment.scheduledTo)) ? (
                        <Pressable onPress={() => setOpen(!open)}>
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
                        </Pressable>
                    ) : null}
                </View>
            </View>
            {open ? (
                <View className="mt-2 border-t-2 border-slate-500/10">
                    {metadata.role == "professional" ? (
                        <TherapistOptions appointment={appointment} />
                    ) : (
                        <PatientOptions appointment={appointment} />
                    )}
                </View>
            ) : null}
        </View>
    );
}

function TherapistOptions({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    return (
        <View className="flex flex-col gap-2 pl-2 pt-2">
            {appointment.status === "ACCEPTED" ? (
                <PaymentConfirmation appointment={appointment} />
            ) : null}
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
    const acceptedAndMoreThan24Hours =
        appointment.status === "ACCEPTED" &&
        isMoreThan24HoursLater(appointment.scheduledTo);

    if (acceptedAndMoreThan24Hours) {
        return <SessionCancel appointment={appointment} />;
    }

    return null;
}

function PaymentConfirmation({
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

    const handlePaymentConfirmation = () => {
        mutate({
            id: appointment.id,
            scheduledTo: appointment.scheduledTo,
            modality: appointment.modality,
            status: appointment.status,
            isPaid: !appointment.isPaid,
            therapistId: appointment.therapistId,
            patientId: appointment.patientId,
        });
    };

    return (
        <View className="flex flex-row items-center pt-4 align-middle">
            <Text className="text-base">
                <Trans>Check as paid?</Trans>
            </Text>
            <View className="pl-3">
                <TouchableOpacity
                    onPress={() => {
                        handlePaymentConfirmation();
                    }}
                >
                    {appointment.isPaid ? (
                        <View className="rounded-lg bg-red-400 shadow-sm">
                            <Text className="px-3 py-1 text-white">No</Text>
                        </View>
                    ) : (
                        <View className="rounded-lg bg-green-400 shadow-sm">
                            <Text className="px-3 py-1 text-white">Yes</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
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
        color: "yellow-400",
        circleColor: "yellow",
    },
    REJECTED: {
        color: "red-400",
        circleColor: "red",
    },
    CANCELED: {
        color: "red-400",
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

function isMoreThan24HoursLater(dateToCheck: string | Date): boolean {
    const currentDate = new Date();
    const targetDate = new Date(dateToCheck);

    // Calculate the difference in hours between the two dates
    const timeDifferenceInHours =
        (targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);

    return timeDifferenceInHours > 24;
}
