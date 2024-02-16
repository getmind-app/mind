import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import {
    AntDesign,
    Feather,
    FontAwesome,
    MaterialIcons,
} from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { useLingui, type I18nContext } from "@lingui/react";
import {
    add,
    endOfDay,
    endOfDecade,
    endOfWeek,
    format,
    isWithinInterval,
    startOfDay,
} from "date-fns";
import { enUS, ptBR } from "date-fns/locale";

import { BasicText } from "../../components/BasicText";
import { Card } from "../../components/Card";
import { CardSkeleton } from "../../components/CardSkeleton";
import { ExclusiveTagFilter } from "../../components/ExclusiveTagFilter";
import { LargeButton } from "../../components/LargeButton";
import { Refreshable } from "../../components/Refreshable";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Title } from "../../components/Title";
import { getShareLink } from "../../helpers/getShareLink";
import { isMoreThan24HoursLater } from "../../helpers/isMoreThan24HoursLater";
import { useUpdateRecurrence } from "../../hooks/recurrence/useUpdateRecurrence";
import { useUserHasProfileImage } from "../../hooks/user/useUserHasProfileImage";
import { useUserIsProfessional } from "../../hooks/user/useUserIsProfessional";
import { api } from "../../utils/api";
import {
    type Appointment,
    type AppointmentStatus,
    type AppointmentType,
    type Patient,
    type Therapist,
} from ".prisma/client";

function getLocale(lingui: I18nContext) {
    if (lingui.i18n.locale === "pt") return ptBR;
    return enUS;
}

type Period = "TODAY" | "TOMORROW" | "LATER_THIS_WEEK" | "ALL";

const todayEndOfDay = endOfDay(new Date());
const todayStartOfDay = startOfDay(new Date());

const periodToInterval: {
    [key in Period]: {
        start: Date;
        end: Date;
    };
} = {
    TODAY: {
        start: todayStartOfDay,
        end: todayEndOfDay,
    },
    TOMORROW: {
        start: add(todayStartOfDay, { days: 1 }),
        end: add(todayEndOfDay, { days: 1 }),
    },
    LATER_THIS_WEEK: {
        start: todayEndOfDay,
        end: endOfWeek(todayEndOfDay, { weekStartsOn: 1 }),
    },
    ALL: {
        start: todayStartOfDay,
        end: endOfDecade(todayEndOfDay),
    },
};

