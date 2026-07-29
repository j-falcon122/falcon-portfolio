import {defineArrayMember, defineField, defineType} from "sanity";

const sectionChromeFields = [
  defineField({
    name: "eyebrow",
    title: "Eyebrow",
    type: "string",
    description: 'e.g. "01 / About"',
  }),
  defineField({name: "title", type: "string"}),
  defineField({name: "subtitle", type: "string"}),
];

export const experienceBlockType = defineType({
  name: "experience",
  title: "Experience Timeline",
  type: "object",
  fields: [
    ...sectionChromeFields,
    defineField({
      name: "milestones",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "dates",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({name: "organization", type: "string"}),
            defineField({
              name: "details",
              type: "array",
              of: [defineArrayMember({type: "string"})],
            }),
            defineField({
              name: "kind",
              title: "Category",
              type: "string",
              options: {
                list: [
                  {title: "Job", value: "job"},
                  {title: "Internship", value: "internship"},
                  {title: "Education", value: "education"},
                ],
                layout: "radio",
              },
              initialValue: "job",
            }),
            defineField({
              name: "detailId",
              title: "Show More anchor",
              type: "string",
              description:
                'Matches a role id on the Experience Details page (e.g. "espn-swe-ii"). Makes this card link to that role.',
            }),
            defineField({
              name: "highlighted",
              title: "Highlighted (legacy)",
              type: "boolean",
              initialValue: false,
              hidden: true,
            }),
          ],
          preview: {
            select: {title: "title", subtitle: "dates", kind: "kind"},
            prepare({title, subtitle, kind}) {
              return {
                title: title || "Milestone",
                subtitle: [subtitle, kind].filter(Boolean).join(" · "),
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({name: "ctaLabel", type: "string"}),
    defineField({name: "ctaHint", type: "text", rows: 2}),
    defineField({
      name: "ctaHref",
      title: "Show More link",
      type: "string",
      description: "Route to the full details page (e.g. /experience-details).",
    }),
  ],
  preview: {
    select: {title: "title"},
    prepare({title}) {
      return {title: title || "Experience"};
    },
  },
});

const experienceRoleFields = [
  defineField({
    name: "id",
    title: "Anchor id",
    type: "string",
    description:
      'Stable hash target for timeline deep-links (e.g. "espn-swe-ii"). Use kebab-case.',
  }),
  defineField({
    name: "company",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "title",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "dates",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({name: "location", type: "string"}),
  defineField({name: "summary", type: "text", rows: 3}),
  defineField({
    name: "bullets",
    type: "array",
    of: [defineArrayMember({type: "string"})],
  }),
];

export const experienceDetailsBlockType = defineType({
  name: "experienceDetails",
  title: "Experience Full Details",
  type: "object",
  fields: [
    ...sectionChromeFields,
    defineField({
      name: "roles",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: experienceRoleFields,
          preview: {
            select: {title: "company", subtitle: "title"},
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({name: "earlierLabel", type: "string"}),
    defineField({
      name: "earlierRoles",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: experienceRoleFields,
          preview: {
            select: {title: "company", subtitle: "title"},
          },
        }),
      ],
    }),
    defineField({
      name: "backLabel",
      type: "string",
      description: "Top-left back control label (uses collapseHref).",
    }),
    defineField({name: "collapseLabel", type: "string"}),
    defineField({name: "collapseHref", type: "string"}),
  ],
  preview: {
    select: {title: "title"},
    prepare({title}) {
      return {title: title || "Experience Details"};
    },
  },
});

export const workGridBlockType = defineType({
  name: "workGrid",
  title: "Selected Work Grid",
  type: "object",
  fields: [
    ...sectionChromeFields,
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "tags",
              type: "array",
              of: [defineArrayMember({type: "string"})],
            }),
            defineField({
              name: "screenshot",
              title: "Screenshot",
              type: "image",
              options: {hotspot: true},
              description: "Optional product/UI screenshot for the card and case-study modal.",
              fields: [
                defineField({
                  name: "alt",
                  type: "string",
                  title: "Alt text",
                  description: "Describe the screenshot for accessibility.",
                }),
              ],
            }),
            defineField({
              name: "linkLabel",
              title: "Card CTA label",
              type: "string",
              description: 'e.g. "Case Study Highlights". Opens the modal when case study fields are set.',
            }),
            defineField({
              name: "href",
              title: "External link (optional)",
              type: "string",
              description:
                "Used only when no case study modal content is provided. Prefer filling the Case Study fields below.",
            }),
            defineField({
              name: "caseStudy",
              title: "Case Study Modal",
              type: "object",
              description:
                "Opens in a modal when the card is clicked. Fill any sections you want to show.",
              options: {collapsible: true, collapsed: false},
              fields: [
                defineField({
                  name: "project",
                  title: "Project",
                  type: "text",
                  rows: 3,
                  description: "What the initiative was and why it mattered.",
                }),
                defineField({
                  name: "problem",
                  title: "Problem",
                  type: "text",
                  rows: 3,
                }),
                defineField({
                  name: "myRole",
                  title: "My role",
                  type: "text",
                  rows: 3,
                }),
                defineField({
                  name: "actionsAndDecisions",
                  title: "Actions and decisions",
                  type: "text",
                  rows: 4,
                }),
                defineField({
                  name: "challenge",
                  title: "Challenge",
                  type: "text",
                  rows: 3,
                }),
                defineField({
                  name: "result",
                  title: "Result",
                  type: "text",
                  rows: 3,
                }),
                defineField({
                  name: "learning",
                  title: "Learning",
                  type: "text",
                  rows: 3,
                }),
              ],
            }),
          ],
          preview: {
            select: {title: "title", media: "screenshot"},
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: "title"},
    prepare({title}) {
      return {title: title || "Selected Work"};
    },
  },
});

export const projectListBlockType = defineType({
  name: "projectList",
  title: "Personal Projects",
  type: "object",
  fields: [
    ...sectionChromeFields,
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "tags",
              type: "array",
              of: [defineArrayMember({type: "string"})],
            }),
          ],
          preview: {
            select: {title: "title"},
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: "title"},
    prepare({title}) {
      return {title: title || "Personal Projects"};
    },
  },
});

export const skillsBlockType = defineType({
  name: "skills",
  title: "Skills Grid",
  type: "object",
  fields: [
    ...sectionChromeFields,
    defineField({
      name: "categories",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "items",
              type: "array",
              of: [defineArrayMember({type: "string"})],
              validation: (rule) => rule.required().min(1),
            }),
          ],
          preview: {
            select: {title: "title"},
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: "title"},
    prepare({title}) {
      return {title: title || "Skills"};
    },
  },
});

export const educationBlockType = defineType({
  name: "education",
  title: "Education",
  type: "object",
  fields: [
    ...sectionChromeFields,
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "school",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "detail",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({name: "years", type: "string"}),
          ],
          preview: {
            select: {title: "school", subtitle: "detail"},
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: "title"},
    prepare({title}) {
      return {title: title || "Education"};
    },
  },
});
