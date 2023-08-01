import { useEffect, useState } from "react";
import {
    Image,
    LayoutAnimation,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Feather, FontAwesome } from "@expo/vector-icons";

import { CardSkeleton } from "../components/CardSkeleton";
import DefaultCard from "../components/DefaultCard";
import { api } from "../utils/api";
import {
    type Appointment,
    type AppointmentStatus,
    type Therapist,
} from ".prisma/client";

export default function CalendarScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useUser();
    const { data, isLoading, refetch } = api.appointments.findByUserId.useQuery(
        {
            userId: String(user?.id),
        },
    );

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    };

    useEffect(() => {
        if (refreshing) {
            refetch();
        }
    }, [refreshing, refetch]);

    return (
        <ScrollView
            className="bg-off-white px-4 pt-12"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text className="pt-12 font-nunito-sans-bold text-3xl">
                Calendar
            </Text>
            <Appointments data={data ? data : []} isLoading={isLoading} />
        </ScrollView>
    );
}

function Appointments({
    data,
    isLoading,
}: {
    data: (Appointment & { therapist: Therapist })[];
    isLoading: boolean;
}) {
    const { user } = useUser();

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (isLoading) return <CardSkeleton />;

    return (data && data.length) > 0 ? (
        <View>
            {data.map((appoinment) =>
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
    );
}

function AppointmentCard({
    appointment,
    metadata,
}: {
    appointment: Appointment & { therapist: Therapist };
    metadata: UserPublicMetadata;
}) {
    const [open, setOpen] = useState<boolean>(false);

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
                            with{"  "}
                        </Text>
                        <Image
                            className="rounded-full"
                            alt={`${appointment.therapist.name}'s profile picture`}
                            source={{
                                uri: appointment.therapist.profilePictureUrl,
                                width: 20,
                                height: 20,
                            }}
                        />
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {"  "}
                            {appointment.modality === "ONLINE"
                                ? "via Google Meet"
                                : "in person"}
                        </Text>
                    </View>
                </View>
                <View className="flex flex-col items-center gap-4">
                    <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
                        {new Date(appointment.scheduledTo).getHours()}:
                        {new Date(appointment.scheduledTo).getMinutes() == 0
                            ? "00"
                            : new Date(appointment.scheduledTo).getMinutes()}
                    </Text>
                    {(metadata &&
                        metadata.role == "professional" &&
                        appointment.status == "PENDENT") ||
                    appointment.status == "ACCEPTED" ? (
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
            {open ? <TherapistOptions appointment={appointment} /> : null}
        </View>
    );
}

function TherapistOptions({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    return (
        <View className="flex flex-col gap-2 pl-2 pt-4">
            {appointment.status === "ACCEPTED" ? (
                <PaymentConfirmation appointment={appointment} />
            ) : null}
            {appointment.status === "PENDENT" ? (
                <SessionConfirmation appointment={appointment} />
            ) : null}
        </View>
    );
}

function PaymentConfirmation({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    const [isPaid, setIsPaid] = useState<boolean>(appointment.isPaid);

    const { mutate } = api.appointments.update.useMutation({});

    const handlePaymentConfirmation = () => {
        mutate({
            id: appointment.id,
            scheduledTo: appointment.scheduledTo,
            modality: appointment.modality,
            status: appointment.status,
            isPaid: isPaid,
            therapistId: appointment.therapistId,
            userId: appointment.userId,
        });
    };

    return (
        <View className="flex flex-row items-center pt-4 align-middle">
            <Text className="text-base">The patient paid?</Text>
            <View className="pl-3">
                <Pressable
                    onPress={() => {
                        setIsPaid(!isPaid);
                        handlePaymentConfirmation();
                    }}
                >
                    {isPaid ? (
                        <Feather size={24} name="check-circle" color="green" />
                    ) : (
                        <Feather size={24} name="x-circle" color="red" />
                    )}
                </Pressable>
            </View>
        </View>
    );
}

function SessionConfirmation({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    const { mutate } = api.appointments.update.useMutation({});

    const utils = api.useContext();

    const handleSessionConfirmation = async (newStatus: AppointmentStatus) => {
        mutate({
            id: appointment.id,
            scheduledTo: appointment.scheduledTo,
            modality: appointment.modality,
            status: newStatus,
            isPaid: appointment.isPaid,
            therapistId: appointment.therapistId,
            userId: appointment.userId,
        });

        await utils.appointments.findByUserId.invalidate();
    };

    return (
        <View className="flex flex-row items-center pt-4 align-middle">
            <Text className="text-base">Accept the session?</Text>
            <View className="flex flex-row gap-2 pl-3">
                <TouchableOpacity
                    onPress={() => {
                        handleSessionConfirmation("ACCEPTED");
                    }}
                >
                    <View className="rounded-lg bg-green-400 shadow-sm">
                        <Text className="px-3 py-2 text-white">Yes</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        handleSessionConfirmation("REJECTED");
                    }}
                >
                    <View className="rounded-lg bg-red-400 shadow-sm">
                        <Text className="px-3 py-2 text-white">No</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
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
