const formatModality = (text: string | undefined) => {
    if (!text) {
        return "";
    }

    return text
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/(?:^|\s)\S/g, function (match) {
            return match.toUpperCase();
        });
};

export default formatModality;
