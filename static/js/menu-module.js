// menu-module.js
// Reusable menu component that can be imported into any page

class MenuModule {

    constructor() {
        this.menuComponent = null;
        this.app = null;
    }

    // Initialize the menu component
    init(mountElement = '#menu-container') {
        if (this.app) {
            console.warn('Menu already initialized');
            return;
        }

        const { createApp, ref } = Vue;
        
        this.app = createApp({
            data() {
                return {
                    currentPath: window.location.pathname,

                    // path name parse result
                    catalogName: null,
                    topicName: null,
                    postName: null,
                    subpostName: null,
                    
                    activeSubmenuName: null,
                    
                    // Data loaded from YAML files
                    indexData: null,
                    topicData: null,
                    
                    // Loading states
                    isLoadingIndex: false,
                    isLoadingTopic: false
                };
            },
            
            computed: {
                isHome() {
                    return !this.catalogName;
                },
                isCatalog() {
                    return this.catalogName && !this.topicName;
                },
                isTopic() {
                    return this.topicName && !this.postName;
                },
                isPost() {
                    return this.postName;
                },
                isSubpost() {
                    return this.subpostName;
                },
                isSection() {
                    return !this.isSupost && this.subposts.length;
                },
                catalogs() {
                    return this.indexData?.catalogs || [];
                },
                catalog() {
                    return this.catalogs.find(c => c.name === this.catalogName) || null;
                },
                topics() {
                    return this.catalog?.list || [];
                },
                topic() {
                    return this.topics.find(t => t.name === this.topicName);
                },
                posts() {
                    return this.topicData?.list || [];
                },
                post() {
                    return this.posts.find(p => p.name === this.postName);
                },
                subposts() {
                    return this.post?.list || [];
                },
                subpost() {
                    return this.subposts.find(p => p.name === this.subpostName);
                },
                toolbox() {
                    return this.indexData?.toolbox || [];
                }
            },
            
            async mounted() {
                this.parsePath();
                await this.loadIndexData();
                if (this.topicName) {
                    await this.loadTopicData();
                }
                this.setupEventListeners();
            },
            
            methods: {

                parsePath() {
                    //console.log(`currentPath=${this.currentPath}`)
                    let pathParts = this.currentPath.split('/').filter(p => p);
                    if (pathParts.at(-1) === 'index.html') {
                        let lastPart = pathParts.pop();
                    }
    
                    this.catalogName = pathParts[0];
                    this.topicName = pathParts[1];
                    this.postName = pathParts[2];
                    this.subpostName = pathParts[3];
                },

                async loadIndexData() {
                    // index.yaml contains all catalogs and topics, and toolbox

                    if (this.indexData) return; // Already loaded
                    
                    this.isLoadingIndex = true;
                    try {
                        const response = await fetch('/index.yaml');
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        
                        const yamlContent = await response.text();
                        this.indexData = jsyaml.load(yamlContent);
                        //console.log('Index data loaded:', this.indexData);
                    } catch (error) {
                        console.error('Error loading index data:', error);
                        // Fallback to empty data
                        this.indexData = { catalogs: [], toolbox: [] };
                    } finally {
                        this.isLoadingIndex = false;
                    }
                },
                
                async loadTopicData() {
                    this.isLoadingTopic = true;
                    try {
                        const response = await fetch(`/${this.catalogName}/${this.topicName}/index.yaml`);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        
                        const yamlContent = await response.text();
                        this.topicData = jsyaml.load(yamlContent);
                        console.log('Topic data loaded:', this.topicData);
                    } catch (error) {
                        console.error('Error loading topic data:', error);
                    } finally {
                        this.isLoadingTopic = false;
                    }
                },
                
                setupEventListeners() {
                    // Close submenus when clicking outside
                    document.addEventListener('click', (e) => {
                        if (!e.target.closest('.menu-item')) {
                            this.closeSubmenu();
                        }
                    });
                },
                
                toggleSubmenu(submenuName) {
                    if (this.activeSubmenuName === submenuName) {
                        this.closeSubmenu();
                    } else {
                        this.activeSubmenuName = submenuName;
                    }
                },
                
                closeSubmenu() {
                    this.activeSubmenuName = null;
                },
                
                title(item) {
                    return item?.title || item?.name;
                },

                href(item) {
                    return item?.href;
                },

                topicPath(topic) {
                    return `/${this.catalogName}/${topic.name}`;
                },
                
                postPath(post, subpost = null) {
                    return `/${this.catalogName}/${this.topicName}/${post.name}` + (subpost ? `/${subpost.name}` : '');
                },
                
                // Public method to refresh menu when page changes externally
                refresh() {
                }
            },
            
            template: `
                <div id="menu" class="menu" v-if="!isHome">
                    <!-- Home Menu Item -->
                    <div class="menu-item">
                        <a href="/"><img src="/images/home.svg"></a>
                    </div>

                    <div class="menu-item" :class="{ hidden: isHome }" @click="toggleSubmenu('topics')" vv-if="topics.length > 0">
                    <!-- Topic Menu Item -->
                        <span>{{ title(topic) }}</span>
                        <div class="submenu" :class="{ show: activeSubmenuName === 'topics' }">
                            <div class="submenu-item" 
                                v-for="t in topics" 
                                :key="t.name">
                                <a :href="topicPath(t)">{{ title(t) }}</a>
                            </div>
                        </div>
                    </div>

                    <div class="menu-item" :class="{ hidden: isHome || isTopic }" @click="toggleSubmenu('posts')" v-if="post && posts.length > 0">
                    <!-- Posts Menu Item -->
                        <span>{{ title(post) }}</span>
                        <div class="submenu" :class="{ show: activeSubmenuName === 'posts' }">
                            <div class="submenu-item"
                                v-for="p in posts"
                                :key="p.name"
                                :class="{ 'submenu-item-section': p.list}">
                                <a :href="postPath(p)">{{ title(p) }}</a>
                            </div>
                        </div>
                    </div>

                    <div class="menu-item" :class="{ hidden: !isSubpost }" @click="toggleSubmenu('subposts')" v-if="subpost && subposts.length > 0">
                    <!-- SubPosts Menu Item -->
                        <span>{{ title(subpost) }}</span>
                        <div class="submenu" :class="{ show: activeSubmenuName === 'subposts' }">
                            <div class="submenu-item"
                                v-for="p in subposts"
                                :key="p.name">
                                <a :href="postPath(post, p)">{{ title(p) }}</a>
                            </div>
                        </div>
                    </div>

                    <div class="menu-item menu-item-right" @click="toggleSubmenu('toolbox')">
                    <!-- Toolbox Menu Item -->
                        <img src="/images/tools.svg" alt="Toolbox">
                        <div class="submenu submenu-right" :class="{ show: activeSubmenuName === 'toolbox' }">
                            <div class="submenu-item" 
                                 v-for="tool in toolbox" 
                                 :key="tool.name">
                                <a :href="tool.href" target="_blank">{{ title(tool) }}</a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });
        
        this.menuComponent = this.app.mount(mountElement);
        return this.menuComponent;
    }

    // Public method to refresh menu
    refresh() {
        if (this.menuComponent) {
            this.menuComponent.refresh();
        }
    }

    // Public method to destroy menu
    destroy() {
        if (this.app) {
            this.app.unmount();
            this.app = null;
            this.menuComponent = null;
        }
    }
}

// Create global instance
window.MenuModule = MenuModule;

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#menu-container')) {
        const menuModule = new MenuModule();
        menuModule.init();
        
        // Make it globally accessible
        window.menuInstance = menuModule;
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuModule;
}
