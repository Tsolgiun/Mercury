import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// Define the slash commands extension
const SlashCommands = Extension.create({
  name: 'slashCommands',

  addProseMirrorPlugins() {
    const editor = this.editor;
    let tippyInstance: any = null;
    let slashCommandActive = false;
    let slashPos = 0;

    return [
      new Plugin({
        key: new PluginKey('slashCommands'),
        props: {
          handleKeyDown(view, event) {
            // Check if the user pressed "/"
            if (event.key === '/' && !slashCommandActive) {
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;
              
              // Store the position where the slash was typed
              slashPos = $from.pos;
              slashCommandActive = true;
              
              // Create the slash command menu
              setTimeout(() => {
                const coords = view.coordsAtPos(slashPos);
                const element = document.createElement('div');
                element.className = 'slash-command-menu';
                
                // Create the menu content
                const commands = [
                  { title: 'Text', description: 'Just start writing with plain text.', command: () => editor.commands.setParagraph() },
                  { title: 'Heading 1', description: 'Large section heading.', command: () => editor.commands.setHeading({ level: 1 }) },
                  { title: 'Heading 2', description: 'Medium section heading.', command: () => editor.commands.setHeading({ level: 2 }) },
                  { title: 'Heading 3', description: 'Small section heading.', command: () => editor.commands.setHeading({ level: 3 }) },
                  { title: 'Bullet List', description: 'Create a simple bullet list.', command: () => editor.commands.toggleBulletList() },
                  { title: 'Numbered List', description: 'Create a numbered list.', command: () => editor.commands.toggleOrderedList() },
                  { title: 'Quote', description: 'Capture a quote.', command: () => editor.commands.toggleBlockquote() },
                  { title: 'Code', description: 'Capture a code snippet.', command: () => editor.commands.toggleCodeBlock() },
                  { title: 'Image', description: 'Upload or embed with a link.', command: () => {
                    const url = prompt('Enter image URL');
                    if (url) {
                      editor.commands.setImage({ src: url });
                    }
                  }},
                ];
                
                // Create the menu items
                commands.forEach(cmd => {
                  const item = document.createElement('div');
                  item.className = 'slash-command-item';
                  item.innerHTML = `
                    <div class="slash-command-title">${cmd.title}</div>
                    <div class="slash-command-description">${cmd.description}</div>
                  `;
                  item.addEventListener('click', () => {
                    // Delete the slash character
                    const { state, dispatch } = view;
                    const { tr } = state;
                    tr.delete(slashPos, slashPos + 1);
                    dispatch(tr);
                    
                    // Execute the command
                    cmd.command();
                    
                    // Close the menu
                    if (tippyInstance) {
                      tippyInstance.destroy();
                      tippyInstance = null;
                    }
                    slashCommandActive = false;
                  });
                  element.appendChild(item);
                });
                
                // Create the tippy instance
                const reference = document.createElement('div');
                reference.style.position = 'absolute';
                reference.style.left = `${coords.left}px`;
                reference.style.top = `${coords.bottom}px`;
                document.body.appendChild(reference);
                
                tippyInstance = tippy(reference, {
                  appendTo: document.body,
                  content: element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  onHidden() {
                    reference.remove();
                  }
                });
              }, 0);
              
              return false;
            }
            
            // Close the menu on escape
            if (event.key === 'Escape' && slashCommandActive) {
              if (tippyInstance) {
                tippyInstance.destroy();
                tippyInstance = null;
              }
              slashCommandActive = false;
              return true;
            }
            
            return false;
          },
          
          // Handle clicks outside the menu
          handleClick() {
            if (slashCommandActive && tippyInstance) {
              tippyInstance.destroy();
              tippyInstance = null;
              slashCommandActive = false;
            }
            return false;
          },
        },
      }),
    ];
  },
});

export default SlashCommands;
