interface SoapNote {
    category: string;
    notes: {
        content: string;
        transcriptIndices: number[];
    }[];
}

export default SoapNote;