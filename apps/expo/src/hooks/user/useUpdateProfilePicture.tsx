import { api } from "../../utils/api";

export function useUpdateProfilePicture() {
    return api.users.updateProfileImage.useMutation({});
}
