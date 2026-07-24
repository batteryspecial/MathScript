import { format } from "date-fns";

export interface DocumentMeta {
    title: string;
    titleOn: boolean;
    author: string;
    authorOn: boolean;
    date: string;
    dateOn: boolean;
    metaOn: boolean;
    colorLinksOn: boolean;
}

export function defaultDocumentMeta(): DocumentMeta {
    return {
        title: "Untitled",
        titleOn: true,
        // TODO: source from user schema once auth/db exists
        author: "",
        authorOn: true,
        date: format(new Date(), "MMMM d, yyyy"),
        dateOn: true,
        metaOn: true,
        colorLinksOn: false,
    };
}
