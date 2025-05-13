import React from 'react';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { NodeView } from '@tiptap/pm/view';
import { RiDragMove2Line } from 'react-icons/ri';

// Define the drag handle extension
const DragHandle = Extension.create({
  name: 'dragHandle',

  addProseMirrorPlugins() {
    let dragHandleElement: HTMLElement | null = null;
    let activeNode: any = null;

    const createDragHandle = () => {
      const element = document.createElement('div');
      element.classList.add('drag-handle');
      element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>`;
      element.style.position = 'absolute';
      element.style.opacity = '0';
      element.style.transition = 'opacity 0.2s';
      element.style.cursor = 'grab';
      element.style.color = 'var(--color-muted, #64748b)';
      element.style.width = '24px';
      element.style.height = '24px';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      
      // Add drag events
      element.addEventListener('mousedown', (event) => {
        if (!activeNode) return;
        
        event.preventDefault();
        element.style.cursor = 'grabbing';
        
        // Here you would implement the actual drag and drop logic
        // This is a simplified version that doesn't actually move nodes yet
        
        const handleMouseUp = () => {
          element.style.cursor = 'grab';
          document.removeEventListener('mouseup', handleMouseUp);
          document.removeEventListener('mousemove', handleMouseMove);
        };
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
          // Implement drag logic here
          // This would involve calculating the new position and updating the document
        };
        
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);
      });
      
      return element;
    };

    return [
      new Plugin({
        key: new PluginKey('dragHandle'),
        view: (view) => {
          dragHandleElement = createDragHandle();
          view.dom.parentElement?.appendChild(dragHandleElement);

          return {
            update: (view, prevState) => {
              const { state } = view;
              
              // Only show drag handle when editor is focused
              if (!view.hasFocus()) {
                if (dragHandleElement) dragHandleElement.style.opacity = '0';
                return;
              }
              
              // Find the current block node
              const { selection } = state;
              const { $from } = selection;
              const currentNode = $from.node();
              
              // Only show drag handle for block nodes
              if (currentNode.isBlock && dragHandleElement) {
                activeNode = currentNode;
                
                // Position the drag handle
                const nodePos = view.coordsAtPos($from.pos);
                dragHandleElement.style.left = `${nodePos.left - 30}px`;
                dragHandleElement.style.top = `${nodePos.top}px`;
                dragHandleElement.style.opacity = '1';
              } else {
                if (dragHandleElement) dragHandleElement.style.opacity = '0';
                activeNode = null;
              }
            },
            destroy: () => {
              dragHandleElement?.remove();
              dragHandleElement = null;
            },
          };
        },
      }),
    ];
  },
});

export default DragHandle;
