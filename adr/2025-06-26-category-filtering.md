# ADR-001: Lenient bidirectional synchronisation of `category_group` and `category`

Date: 2025-06-26

## Context

Historically we kept the two form fields in strict sync:

* selecting `category` overwrote `category_group` (one-way upward) — OK;  
* changing `category_group` cleared (`""`) `category` if it no longer matched the group.

In practice, this caused issues in the scenario:  
1. The user selects the correct **category** (e.g., `ads`).  
2. Realizes it should be assigned to a different **category group**.  
3. After changing the group, the selected category disappears from the list, and the `category` field is cleared.

As a result, the operation could not be completed.

## Decision

* We keep the automatic **setting** of `category_group` after selecting `category` (business shortcut).  
* **Remove** automatic clearing of `category` when changing `category_group`.  
* The category list (`availableCategories`) is filtered *only* when `category` is empty. When one is already selected – we display the full list so that the selected item is always available.

## Consequences

+ The user can first select a category and then correct its group without losing the selection.  
+ Temporarily "inconsistent" pairs are possible (category outside the group). These can optionally be highlighted in the UI.  
+ Logic has been extracted to `computeAvailableCategories` + `syncCategory` updated. Covered by unit tests.