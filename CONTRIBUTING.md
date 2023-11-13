# dentago - Contribution Standards

The purpose of this document is to **establish the contribution standards** for _contributors_ of the `dentago` project as well as ensuring that individual _contributions_ are well-formed and fulfill the relevant criteria.

To ensure correctness and traceability in project contributions, **all contributors** are expected to have **read and understood the content of this document**.

## Table of Contents

- [dentago - Contribution Standards](#dentago---contribution-standards)
  - [Table of Contents](#table-of-contents)
  - [Development Process](#development-process)
    - [Agile approach - Scrum](#agile-approach---scrum)
      - [Incremental delivery](#incremental-delivery)
      - [Daily Scrum "Stand-ups"](#daily-scrum-stand-ups)
      - [Roles](#roles)
      - [Hybrid Work](#hybrid-work)
    - [Communication platform](#communication-platform)
  - [Contributor Guidelines](#contributor-guidelines)
    - [Creating Issues](#creating-issues)
    - [Writing Commit Messages](#writing-commit-messages)
    - [Creating Branches](#creating-branches)
    - [Creating, Handling Merge Requests](#creating-handling-merge-requests)
    - [Closing Issues](#closing-issues)
  - [Checklist For Team Members](#checklist-for-team-members)
    - [Markdown Style](#markdown-style)
  - [Acknowledgements](#acknowledgements)

## Development Process

> **Disclaimer**: while it may not be convention to put the following section in this type of document; in the scope of our University project the only contributors will be *us* - the group of students. In the event that this project gets open-sourced (after the course has ended) this section shall be moved elsewhere or removed.

### Agile approach - Scrum
<!-- TODO: is it necessary to mention anything about the Milestones? -->
The team will be taking an **Agile software development** approach, accompanied by a **modified version of <u>Scrum</u>** deemed suitable for the project's context and scope. This entails:

#### Incremental delivery
In the form of **two week *sprints*** (three in total throughout the project's duration).
  - Includes ***planning*** and ***evaluation/review*** phases at the start and end of each sprint, respectively.
  - The team will synchronise appropriate **meeting times on a per-instance basis** with respect to the sprint's duration. 

#### Daily Scrum "Stand-ups"
Conducted **online** in the team's Discord server - specifically, in the "daily-scrum" channel.

- Must **answer** the **following questions**:
  1. What did you work on yesterday?
  2. What will you work on today?
  3. Are there any blockers/anything you need help with?

#### Roles

The team has **agreed not to assign a *Scrum Master***.
  - It is believed that this would not bring enough value for the small work group.
  - The **written** Scrum stand-ups alongside the scheduled meetings is considered adequate to facilitate the necessary communication and coordination within the team. 
> This could be subject to change if the need for one is identified.

#### Hybrid Work

The team has **agreed to work in a hybrid manner**, allowing both physical and online presence **in meetings**.
- The team values the individual members's autonomy in being able to schedule their own work where possible, in order to accomodate different (daily) schedules - allowing the team members to work independently.

### Communication platform

- Principle platform – `Discord`

## Contributor Guidelines

### Creating Issues

- **Issue titles & descriptions** shall use the [imperative mood](https://en.wikipedia.org/wiki/Imperative_mood), such that it forms a *command or request*.
- Each issue must have the appropriate **labels** attached, such as `feature` for a new feature or `bug` for a bug in the code.
- **Sprint information** label (e.g. `Sprint:2`) should almost **always** be provided;
  - the **exceptions** being bug fixes or updates to the documentation, in which case such a label can be omitted.
- An appropriate **due date** should be added to the issue with respect to the sprint's deadline.
- When creating an issue that corresponds to a **feature request**, it is important to adhere to the provided **issue template**:
  - The issue description should include a **user story** or **SRS-format** requirement description. 
    - This shall correlate with, and link to, the corresponding requirement listed in the project's `wiki` section. <!-- TODO: add link -->
  - Alternatively, if more feasible, a textual natural language description can be used.
  - The author must also provide **acceptance criteria** that outline the specific implementation requirements that must be met for the feature to be considered complete.
  - For bug fixes or documentation enhancements, a textual natural language description is sufficient to describe the issue.
> Once an issue has been assigned, the assignee is encouraged to continuously **update** the acceptance criteria **check boxes** based on the committed implementations to track and communicate what work remains to be done.

### Writing Commit Messages

- Commit messages shall be written in the [imperative mood](https://en.wikipedia.org/wiki/Imperative_mood) and contributors must make their **best efforts** to follow English grammar rules and ortography.
- The commit **title** shall include the corresponding **issue number** via the `#<n>` syntax (followed by a whitespace) to ensure traceability.
  - The commit title shall **not** end with a **period**. 
- It is required to provide a **description** for each commit. It should cover the **rationale** for the changes and briefly describe the **approach** taken to implement them.
- In cases where **multiple individuals** work on a commit, the *"Co-authors: ..."* convention should be utilized to acknowledge their contribution.
> **IMPORTANT: do <u>not</u> push commits directly to the main branch, and <u>never</u> any code changes.** The only exceptions are for certain documentational changes such as in the `README.md` file.

### Creating Branches
- In adherence to the feature-branch workflow, **a distinct branch shall be created for every issue**. It is important to ensure that the branch is created from the corresponding issue. The **branch name** should be **succinct**, while also bearing **resemblance** to the content of the issue.
- Any additions or changes related to the implementation of a certain [issue](#creating-issues) must first be made using the correlating branch, and later on *merged* with the `main branch` via a [merge-request](#creating-handling-merge-requests).
- Branch names must also include the related **issue number** as prefix. 
> **Example**: "\#1-add-contributing-md"

### Creating, Handling Merge Requests

- A **merge request** must have an **assignee** (i.e., the assignee of the corresponding issue) and a **reviewer** (a different team member).
- The merge request shall retain the **labels** from the issue, including the `needs-review` label, upon creation.
- As a **reviewer**, the duties are to:
  - ensure that the code meets acceptable quality standards and fulfills the desired feature request,
  - provide **feedback** and/or **code reviews** to improve the feature if necessary,
  - *approve* the merge request if they believe it is suitable for the system's development.
- Once the merge request is approved, the `needs-review` label shall be removed.
> **Only after these steps have been completed can the assignee *merge* the merge request.**

### Closing Issues

- Features that are *temporarily* moved outside of the project scope can have the `out-of-scope` label attached - but kept **open** - to indicate that it is likely to be re-evaluated at a future point. 
- In the event that a particular feature is deemed **unfeasible** or otherwise *descoped*, it may be closed with the addition of the `deprecated` label. If necessary, the feature can be revisited and subsequently reopened.

## Checklist For Team Members

The following shall be continuously checked during the development process; as a **team member**, you are expected to question yourself and your peers on the following:

1. Have you followed the issue template when creating a new issue that requests a new feature?

2. Have you provided acceptance criteria for the feature that you are working on?

3. Have you used the imperative style and included the issue number in the commit message to ensure traceability?

4. Have you created a separate branch for each issue and named the branch appropriately?

5. Have you assigned an assignee and reviewer for each merge request?

6. Have you retained the labels from the original issue in the merge request?

7. Have you thoroughly reviewed the code and added comments or suggestions for improvement as necessary?

8.  Have you approved the merge request only if you believe that it is suitable for application to the development of the system, and similarly changed the labels accordingly?

9.  Have you closed a feature as deprecated if it is no longer feasible or not part of the scope anymore?

10. Have you reported any incidents of misconduct if/when necessary?

### Markdown Style

- All team member are encouraged to adhere to the **standard Markdown syntax**. The [Markdown Cheatsheet](https://docs.gitlab.com/ee/user/markdown.html) can be used as a reference.

## Acknowledgements

This document is an adaptation of the Contribution Guidelines authored by @spano (GitHub: `michalspano`) and @elindstr (GitHub: `erikflind`) for the [Terminarium project](https://github.com/michalspano/terminarium).