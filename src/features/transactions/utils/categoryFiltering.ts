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
        filtered = filtered.filter(c => c.group === categoryGroup || c.value === category);
    }

    if (category && !filtered.some(c => c.value === category)) {
        const found = categoriesData.find(c => c.value === category);
        if (found) filtered = [...filtered, found];
    }

    return filtered;
}