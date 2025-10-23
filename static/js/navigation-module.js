// navigation-module.js
// Merged navigation module (Menu + Index) using vanilla JavaScript
// Renders to SEPARATE containers: #menu-container and #index-container

class NavigationModule {
    constructor() {
        this.menuContainer = null;
        this.indexContainer = null;
        this.isInitialized = false;
        
        // Shared data
        this.currentPath = window.location.pathname;
        this.catalogName = null;
        this.topicName = null;
        this.postName = null;
        this.subpostName = null;
        
        this.indexData = null;
        this.topicData = null;
        
        // Loading states
        this.isLoadingIndex = false;
        this.isLoadingTopic = false;
        
        // Menu state
        this.activeSubmenuName = null;
    }

    // Initialize the navigation module with SEPARATE containers
    async init(menuMountElement = '#menu-container', indexMountElement = '#index-container') {
        if (this.isInitialized) {
            console.warn('Navigation already initialized');
            return;
        }

        // Get containers
        this.menuContainer = document.querySelector(menuMountElement);
        this.indexContainer = document.querySelector(indexMountElement);

        if (!this.menuContainer) {
            console.warn(`Menu container ${menuMountElement} not found`);
        }
        if (!this.indexContainer) {
            console.warn(`Index container ${indexMountElement} not found`);
        }

        if (!this.menuContainer && !this.indexContainer) {
            console.warn('No containers found');
            return;
        }

        this.isInitialized = true;
        
        this.parsePath();
        
        // Load data first
        await this.loadIndexData();
        if (this.topicName) {
            await this.loadTopicData();
        }
        // Render AFTER data is loaded
        this.renderAll();
        
        this.setupEventListeners();
        return this;
    }

    // Parse current URL path
    parsePath() {
        let pathParts = this.currentPath.split('/').filter(p => p);
        if (pathParts.at(-1) === 'index.html') {
            pathParts.pop();
        }

        this.catalogName = pathParts[0] || null;
        this.topicName = pathParts[1] || null;
        this.postName = pathParts[2] || null;
        this.subpostName = pathParts[3] || null;
    }

    // Computed properties (as getters)
    get isHome() {
        return !this.catalogName;
    }

    get isCatalog() {
        return this.catalogName && !this.topicName;
    }

    get isTopic() {
        return this.topicName && !this.postName;
    }

    get isPost() {
        return this.postName;
    }

    get isSubpost() {
        return this.subpostName;
    }

    get catalogs() {
        return this.indexData?.catalogs || [];
    }

    get catalog() {
        return this.catalogs.find(c => c.name === this.catalogName) || null;
    }

    get topics() {
        return this.catalog?.list || [];
    }

    get topic() {
        return this.topics.find(t => t.name === this.topicName) || null;
    }

    get posts() {
        return this.topicData?.list || [];
    }

    get post() {
        return this.posts.find(p => p.name === this.postName) || null;
    }

    get subposts() {
        return this.post?.list || [];
    }

    get subpost() {
        return this.subposts.find(p => p.name === this.subpostName) || null;
    }

    get toolbox() {
        return this.indexData?.toolbox || [];
    }

    get favorites() {
        return this.indexData?.favorites || [];
    }

    // Load index data from YAML
    async loadIndexData() {
        if (this.indexData) return;

        this.isLoadingIndex = true;
        try {
            const response = await fetch('/index.yaml');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const yamlContent = await response.text();
            this.indexData = jsyaml.load(yamlContent);
        } catch (error) {
            console.error('Error loading index data:', error);
            this.indexData = { catalogs: [], toolbox: [], favorites: [] };
        } finally {
            this.isLoadingIndex = false;
        }
    }

