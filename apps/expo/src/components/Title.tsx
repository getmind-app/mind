import { BasicText } from "./BasicText";

export const Title = ({ title }: { title: string }): JSX.Element => {
    return (
        <BasicText size="3xl" fontWeight="bold">
            {title}
        </BasicText>
    );
};
