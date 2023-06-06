import { Learning } from "../models/learnings";

export type CourseAnalytics = {
    name: string;
    points: number;
    coefficient: number;
    learnings: Learning[];
}