export default function CalendarScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const utils = api.useContext();
    const { user } = useUser();
    const [period, setPeriod] = useState<Period>("TODAY");

    const {
        data: appointments,
        isLoading,
        isError,
    } = api.appointments.findAll.useQuery();

    const filteredAppointment = useMemo(() => {
        if (!appointments) return [];
        return appointments.filter((appointment) =>
            isWithinInterval(
                new Date(appointment.scheduledTo),
                periodToInterval[period],
            ),
        );
    }, [appointments, period]);

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
            <View
                style={{
                    flex: 1,
                    flexDirection: "row",
                    gap: 8,
                }}
            >
                <ExclusiveTagFilter
                    onChange={(value) => setPeriod(value as Period)}
                    defaultValue="TODAY"
                    tags={[
                        {
                            label: t({ message: "Today" }),
                            value: "TODAY",
                        },
                        {
                            label: t({ message: "Tomorrow" }),
                            value: "TOMORROW",
                        },
                        {
                            label: t({ message: "Later this week" }),
                            value: "LATER_THIS_WEEK",
                        },
                        {
                            label: t({ message: "All" }),
                            value: "ALL",
                        },
                    ]}
                />
            </View>
            <View className="pb-20">
                {filteredAppointment.map((appoinment) =>
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
    const isProfessional = useUserIsProfessional();
    const lingui = useLingui();
    const patientCanCancel =
        appointment.status == "ACCEPTED" &&
        isMoreThan24HoursLater(appointment.scheduledTo) &&
        !isProfessional;

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
                    <TypeOfAppointment appointmentType={appointment.type} />
                    <Text className="pt-2 font-nunito-sans text-xl capitalize">
                        {format(
                            new Date(appointment.scheduledTo),
                            "EEEE, dd/MM",
                            {
                                locale: getLocale(lingui),
                            },
                        )}
                    </Text>
                    <View className="flex flex-row pt-2">
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            <Trans>with</Trans>
                            {"  "}
                        </Text>
                        <UserPhoto
                            appointment={appointment}
                            role={isProfessional ? "patient" : "therapist"}
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
                                {appointment.isPaid
                                    ? t({ message: "Paid" })
                                    : t({ message: "Not paid" })}
                            </Text>
                        </View>
                    )}
                </View>
                <View className=" flex flex-col items-center justify-between">
                    <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
                        {format(appointment.scheduledTo, "HH:mm")}
                    </Text>
                    {(appointment.status == "PENDENT" && isProfessional) ||
                    patientCanCancel ? (
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
        <View className="flex flex-col gap-2 pl-2 pt-4">
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
    const updateRecurrence = useUpdateRecurrence();

    const { mutateAsync, isLoading } = api.appointments.update.useMutation({
        onSuccess: async () => {
            await utils.appointments.findAll.invalidate();
        },
    });

    const handleSessionConfirmation = async (newStatus: AppointmentStatus) => {
        await mutateAsync({
            id: appointment.id,
            scheduledTo: appointment.scheduledTo,
            modality: appointment.modality,
            status: newStatus,
            isPaid: appointment.isPaid,
            therapistId: appointment.therapistId,
            patientId: appointment.patientId,
        });
    };

    const isMutating = isLoading || updateRecurrence.isLoading;

    return (
        <View
            style={{
                flex: 1,
                alignItems: "flex-start",
                gap: 12,
            }}
        >
            <Text
                style={{
                    flex: 1,
                }}
                className="text-base"
            >
                <Trans>Options</Trans>
            </Text>
            <View
                style={{
                    flex: 1,
                    gap: 8,
                    width: "100%",
                }}
            >
                {appointment.type === "FIRST_IN_RECURRENCE" && (
                    <LargeButton
                        disabled={isMutating}
                        onPress={() => {
                            Alert.alert(
                                t({ message: "Confirm recurrence acceptance" }),
                                t({
                                    message: `After accepting the recurrence, weekly events will be added to your calendar. 
                                        Recurrent appointments are approved by default and can be canceled up until 24 hours before the session.`,
                                }),
                                [
                                    {
                                        text: t({ message: "Cancel" }),
                                        style: "cancel",
                                    },
                                    {
                                        text: t({ message: "Accept" }),
                                        onPress: async () => {
                                            await handleSessionConfirmation(
                                                "ACCEPTED",
                                            );
                                            if (appointment.recurrenceId) {
                                                await updateRecurrence.mutateAsync(
                                                    {
                                                        recurrenceId:
                                                            appointment.recurrenceId,
                                                        status: "ACCEPTED",
                                                    },
                                                );
                                            }
                                        },
                                    },
                                ],
                            );
                        }}
                    >
                        <Trans>Accept session and recurrence </Trans>
                    </LargeButton>
                )}
                <LargeButton
                    disabled={isMutating}
                    onPress={() => {
                        Alert.alert(
                            t({
                                message: "Confirm session acceptance",
                            }),
                            t({
                                message: `After accepting the session, an event will be created in your calendar.${
                                    appointment.recurrenceId
                                        ? "Accepting a single session will refuse the patient's recurrence request."
                                        : ""
                                }`,
                            }),
                            [
                                {
                                    text: t({ message: "Cancel" }),
                                    style: "cancel",
                                },
                                {
                                    text: t({ message: "Accept" }),
                                    onPress: async () => {
                                        await handleSessionConfirmation(
                                            "ACCEPTED",
                                        );
                                        if (appointment.recurrenceId) {
                                            await updateRecurrence.mutateAsync({
                                                recurrenceId:
                                                    appointment.recurrenceId,
                                                status: "REJECTED",
                                            });
                                        }
                                    },
                                },
                            ],
                        );
                    }}
                >
                    <Trans>
                        {appointment.type === "FIRST_IN_RECURRENCE"
                            ? "Accept single session"
                            : "Accept session"}
                    </Trans>
                </LargeButton>
                <LargeButton
                    color="red"
                    disabled={isMutating}
                    onPress={() => {
                        Alert.alert(
                            t({ message: "Confirm session rejection" }),
                            t({ message: "This action can't be undone" }),
                            [
                                {
                                    text: t({ message: "Cancel" }),
                                    style: "cancel",
                                },
                                {
                                    text: t({ message: "Reject" }),
                                    onPress: async () => {
                                        await handleSessionConfirmation(
                                            "REJECTED",
                                        );
                                        if (appointment.recurrenceId) {
                                            await updateRecurrence.mutateAsync({
                                                recurrenceId:
                                                    appointment.recurrenceId,
                                                status: "REJECTED",
                                            });
                                        }
                                    },
                                },
                            ],
                        );
                    }}
                >
                    <Trans>Refuse session</Trans>
                </LargeButton>
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
    const statusMapper: {
        [key in AppointmentStatus]: {
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
    appointmentType: AppointmentType;
}) {
    const appointmentMapper: {
        [key in AppointmentType]: string;
    } = {
        FIRST_IN_RECURRENCE: t({ message: "First in recurrence" }),
        SINGLE: t({ message: "Single" }),
        RECURRENT: t({ message: "Recurrent" }),
        SINGLE_REPEATED: t({ message: "Repeated" }),
    };

    return (
        <BasicText color="black">
            {appointmentMapper[appointmentType]}
        </BasicText>
    );
}

function UserPhoto({
    appointment,
    role,
}: {
    appointment: Appointment & { therapist: Therapist } & { patient: Patient };
    role: "patient" | "therapist";
}) {
    const { data, isLoading } = useUserHasProfileImage({
        userId: appointment[role].userId,
    });

    if (isLoading) return <ActivityIndicator />;

    if (!data)
        return (
            <View className={`rounded-full bg-blue-100 p-[2px]`}>
                <AntDesign name="user" size={20} />
            </View>
        );

    return (
        <Image
            className="rounded-full"
            alt={`${appointment[role].name}'s profile picture`}
            source={{
                uri: appointment[role].profilePictureUrl,
                width: 20,
                height: 20,
            }}
        />
    );
}
