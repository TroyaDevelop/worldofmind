import { Node, mergeAttributes } from '@tiptap/core';

const InfoBlock = Node.create({
  name: 'infoBlock',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-block-type'),
        renderHTML: attributes => {
          if (!attributes.type) {
            return {};
          }
          return {
            'data-block-type': attributes.type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="info-block"]',
        getAttrs: element => ({
          type: element.getAttribute('data-block-type') || 'info',
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-block-type'] || 'info';
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'info-block',
        'data-block-type': type,
        class: `info-block info-block-${type}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setInfoBlock:
        (options = {}) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, options);
        },
      toggleInfoBlock:
        (options = {}) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, options);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-i': () => this.editor.commands.toggleInfoBlock({ type: 'info' }),
    };
  },
});

export default InfoBlock;
