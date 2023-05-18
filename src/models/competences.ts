import { Learning } from "./learnings";

export interface Competence {
    _id?: string;
    name: string;
    learnings: Learning[];
}

export function getCompetences(learnings: Learning[]): Competence[] {
    let allLearningsCompetences: Competence[] = [];
    for (let i = 0; i < learnings.length; i++) {
        if (!allLearningsCompetences.find((c: Competence) => c.name === learnings[i].competence)) {
            allLearningsCompetences.push({
                name: learnings[i].competence,
                learnings: []
            });
        }

        let index = allLearningsCompetences.findIndex((c: Competence) => c.name === learnings[i].competence);
        allLearningsCompetences[index].learnings.push(learnings[i]);
    }

    return allLearningsCompetences;
}