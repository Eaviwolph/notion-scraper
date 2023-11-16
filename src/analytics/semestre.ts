import { UeAnalytics } from "./ue";


export type SemesterAnalytics = {
    name: string;
    mean: number;
    coefficient: number;
    ue: UeAnalytics[];
}
