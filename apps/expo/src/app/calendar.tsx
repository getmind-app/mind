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
            {isLoading ? <CardSkeleton /> : null}
            {appointments && appointments.length > 0 ? (
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
            ) : (
                <DefaultCard />
            )}
        </ScrollView>
    );
}

function AppointmentCard({
    appointment,
    metadata,
}: {
    appointment: Appointment & { therapist: Therapist } & { patient: Patient };
    metadata: UserPublicMetadata;
}) {
    const [open, setOpen] = useState<boolean>(false);
    const { user } = useUser();

    return (
        <View
            key={appointment.id}
            className="my-2 rounded-xl bg-white p-6 shadow-sm"
        >
            <View className="flex flex-row justify-between">
                <View className="flex flex-col gap-1">
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
                <View className="flex flex-col items-center gap-4">
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
    return appointment.status === "ACCEPTED" &&
        isMoreThan24HoursLater(appointment.scheduledTo) ? (
        <SessionCancel appointment={appointment} />
    ) : null;
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

function Status({ status }: { status: AppointmentStatus }) {
    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case "ACCEPTED":
                return "text-green-600";
            case "PENDENT":
                return "text-yellow-400";
            case "REJECTED" || "CANCELED":
                return "text-red-400";
            default:
                return "text-blue-400";
        }
    };

    // awful approach

    const getCircleColor = (status: AppointmentStatus) => {
        switch (status) {
            case "ACCEPTED":
                return "green";
            case "PENDENT":
                return "yellow";
            case "REJECTED" || "CANCELED":
                return "red";
            default:
                return "blue";
        }
    };

    const textColor = getStatusColor(status);
    const circleColor = getCircleColor(status);

    return (
        <View className="flex flex-row items-center pl-1 align-middle">
            <FontAwesome size={12} name="circle" color={circleColor} />
            <Text
                className={`${textColor} pl-2 font-nunito-sans-bold text-base`}
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
