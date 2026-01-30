import type { Block } from 'payload'

export const ScrollHighlight: Block = {
  slug: 'scrollHighlight',
  labels: {
    singular: 'Scroll Highlight',
    plural: 'Scroll Highlights',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      defaultValue: 'How it works',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle/Badge Text',
      defaultValue: 'Scroll to reveal',
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Text Content',
      required: true,
      defaultValue:
        'As you scroll down this page, each word will progressively highlight, creating an engaging reading experience that guides your attention through the content. This technique is perfect for hero sections, key messages, or storytelling elements where you want to capture and maintain user attention.',
      admin: {
        description: 'The text that will be highlighted word-by-word as the user scrolls',
      },
    },
    {
      name: 'highlightColor',
      type: 'select',
      label: 'Highlight Color Style',
      defaultValue: 'primary',
      options: [
        {
          label: 'Primary',
          value: 'primary',
        },
        {
          label: 'Gradient',
          value: 'gradient',
        },
        {
          label: 'Accent',
          value: 'accent',
        },
      ],
      admin: {
        description: 'Choose how the highlighted text is styled',
      },
    },
  ],
}
