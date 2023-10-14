import { api } from "../../utils/api";

export function usePatientMutations() {
    const createPatient = api.patients.create.useMutation({});

    return {
        createPatient,
    };
}
