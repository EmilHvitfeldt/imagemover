window.RevealImagemover = function () {
  return {
    id: "RevealImagemover",
    init: function (deck) {
      document.addEventListener('DOMContentLoaded', function () {
        const imagemoverImages = document.querySelectorAll('img[id="imagemover"]');

        imagemoverImages.forEach(img => {
          let isDragging = false;
          let isResizing = false;
          let startX, startY, initialX, initialY, initialWidth, initialHeight;
          let resizeHandle = null;

          // Wrap image in a container
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.display = 'inline-block';
          container.style.border = '2px solid transparent';
          img.parentNode.insertBefore(container, img);
          container.appendChild(img);

          // Make image draggable
          img.style.cursor = 'move';
          img.style.position = 'relative';
          img.style.width = (img.naturalWidth || img.offsetWidth) + 'px';
          img.style.height = (img.naturalHeight || img.offsetHeight) + 'px';
          img.style.display = 'block';

          // Create resize handles
          const handles = ['nw', 'ne', 'sw', 'se'];
          handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = 'resize-handle';
            handle.style.position = 'absolute';
            handle.style.width = '10px';
            handle.style.height = '10px';
            handle.style.backgroundColor = '#007cba';
            handle.style.border = '1px solid #fff';
            handle.style.cursor = position + '-resize';
            handle.style.opacity = '0';
            handle.style.transition = 'opacity 0.2s';

            // Position handles
            if (position.includes('n')) handle.style.top = '-6px';
            if (position.includes('s')) handle.style.bottom = '-6px';
            if (position.includes('w')) handle.style.left = '-6px';
            if (position.includes('e')) handle.style.right = '-6px';

            handle.dataset.position = position;
            container.appendChild(handle);
          });

          // Show/hide handles on hover
          container.addEventListener('mouseenter', () => {
            container.style.border = '2px solid #007cba';
            container.querySelectorAll('.resize-handle').forEach(h => h.style.opacity = '1');
          });

          container.addEventListener('mouseleave', () => {
            if (!isDragging && !isResizing) {
              container.style.border = '2px solid transparent';
              container.querySelectorAll('.resize-handle').forEach(h => h.style.opacity = '0');
            }
          });

          // Mouse events for dragging
          img.addEventListener('mousedown', startDrag);

          // Mouse events for resizing
          container.querySelectorAll('.resize-handle').forEach(handle => {
            handle.addEventListener('mousedown', startResize);
          });

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', stopAction);

          // Touch events
          img.addEventListener('touchstart', startDrag);
          container.querySelectorAll('.resize-handle').forEach(handle => {
            handle.addEventListener('touchstart', startResize);
          });
          document.addEventListener('touchmove', handleTouchMove);
          document.addEventListener('touchend', stopAction);

          function startDrag(e) {
            if (e.target.classList.contains('resize-handle')) return;

            isDragging = true;

            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;
            initialX = container.offsetLeft;
            initialY = container.offsetTop;

            e.preventDefault();
          }

          function startResize(e) {
            isResizing = true;
            resizeHandle = e.target.dataset.position;

            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;
            initialWidth = img.offsetWidth;
            initialHeight = img.offsetHeight;
            initialX = container.offsetLeft;
            initialY = container.offsetTop;

            e.preventDefault();
            e.stopPropagation();
          }

          function handleMouseMove(e) {
            if (isDragging) {
              drag(e);
            } else if (isResizing) {
              resize(e);
            }
          }

          function handleTouchMove(e) {
            if (isDragging) {
              drag(e);
            } else if (isResizing) {
              resize(e);
            }
          }

          function drag(e) {
            if (!isDragging) return;

            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            container.style.left = (initialX + deltaX) + 'px';
            container.style.top = (initialY + deltaY) + 'px';

            e.preventDefault();
          }

          function resize(e) {
            if (!isResizing) return;

            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newX = initialX;
            let newY = initialY;

            // Calculate new dimensions based on handle position
            if (resizeHandle.includes('e')) {
              newWidth = Math.max(50, initialWidth + deltaX);
            }
            if (resizeHandle.includes('w')) {
              newWidth = Math.max(50, initialWidth - deltaX);
              newX = initialX + (initialWidth - newWidth);
            }
            if (resizeHandle.includes('s')) {
              newHeight = Math.max(50, initialHeight + deltaY);
            }
            if (resizeHandle.includes('n')) {
              newHeight = Math.max(50, initialHeight - deltaY);
              newY = initialY + (initialHeight - newHeight);
            }

            // Apply new dimensions
            img.style.width = newWidth + 'px';
            img.style.height = newHeight + 'px';
            container.style.left = newX + 'px';
            container.style.top = newY + 'px';

            e.preventDefault();
          }

          function stopAction() {
            if (isDragging || isResizing) {
              // Keep handles visible briefly after action
              setTimeout(() => {
                if (!container.matches(':hover')) {
                  container.style.border = '2px solid transparent';
                  container.querySelectorAll('.resize-handle').forEach(h => h.style.opacity = '0');
                }
              }, 500);
            }

            isDragging = false;
            isResizing = false;
            resizeHandle = null;
          }
        });

        // Find the slide-menu-items ul inside menu-custom-panel div
        const slideMenuItems = document.querySelector('div.slide-menu-custom-panel ul.slide-menu-items');

        if (slideMenuItems) {
          // Find the highest data-item value
          const existingItems = slideMenuItems.querySelectorAll('li[data-item]');
          let maxDataItem = 0;
          existingItems.forEach(item => {
            const dataValue = parseInt(item.getAttribute('data-item')) || 0;
            if (dataValue > maxDataItem) {
              maxDataItem = dataValue;
            }
          });



          // Create the new li element
          const newLi = document.createElement('li');
          newLi.className = 'slide-tool-item';
          newLi.setAttribute('data-item', (maxDataItem + 1).toString());
          newLi.innerHTML = '<a href="#" onclick="saveMovedImages()"><kbd>?</kbd> Save Moved Images</a>';

          // Append to the ul
          slideMenuItems.appendChild(newLi);
        }
      });
    },
  };
};

