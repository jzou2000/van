import { load } from 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm';
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

function _createItem(item, opt) {
  const div = document.createElement('div');
  div.className = 'van-img-grid-item';
  
  var container = div;
  if (item.href) {
    const a = document.createElement('a');
    a.href = item.href;
    if (item.blank || opt?.blank != 'false') {
      a.target = item.target || '_blank';
    }
    a.className = 'van-img-grid-link';
    div.appendChild(a);
    container = a;
  }
  
  if (item.img) {
    const img = document.createElement('img');
    img.className = 'van-img-grid-image';
    img.src = item.img;
    container.appendChild(img);
  }
  
  if (item.title) {
    const title = document.createElement('div');
    title.className = 'van-img-grid-title';
    title.textContent = item.title;
    container.appendChild(title);
  }
  
  if (item.text) {
    const desc = document.createElement('div');
    desc.className = 'van-img-grid-text';
    desc.innerHTML = marked.parse(item.text);
    container.appendChild(desc);
  }
  if (item.description) {
    const desc = document.createElement('div');
    desc.className = 'van-img-grid-text';
    desc.innerHTML = marked.parse(item.description);
    container.appendChild(desc);
  }
  
  return div;
}

export function renderImgGrid(containerId, yamlContent, opt = undefined) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with ID ${containerId} not found`);
  }
  
  const data = load(yamlContent);
  if (data?.list) {
    data.list.forEach(item => {
      container.appendChild(_createItem(item, opt));
    });
  } else {
    data.forEach(item => {
      container.appendChild(_createItem(item, opt));
    });
  }
}
