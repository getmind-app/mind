import { useMemo, useState } from "react";
import { Alert, Image, RefreshControl, Share, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useUser } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { cpf } from "cpf-cnpj-validator";
import {
    endOfMonth,
    endOfWeek,
    format,
    isWithinInterval,
    startOfMonth,
    startOfWeek,
} from "date-fns";

import { type PatientReport } from "@acme/api/src/router/finances";

import { BasicText } from "../../../components/BasicText";
import { CardSkeleton } from "../../../components/CardSkeleton";
import { ExclusiveTagFilter } from "../../../components/ExclusiveTagFilter";
import { Header } from "../../../components/Header";
import { PatientCard } from "../../../components/PatientCard";
import { Refreshable } from "../../../components/Refreshable";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { Title } from "../../../components/Title";
import { api } from "../../../utils/api";

type TimeBasedFilter = "THIS_WEEK" | "THIS_MONTH";

type Tags = TimeBasedFilter;

const periodToInterval: {
    [key in TimeBasedFilter]: {
        start: Date;
        end: Date;
    };
} = {
    THIS_MONTH: {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
    },
    THIS_WEEK: {
        start: startOfWeek(new Date()),
        end: endOfWeek(new Date()),
    },
};

export default function FinancesScreen() {
    const { user } = useUser();
    const utils = api.useContext();
    const [refreshing, setRefreshing] = useState(false);
    const [tagFilter, setTagFilted] = useState<Tags>("THIS_MONTH");

    const { data, isLoading, isError } =
        api.finances.getReportByTherapist.useQuery();

    const filteredPatients = useMemo(() => {
        if (!data) return [];

        if (tagFilter === "THIS_MONTH") {
            return data.patients;
        }

        return data.patients.map((patient) => {
            const appointments = patient.appointments.filter((appointment) =>
                isWithinInterval(appointment.scheduledTo, {
                    start: periodToInterval[tagFilter].start,
                    end: periodToInterval[tagFilter].end,
                }),
            );

            if (appointments.length === 0) {
                return null;
            }

            return {
                ...patient,
                appointments,
                total: appointments.reduce(
                    (acc, appointment) => acc + appointment.amount,
                    0,
                ),
            };
        });
    }, [data, tagFilter]);

    const onRefresh = async () => {
        setRefreshing(true);
        await utils.finances.getReportByTherapist.invalidate();
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

    if (!data.patients || data.patients.length === 0) {
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
                    marginBottom: 8,
                }}
            >
                <ExclusiveTagFilter
                    onChange={(value) => setTagFilted(value as Tags)}
                    selected={tagFilter}
                    tags={[
                        {
                            label: t({ message: "This month" }),
                            value: "THIS_MONTH",
                        },
                        {
                            label: t({ message: "This week" }),
                            value: "THIS_WEEK",
                        },
                    ]}
                />
            </View>

            <View
                style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    marginTop: 8,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        marginLeft: 8,
                    }}
                >
                    <BasicText size="2xl" fontWeight="bold">
                        R${" "}
                        {filteredPatients.reduce(
                            (acc, patient) =>
                                acc + (patient as PatientReport).total,
                            0,
                        )}
                    </BasicText>
                </View>
                <TouchableOpacity
                    style={{ paddingRight: 16 }}
                    onPress={async () => {
                        await Share.share({
                            message: t({
                                message: getShareReportMessage(
                                    filteredPatients as PatientReport[],
                                    periodToInterval[tagFilter].start,
                                    periodToInterval[tagFilter].end,
                                ),
                            }),
                        }).catch((error) =>
                            Alert.alert(
                                t({
                                    message: "Error sharing report",
                                }),
                                error as string,
                            ),
                        );
                    }}
                >
                    <MaterialIcons size={24} name="ios-share" />
                </TouchableOpacity>
            </View>
            <View className="pb-20">
                {filteredPatients.length === 0 ||
                filteredPatients[0] === null ? (
                    <View className="flex flex-col items-center justify-center gap-2 pt-32">
                        <Image
                            className="h-40 w-40"
                            alt={`No therapists picture`}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            source={require("../../../../assets/images/girl_dog.png")}
                        />
                        <Text className="font-nunito-sans-bold text-xl text-slate-500">
                            <Trans>No appointments found!</Trans>
                        </Text>
                    </View>
                ) : (
                    user &&
                    filteredPatients.map((patient) => (
                        <PatientCard
                            key={patient?.patientId}
                            patient={patient as PatientReport}
                        />
                    ))
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
            <Header title={t({ message: "Finances" })} />
            <Refreshable
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {children}
            </Refreshable>
        </ScreenWrapper>
    );
}

function EmptyState() {
    return (
        <View className="mt-4 rounded-xl bg-white p-6 shadow-sm">
            <BasicText size="xl" style={{ marginBottom: 2 }}>
                <Trans>Paid appointments will appear here</Trans>
            </BasicText>
            <BasicText color="gray">
                {t({
                    message:
                        "You can mark an appointment as paid in the calendar tab.",
                })}
            </BasicText>
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

function getShareReportMessage(
    patients: PatientReport[],
    startDate?: Date,
    endDate?: Date,
) {
    return t({
        message: `Financial report from ${startDate?.toLocaleDateString(
            "pt-BR",
        )} to ${endDate?.toLocaleDateString("pt-BR")}:

    ${patients.map((patient) => {
        return `
${patient.patientName} - ${cpf.format(patient.patientDocument)} - R$ ${
            patient.total
        }
${patient.appointments.map((appointment) => {
    return `
- ${format(new Date(appointment.scheduledTo), "dd/MM")} - R$ ${
        appointment.amount
    } - Paid at: ${
        format(appointment.paidAt as Date, "dd/MM") ?? "Not paid yet"
    }`;
})}
`;
    })}
`,
    });
}
