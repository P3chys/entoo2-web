import { writable } from 'svelte/store';

// Store for expanded accordion states - keyed by category ID
function createExpandedCategoriesStore() {
	const { subscribe, update, set } = writable<Set<string>>(new Set());

	return {
		subscribe,
		toggle: (categoryId: string) => {
			update((expanded) => {
				const newSet = new Set(expanded);
				if (newSet.has(categoryId)) {
					newSet.delete(categoryId);
				} else {
					newSet.add(categoryId);
				}
				return newSet;
			});
		},
		expand: (categoryId: string) => {
			update((expanded) => {
				const newSet = new Set(expanded);
				newSet.add(categoryId);
				return newSet;
			});
		},
		collapse: (categoryId: string) => {
			update((expanded) => {
				const newSet = new Set(expanded);
				newSet.delete(categoryId);
				return newSet;
			});
		},
		isExpanded: (categoryId: string, expanded: Set<string>) => expanded.has(categoryId),
		reset: () => set(new Set())
	};
}

// Store for active document type tab - keyed by subject ID
function createActiveTypeStore() {
	const { subscribe, update, set } = writable<Map<string, string>>(new Map());

	return {
		subscribe,
		setActiveType: (subjectId: string, typeId: string) => {
			update((map) => {
				const newMap = new Map(map);
				newMap.set(subjectId, typeId);
				return newMap;
			});
		},
		getActiveType: (subjectId: string, activeTypes: Map<string, string>) => activeTypes.get(subjectId),
		reset: () => set(new Map())
	};
}

export const expandedCategories = createExpandedCategoriesStore();
export const activeTypes = createActiveTypeStore();
