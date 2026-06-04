export interface Party {
    id: string;
    nome: string;
}
export declare class PartiesAPI {
    parties(acronym: string): Promise<{
        dados: Party[];
    }>;
}
//# sourceMappingURL=app.api.d.ts.map