async function saveMovedImages() {
  index = await readIndexQmd()
  image_dim = extractimagemoverImageDimensions()
  image_attr = formatimagemoverImageStrings(image_dim)
  index = replaceimagemoverOccurrences(index, image_attr)
  downloadString(index)
}
// Function to read index.qmd file
async function readIndexQmd() {
  try {
    const response = await fetch(getImageMoverFilename());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.text();
    return content;
  } catch (error) {
    console.error('Error reading index.qmd:', error);
    return null;
  }
}

// Function to get data-filename attribute from imagemover div
function getImageMoverFilename() {
  const imageMoverDiv = document.getElementById('filename');
  return imageMoverDiv ? imageMoverDiv.getAttribute('data-filename') : null;
}

// Function to extract width and height of images with imagemover id
function extractimagemoverImageDimensions() {
  const imagemoverImages = document.querySelectorAll('img[id="imagemover"]');
  const dimensions = [];

  imagemoverImages.forEach((img, index) => {
    const width = img.style.width ? parseFloat(img.style.width) : img.offsetWidth;
    const height = img.style.height ? parseFloat(img.style.height) : img.offsetHeight;

    // Get parent container (div) position
    const parentContainer = img.parentNode;
    const left = parentContainer.style.left ? parseFloat(parentContainer.style.left) : parentContainer.offsetLeft;
    const top = parentContainer.style.top ? parseFloat(parentContainer.style.top) : parentContainer.offsetTop;

    dimensions.push({
      width: width,
      height: height,
      left: left,
      top: top
    });
  });

  return dimensions;
}

// Function to replace all occurrences that start with "{#imagemover" and go until the first "}" with replacements from array
function replaceimagemoverOccurrences(text, replacements) {
  const regex = /\{#imagemover[^}]*\}/g;
  let index = 0;
  return text.replace(regex, () => {
    return replacements[index++] || '';
  });
}

// Function to format imagemover image dimensions as strings
function formatimagemoverImageStrings(dimensions) {
  return dimensions.map(dim => {
    return `{.absolute width=${dim.width}px height=${dim.height}px left=${dim.left}px top=${dim.top}px}`;
  });
}

// Function to make a string available as a downloadable file
async function downloadString(content, mimeType = 'text/plain') {
  filename = getImageMoverFilename();
  // Check if the File System Access API is supported
  if ('showSaveFilePicker' in window) {
    try {
      // Show file picker dialog
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Text files',
          accept: { [mimeType]: ['.txt', '.qmd', '.md'] }
        }]
      });

      // Create a writable stream and write the content
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      console.log('File saved successfully');
      return;
    } catch (error) {
      // User cancelled or error occurred, fall back to traditional method
      console.log('File picker cancelled or failed, using fallback method');
    }
  }

  // Fallback to traditional download method
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
