import { api } from "../../utils/api";

export function useUpdateRecurrence() {
    const utils = api.useContext();

    return api.appointments.updateRecurrence.useMutation({
        onSuccess: async () => {
            await utils.appointments.findAll.invalidate();
        },
    });
}
