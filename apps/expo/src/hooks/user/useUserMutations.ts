import { api } from "../../utils/api";

export function useUserMutations() {
    const setMetadata = api.users.setMetadata.useMutation();

    return { setMetadata };
}
