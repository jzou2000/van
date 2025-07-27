// index-module.js
// Reusable index component that can be imported into any page

class IndexModle {

    constructor() {
        this.indexComponent = null;
        this.app = null;
    }

    // Initialize the index component
    init(mountElement = '#index-container') {
        if (this.app) {
            console.warn('Index already initialized');
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
                favorites() {
                    return this.indexData?.favorites || [];
                }
            },
            
            async mounted() {
                this.parsePath();
                await this.loadIndexData();
                if (this.topicName) {
                    await this.loadTopicData();
                }
            },
            
            methods: {

                parsePath() {
                    //console.log(`currentPath=${this.currentPath}`)
                    let pathParts = this.currentPath.split('/').filter(p => p);
                    if (pathParts.at(-1) === 'index.html') {
                        let lastPart = pathParts.pop();
                    }

                    this.topicName = null;
                    this.postName = null;

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
                        console.log('Index data loaded:', this.indexData);
                        //console.log('catalogs: ', this.catalogs);
                    } catch (error) {
                        console.error('Error loading index data:', error);
                        // Fallback to empty data
                        this.indexData = { catalogs: [], favorites: [] };
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
                        //console.log('posts=:', this.posts);
                    } catch (error) {
                        console.error('Error loading topic data:', error);
                    } finally {
                        this.isLoadingTopic = false;
                    }
                },
                
                title(item) {
                    return item?.title || item?.name;
                },

                href(item) {
                    return item?.href;
                },

                topicPath(catalogName, topic) {
                    return `/${catalogName}/${topic.name}`;
                },
                
                postPath(post, subpost = null) {
                    return `/${this.catalogName}/${this.topicName}/${post.name}` + (subpost ? `/${subpost.name}` : '');
                },
            },
            
            template: `
                <div class="van-favorite" v-if="isHome && favorites">
                    <div class="van-items">
                        <a class="van-href"
                            v-for="t in favorites" :key="t.name"
                            :href="href(t)">
                            <img :src="t.icon" class="van-icon" v-if="t.icon" :alt="title(t)">
                            <div class="van-href-title" v-if="!t.icon">{{ title(t) }}</div>
                        </a>
                    </div>
                </div>

                <div v-if="isHome">
                    <div class="van-panel"
                        v-for="c in catalogs" :key="c.name">
                        <div class="van-panel-title">{{ title(c) }}</div>
                        <div class="van-items">
                            <a class="van-href"
                                v-for="t in c.list" :key="t.name"
                                :href="topicPath(c.name, t)">
                                <img :src="t.icon" class="van-icon" v-if="t.icon">
                                <div class="van-href-title"
                                 :class="{'van-href-noimg-title': !t.icon}">{{ title(t) }}</div>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="van-items" v-if="isCatalog">
                    <a class="van-href"
                        v-for="t in topics" :key="t.name"
                        :href="topicPath(catalogName, t)">
                        <img :src="t.icon" class="van-icon" v-if="t.icon">
                        <div class="van-href-title"
                         :class="{'van-href-noimg-title': !t.icon}">{{ title(t) }}</div>
                    </a>
                </div>

                <div class="van-list" v-if="isTopic || isPost">
                    <img :src="topic.icon" class="van-icon" v-if="topic.icon">
                    <div v-for="p in posts" :key="p.name">
                        <div>
                            <a class="van-href" :href="postPath(p)" :class="{ 'van-section': p?.list }">
                            {{ title(p) }}
                            </a>
                        </div>
                        <div class="van-subpost-item"
                            v-for="s in p.list" :key="p.name" v-if="p.list">
                            <div>
                                <a class="van-href" :href="postPath(p, s)">
                                {{ title(s) }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });
        
        this.indexComponent = this.app.mount(mountElement);
        return this.indexComponent;
    }

    // Public method to refresh index
    refresh() {
        if (this.indexComponent) {
            this.indexComponent.refresh();
        }
    }

    // Public method to destroy index
    destroy() {
        if (this.app) {
            this.app.unmount();
            this.app = null;
            this.indexComponent = null;
        }
    }
}

// Create global instance
window.IndexModle = IndexModle;

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#index-container')) {
        const indexModule = new IndexModle();
        indexModule.init();
        
        // Make it globally accessible
        window.indexInstance = indexModule;
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexModle;
}