    // Load topic data from YAML
    async loadTopicData() {
        this.isLoadingTopic = true;
        try {
            const response = await fetch(`/${this.catalogName}/${this.topicName}/index.yaml`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const yamlContent = await response.text();
            this.topicData = jsyaml.load(yamlContent);
        } catch (error) {
            console.error('Error loading topic data:', error);
        } finally {
            this.isLoadingTopic = false;
        }
    }

    // RENDER ALL COMPONENTS
    renderAll() {
        if (this.indexContainer) {
            this.renderIndex();
        }
        if (this.menuContainer) {
            this.renderMenu();
        }
    }

    // RENDER INDEX ONLY
    renderIndex() {
        if (!this.indexContainer) return;
        this.indexContainer.innerHTML = this.getIndexTemplate();
    }

    // RENDER MENU ONLY
    renderMenu() {
        if (!this.menuContainer) return;
        this.menuContainer.innerHTML = this.getMenuTemplate();
        this.attachMenuEventListeners();
    }

    // INDEX TEMPLATE
    getIndexTemplate() {
        if (this.isLoadingIndex) {
            return '<div class="loading">Loading index...</div>';
        }

        let html = '';

        // Favorites (Home only)
        if (this.isHome && this.favorites?.length) {
            html += `
                <div class="van-favorite">
                    <div class="van-items">
                        ${this.favorites.map(item => `
                            <a class="van-href" href="${item.href}">
                                ${item.icon ? `<img src="${item.icon}" class="van-icon" alt="${this.title(item)}">` : ''}
                                <div class="van-href-title ${!item.icon ? 'van-href-noimg-title' : ''}">${this.title(item)}</div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Home - Catalogs
        if (this.isHome) {
            html += `
                <div>
                    ${this.catalogs.map(catalog => `
                        <div class="van-panel">
                            <div class="van-panel-title">${this.title(catalog)}</div>
                            <div class="van-items">
                                ${catalog.list.map(topic => `
                                    <a class="van-href" href="/${catalog.name}/${topic.name}">
                                        ${topic.icon ? `<img src="${topic.icon}" class="van-icon">` : ''}
                                        <div class="van-href-title ${!topic.icon ? 'van-href-noimg-title' : ''}">${this.title(topic)}</div>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Catalog - Topics
        else if (this.isCatalog) {
            html += `
                <div class="van-items">
                    ${this.topics.map(topic => `
                        <a class="van-href" href="/${this.catalogName}/${topic.name}">
                            ${topic.icon ? `<img src="${topic.icon}" class="van-icon">` : ''}
                            <div class="van-href-title ${!topic.icon ? 'van-href-noimg-title' : ''}">${this.title(topic)}</div>
                        </a>
                    `).join('')}
                </div>
            `;
        }

        // Topic/Post - Posts list
        else if (this.isTopic || this.isPost) {
            html += `
                <div class="van-list">
                    ${this.topic?.icon ? `<a href="/${this.catalogName}/${this.topic.name}"><img src="${this.topic.icon}" class="van-icon"></a>` : ''}
                    ${this.posts.map(post => `
                        <div>
                            <a class="van-href ${post.list ? 'van-section' : ''}" href="/${this.catalogName}/${this.topicName}/${post.name}">
                                ${this.title(post)}
                            </a>
                            ${post.list ? post.list.map(subpost => `
                                <div class="van-subpost-item">
                                    <a class="van-href" href="/${this.catalogName}/${this.topicName}/${post.name}/${subpost.name}">
                                        ${this.title(subpost)}
                                    </a>
                                </div>
                            `).join('') : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return html;
    }

    // MENU TEMPLATE
    getMenuTemplate() {
        if (this.isHome) return ''; // No menu on home

        let html = `
            <div id="menu" class="menu">
                <!-- Home -->
                <div class="menu-item">
                    <a href="/"><img src="/images/home.svg"></a>
                </div>
        `;

        // Topics Menu
        if (this.topics.length > 0) {
            html += `
                <div class="menu-item ${this.isHome ? 'hidden' : ''}" data-submenu="topics">
                    <span>${this.title(this.topic)}</span>
                    <div class="submenu">
                        ${this.topics.map(t => `
                            <div class="submenu-item">
                                <a href="/${this.catalogName}/${t.name}">${this.title(t)}</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Posts Menu
        if (this.post && this.posts.length > 0) {
            html += `
                <div class="menu-item ${this.isHome || this.isTopic ? 'hidden' : ''}" data-submenu="posts">
                    <span>${this.title(this.post)}</span>
                    <div class="submenu">
                        ${this.posts.map(p => `
                            <div class="submenu-item ${p.list ? 'submenu-item-section' : ''}">
                                <a href="/${this.catalogName}/${this.topicName}/${p.name}">${this.title(p)}</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Subposts Menu
        if (this.subpost && this.subposts.length > 0) {
            html += `
                <div class="menu-item ${!this.isSubpost ? 'hidden' : ''}" data-submenu="subposts">
                    <span>${this.title(this.subpost)}</span>
                    <div class="submenu">
                        ${this.subposts.map(p => `
                            <div class="submenu-item">
                                <a href="/${this.catalogName}/${this.topicName}/${this.post.name}/${p.name}">${this.title(p)}</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Toolbox Menu
        html += `
                <div class="menu-item menu-item-right" data-submenu="toolbox">
                    <img src="/images/tools.svg" alt="Toolbox">
                    <div class="submenu submenu-right">
                        ${this.toolbox.map(tool => `
                            <div class="submenu-item">
                                <a href="${tool.href}" target="_blank">${this.title(tool)}</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // Utility methods
    title(item) {
        return item?.title || item?.name;
    }

    // Menu event handling
    setupEventListeners() {
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    attachMenuEventListeners() {
        if (!this.menuContainer) return;
        
        const menuItems = this.menuContainer.querySelectorAll('.menu-item[data-submenu]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const submenuName = item.dataset.submenu;
                this.toggleSubmenu(submenuName);
            });
        });
    }

    handleOutsideClick(e) {
        if (!e.target.closest('.menu-item')) {
            this.closeSubmenu();
        }
    }

    toggleSubmenu(submenuName) {
        if (this.activeSubmenuName === submenuName) {
            this.closeSubmenu();
        } else {
            this.activeSubmenuName = submenuName;
            this.updateSubmenuVisibility();
        }
    }

    closeSubmenu() {
        this.activeSubmenuName = null;
        this.updateSubmenuVisibility();
    }

    updateSubmenuVisibility() {
        if (!this.menuContainer) return;
        
        const submenus = this.menuContainer.querySelectorAll('.submenu');
        submenus.forEach(submenu => {
            const parentItem = submenu.closest('.menu-item');
            const submenuName = parentItem.dataset.submenu;
            
            if (submenuName === this.activeSubmenuName) {
                submenu.classList.add('show');
                parentItem.classList.add('active');
            } else {
                submenu.classList.remove('show');
                parentItem.classList.remove('active');
            }
        });
    }

    // Public methods
    refresh() {
        this.parsePath();
        this.renderAll();
    }

    destroy() {
        this.menuContainer = null;
        this.indexContainer = null;
        this.isInitialized = false;
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }
}

// Create global instance and auto-initialize
window.NavigationModule = NavigationModule;

document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize if BOTH containers exist
    if (document.querySelector('#menu-container') || document.querySelector('#index-container')) {
        const navModule = new NavigationModule();
        navModule.init();
        window.navInstance = navModule;
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationModule;
}
