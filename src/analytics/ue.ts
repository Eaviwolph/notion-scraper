import { CourseAnalytics } from "./courses";

export type UeAnalytics = {
    name: string;
    mean: number;
    coefficient: number;
    ue: UeAnalytics[];
    courses: CourseAnalytics[];
}
