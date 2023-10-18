import { api } from "../../utils/api";

export function usePatientMutations({
    onSuccess,
}: { onSuccess?: () => void } = {}) {
    const createPatient = api.patients.create.useMutation({
        onSuccess: () => {
            onSuccess?.();
        },
    });

    return {
        createPatient,
    };
}
