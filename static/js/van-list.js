import { load } from 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm';

function _createItem(container, item) {
  const iv = document.createElement('div');
  iv.className = 'van-ivlist-imgv';
  
  if (item.img) {
    const img = document.createElement('img');
    img.className = 'van-ivlist-img';
    img.src = item.img;
    iv.appendChild(img);
  }
  
  if (item.yt) {
    const yt = document.createElement('iframe');
    yt.className = 'van-ivlist-yt';
    yt.src = "https://www.youtube.com/embed/" + item.yt;
    yt.allowFullscreen = true;
    yt.loading = "lazy";
    yt.frameborder = "0";
    yt.style = "top: 0; left: 0; width: 100%; height: 100%;";
    iv.appendChild(yt);
  }

  const desc = document.createElement('div');
  desc.className = 'van-ivlist-desc';
  
  if (item.title) {
    const title = document.createElement('div');
    title.className = 'van-ivlist-title';
    title.textContent = item.title;
    desc.appendChild(title);
  }
  
  if (item.text) {
    const text = document.createElement('div');
    text.className = 'van-ivlist-text';
    text.textContent = item.text;
    desc.appendChild(text);
  }
  
  if (item.description) {
    const text = document.createElement('div');
    text.className = 'van-ivlist-text';
    text.textContent = item.description;
    desc.appendChild(text);
  }
  
  container.appendChild(iv);
  container.appendChild(desc);
}

export function renderVanlist(containerId, yamlContent) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with ID ${containerId} not found`);
  }
  
  const data = load(yamlContent);
    data.forEach(item => {
        _createItem(container, item);
    });
}
