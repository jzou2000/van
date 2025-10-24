import { load } from 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm';
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

function _createItem(container, item, opt) {
  const size = opt?.size;
  const head = document.createElement('div');
  head.className = 'van-list-head' + (size ? ' van-list-head-' + size : '');
  
  if (item.img) {
    const img = document.createElement('img');
    img.className = 'van-list-img';
    img.src = item.img;
    if (item.href) {
      const a = document.createElement('a');
      a.href = item.href;
      if (item.blank || opt?.blank != 'false') {
        a.target = "_blank";
      }
      a.appendChild(img);
      head.appendChild(a);
    } else {
      head.appendChild(img);
    }
  }
  
  if (item.yt) {
    const yt = document.createElement('iframe');
    yt.className = 'van-list-yt';
    yt.src = "https://www.youtube.com/embed/" + item.yt;
    yt.allowFullscreen = true;
    yt.loading = "lazy";
    yt.frameborder = "0";
    head.appendChild(yt);
  }

  const desc = document.createElement('div');
  desc.className = 'van-list-desc';
  
  if (item.title) {
    const title = document.createElement('div');
    title.className = 'van-list-title';
    title.textContent = item.title;
    desc.appendChild(title);
  }
  
  if (item.text) {
    const text = document.createElement('div');
    text.className = 'van-list-text';
    text.innerHTML = marked.parse(item.text);
    desc.appendChild(text);
  }
  
  if (item.description) {
    const text = document.createElement('div');
    text.className = 'van-list-text';
    text.innerHTML = marked.parse(item.description);
    desc.appendChild(text);
  }
  
  container.appendChild(head);
  container.appendChild(desc);
}

export function renderImgYtList(containerId, yamlContent, opt = undefined) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with ID ${containerId} not found`);
  }
  
  const data = load(yamlContent);
  data.forEach(item => {
      _createItem(container, item, opt);
  });
}
