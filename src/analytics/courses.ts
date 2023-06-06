import { Learning } from "../models/learnings";
import { UeAnalytics } from "./ue";

export type CourseAnalytics = {
    name: string;
    points: number;
    coefficient: number;
    learnings: Learning[];
}
