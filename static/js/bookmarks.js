import { load } from 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm';

export function createBookmarkElement(bookmark) {
  const div = document.createElement('div');
  div.className = 'van-bookmark';
  
  const a = document.createElement('a');
  a.href = bookmark.href;
  a.target = bookmark.target || '_blank';
  a.className = 'van-bookmark-link';
  
  if (bookmark.img) {
    const img = document.createElement('img');
    img.className = 'van-bookmark-image';
    img.src = bookmark.img;
    a.appendChild(img);
  }
  
  if (bookmark.title) {
    const title = document.createElement('div');
    title.className = 'van-bookmark-title';
    title.textContent = bookmark.title;
    a.appendChild(title);
  }
  
  if (bookmark.description) {
    const desc = document.createElement('div');
    desc.className = 'van-bookmark-description';
    desc.textContent = bookmark.description;
    a.appendChild(desc);
  }
  
  div.appendChild(a);
  return div;
}

export function renderBookmarks(containerId, yamlContent) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with ID ${containerId} not found`);
  }
  
  const data = load(yamlContent);
  if (data?.list) {
    data.list.forEach(bookmark => {
      if (bookmark.href) {
        container.appendChild(createBookmarkElement(bookmark));
      }
    });
  }
}
