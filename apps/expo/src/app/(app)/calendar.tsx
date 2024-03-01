import { useEffect, useMemo, useState } from "react";
import {
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import {
    add,
    endOfDay,
    endOfDecade,
    endOfWeek,
    isWithinInterval,
    startOfDay,
} from "date-fns";

import { BasicText } from "../../components/BasicText";
import { CardSkeleton } from "../../components/CardSkeleton";
import { ExclusiveTagFilter } from "../../components/ExclusiveTagFilter";
import { PatientAppointmentCard } from "../../components/PatientAppointmentCard";
import { Refreshable } from "../../components/Refreshable";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { TherapistAppointmentCard } from "../../components/TherapistAppointmentCard";
import { Title } from "../../components/Title";
import { getShareLink } from "../../helpers/getShareLink";
import { useUserIsProfessional } from "../../hooks/user/useUserIsProfessional";
import { api } from "../../utils/api";

type MetadataBasedFilter = "NOT_PAID" | "PENDENT";
type TimeBasedFilter = "TODAY" | "TOMORROW" | "LATER_THIS_WEEK" | "ALL";

type Tags = TimeBasedFilter | MetadataBasedFilter;

const todayEndOfDay = endOfDay(new Date());
const todayStartOfDay = startOfDay(new Date());

const periodToInterval: {
    [key in TimeBasedFilter]: {
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
    const params: Partial<{
        filter: Tags;
    }> = useLocalSearchParams();
    const [tagFilter, setTagFilted] = useState<Tags>(params.filter ?? "TODAY");
    const isProfessional = useUserIsProfessional();

    useEffect(() => {
        if (params.filter && params.filter !== tagFilter) {
            setTagFilted(params.filter);
        }
    }, [params]);

    const {
        data: appointments,
        isLoading,
        isError,
    } = api.appointments.findAll.useQuery();

    const filteredAppointment = useMemo(() => {
        if (!appointments) return [];

        if (tagFilter === "NOT_PAID") {
            return appointments.filter(
                (appointment) =>
                    appointment.status === "ACCEPTED" && !appointment.isPaid,
            );
        }

        if (tagFilter === "PENDENT") {
            return appointments.filter(
                (appointment) => appointment.status === "PENDENT",
            );
        }

        return appointments.filter((appointment) =>
            isWithinInterval(
                new Date(appointment.scheduledTo),
                periodToInterval[tagFilter],
            ),
        );
    }, [appointments, tagFilter]);

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
                    marginVertical: 8,
                }}
            >
                <ExclusiveTagFilter
                    onChange={(value) => setTagFilted(value as Tags)}
                    selected={tagFilter}
                    tags={[
                        ...(isProfessional
                            ? [
                                  {
                                      label: t({ message: "Not paid" }),
                                      value: "NOT_PAID",
                                  },
                                  {
                                      label: t({ message: "Pendent" }),
                                      value: "PENDENT",
                                  },
                              ]
                            : []),
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
            {filteredAppointment.length === 0 ? (
                <View className="flex flex-col items-center justify-center gap-2 pt-32">
                    <Image
                        className="h-40 w-40"
                        alt={`No therapists picture`}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        source={require("../../../assets/images/girl_dog.png")}
                    />
                    <Text className="font-nunito-sans-bold text-xl text-slate-500">
                        <Trans>No appointments found!</Trans>
                    </Text>
                </View>
            ) : (
                user &&
                filteredAppointment.map((appoinment) =>
                    isProfessional ? (
                        <TherapistAppointmentCard
                            key={appoinment.id}
                            appointment={appoinment}
                        />
                    ) : (
                        <PatientAppointmentCard
                            key={appoinment.id}
                            appointment={appoinment}
                        />
                    ),
                )
            )}
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
            <View className="px-6 pt-6">
                <BasicText size="xl" style={{ marginBottom: 2 }}>
                    <Trans>Your appointments will show up here</Trans>
                </BasicText>
                <BasicText color="gray">
                    {t({
                        message:
                            "Options for cancelling and rescheduling will also be available.",
                    })}
                </BasicText>
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
                    <View
                        className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle shadow-sm"
                        style={{ elevation: 2, gap: 8 }}
                    >
                        <MaterialIcons size={24} color="white" name="link" />
                        <BasicText color="white" size="xl" fontWeight="bold">
                            <Trans>Share your link</Trans>
                        </BasicText>
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
