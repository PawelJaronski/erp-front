import { categoriesData, CategoryData } from "./staticData";

export function filterCategories({
    categoryGroup,
    category,
    allowedGroups,
    allowedCategories,
}: {
    categoryGroup?: string;
    category?: string;
    allowedGroups?: string[];
    allowedCategories?: string[];
}): CategoryData[] {
    let filtered: CategoryData[] = [...categoriesData];

    if (allowedGroups) {
        filtered = filtered.filter(c => allowedGroups.includes(c.group));
    }

    if (allowedCategories) {
        filtered = filtered.filter(c => allowedCategories.includes(c.value));
    }

    if (categoryGroup && categoryGroup !== 'other') {
        filtered = filtered.filter(c => c.group === categoryGroup);
    }

    return filtered;
}