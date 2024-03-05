import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Modalize } from "react-native-modalize";
import { Portal } from "react-native-portalize";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { FlashList } from "@shopify/flash-list";

import { type Patient } from "../../../../../../../packages/db";
import { BasicText } from "../../../../components/BasicText";
import { Header } from "../../../../components/Header";
import { ScreenWrapper } from "../../../../components/ScreenWrapper";
import SkeletonCard from "../../../../components/SkeletonCard";
import { SmallButton } from "../../../../components/SmallButton";
import { Title } from "../../../../components/Title";
import { UserPhoto } from "../../../../components/UserPhotos";
import { useUserIsProfessional } from "../../../../hooks/user/useUserIsProfessional";
import { api } from "../../../../utils/api";
import { colors } from "../../../../utils/colors";

export default function NewNote() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [content, setContent] = useState("");
    const utils = api.useContext();
    const [openPatientsList, setOpenPatientsList] = useState(false);
    const [patient, setPatient] = useState<{
        id: string;
        userId: string;
    }>({
        id: String(params.patientId),
        userId: String(params.patientUserId),
    });
    const isProfessional = useUserIsProfessional();
    // todo: dont use junky solution
    const isValid = content && content.length > 1;

    const { mutateAsync, isLoading } = api.notes.create.useMutation({
        onSuccess: async () => {
            await utils.notes.findByUserId.invalidate();
            router.push({
                pathname: "/",
            });
        },
    });

    async function handleNewNote() {
        if (isValid) {
            try {
                await mutateAsync({
                    content: content,
                    patientId: patient.id,
                });
                setContent("");
            } catch {
                Alert.alert(
                    t({ message: "Error" }),
                    t({ message: "An error occurred while creating the note" }),
                );
            }
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScreenWrapper
                style={{
                    paddingTop: 12,
                }}
            >
                <Header />
                <ScrollView
                    className="min-h-max"
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            justifyContent: "space-between",
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <Title title={t({ message: "New note" })} />
                            {isProfessional && (
                                <>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setOpenPatientsList(true)
                                        }
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 4,
                                        }}
                                    >
                                        <UserPhoto
                                            userId={String(
                                                params.patientUserId,
                                            )}
                                            alt={"Patient's photo"}
                                        />
                                        <Feather
                                            size={16}
                                            name="repeat"
                                            color="#3b82f6"
                                        />
                                    </TouchableOpacity>
                                    <PatientsList
                                        onPatientSelected={(patient) => {
                                            setPatient({
                                                id: patient.id,
                                                userId: patient.userId,
                                            });
                                            setOpenPatientsList(false);
                                        }}
                                        open={openPatientsList}
                                        setOpen={setOpenPatientsList}
                                    />
                                </>
                            )}
                        </View>
                        <SmallButton
                            style={{
                                alignSelf: "center",
                            }}
                            onPress={handleNewNote}
                            disabled={isLoading || !isValid}
                        >
                            <Trans>Create</Trans>
                        </SmallButton>
                    </View>
                    <TextInput
                        className="w-full py-4 font-nunito-sans text-lg"
                        onChangeText={setContent}
                        value={content}
                        placeholder={t({ message: "Write your note here" })}
                    />
                </ScrollView>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    );
}

function PatientsList({
    open,
    setOpen,
    onPatientSelected,
}: {
    open: boolean;
    setOpen: (value: boolean) => void;
    onPatientSelected: (patient: Patient) => void;
}) {
    const modalizeRef = useRef<Modalize>(null);
    const therapistPatients = api.therapists.allPatients.useQuery();

    useEffect(() => {
        if (!modalizeRef.current) {
            return;
        }

        if (open) {
            modalizeRef.current?.open();
        } else {
            modalizeRef.current?.close();
        }
    }, [open]);

    return (
        <Portal>
            <Modalize
                modalStyle={{ backgroundColor: "#f8f8f8", padding: 24 }}
                ref={modalizeRef}
                onClose={() => setOpen(false)}
                modalHeight={Dimensions.get("window").height * 0.8}
                snapPoint={Dimensions.get("window").height * 0.8}
            >
                <View
                    style={{
                        flex: 1,
                        minHeight: 400,
                    }}
                >
                    {therapistPatients.isLoading || true ? (
                        <SkeletonCard widthRatio={1} />
                    ) : therapistPatients.isError ? (
                        <BasicText>
                            {t({
                                message:
                                    "An error occurred while fetching the patients",
                            })}
                        </BasicText>
                    ) : (
                        <FlashList
                            data={therapistPatients.data || []}
                            estimatedItemSize={60}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => onPatientSelected(item)}
                                    style={{
                                        padding: 12,
                                        flex: 1,
                                        height: 48,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 12,
                                        borderBottomColor: colors.lightGray,
                                        borderBottomWidth: 1,
                                    }}
                                >
                                    <UserPhoto
                                        alt={`${item.name} profile picture`}
                                        userId={item.userId}
                                    />
                                    <BasicText>{item.name}</BasicText>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </Modalize>
        </Portal>
    );
}
