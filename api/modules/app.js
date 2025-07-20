import { AzureDevOpsManager } from '../data/azure-devops.js';
import { FirebaseManager } from '../data/firebase-data.js';
import { PortfolioManager } from '../data/portfolio-data.js';
import { SessionManager } from '../auth/session-manager.js';
import { UIManager } from '../ui/components.js';
import { ToastManager } from '../ui/toast.js';
import { FiltersManager } from '../ui/filters.js';

export class VolvoOneViewApp {
    constructor() {
        // Managers
        this.devops = new AzureDevOpsManager();
        this.firebase = new FirebaseManager();
        this.portfolio = new PortfolioManager();
        this.session = new SessionManager();
        this.ui = new UIManager();
        this.toast = new ToastManager();
        this.filters = new FiltersManager();

        // State - PRESERVAR TODAS AS VARIÁVEIS ORIGINAIS
        this.devopsData = { items: [], relations: [] };
        this.localInitiativeData = new Map();
        this.initiativeData = new Map();
        this.isDirectAccess = false;
        this.directorFilter = null;
        this.currentUser = null;

        // DOM Elements que eram globais
        this.filterMarket = null;
        this.filterBpo = null;
        this.filterDpm = null;
        this.filterTags = null;
        this.searchInput = null;

        // Azure SQL Connection State
        this.azureSqlConnected = false;
        this.fallbackData = this.initializeFallbackData();
    }

    // DADOS FALLBACK PRESERVADOS DO BACKUP
    initializeFallbackData() {
        return {
            "703447": {
                market: "Brazil",
                dpm: "Alberto Muller Neto",
                businessOwner: "Felipe Brandão",
                po: "Priscilla Fernandes",
                tdpo: "Sourabh Sharma",
                architect: "",
                cybersecurity: "",
                strategicIntent: "Select and Implement of centralized WhatsApp/Chatbot Platform to provide customer support.",
                keyResults: ["Seamless Omnichannel Experience", "Customer Support"],
                deadlineStatus: "green",
                extCost: "0",
                intRes: "0",
                modifiedBy: "azure-integration"
            },
            "777222": {
                market: "Mexico", 
                dpm: "Alberto Muller Neto",
                businessOwner: "Manuel Gomez",
                po: "",
                tdpo: "",
                architect: "",
                cybersecurity: "",
                strategicIntent: "The SAC-F Server Migration project aims to transition the core banking server",
                keyResults: ["Ensure Business Continuity", "Increase Security and Compliance"],
                deadlineStatus: "yellow",
                extCost: "0",
                intRes: "800",
                modifiedBy: "azure-integration"
            }
        };
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Volvo OneView...');
            
            // PRESERVAR TODA A LÓGICA ORIGINAL DE INICIALIZAÇÃO
            await this.checkDirectAccess();
            await this.initializeAuthentication();
            await this.setupUI();
            await this.loadInitialData();
            
            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.toast.show('Initialization failed', 'error');
        }
    }

    // PRESERVAR FUNÇÃO ORIGINAL
    checkDirectAccess() {
        const urlParams = new URLSearchParams(window.location.search);
        const director = urlParams.get('director');
        
        if (director) {
            this.isDirectAccess = true;
            this.directorFilter = decodeURIComponent(director);
            console.log(`🎯 Direct access for director: ${this.directorFilter}`);
        }
        
        return { isDirectAccess: this.isDirectAccess, directorFilter: this.directorFilter };
    }

    // PRESERVAR TODA A LÓGICA DE AUTH ORIGINAL
    async initializeAuthentication() {
        const authResult = await this.session.checkExistingAuth();
        
        if (authResult.isAuthenticated) {
            this.currentUser = authResult.user;
            await this.showMainApp();
        } else {
            await this.showLoginScreen();
        }
    }

    // RENDERIZAR HTML ORIGINAL COMPLETO DO SEU INDEX.HTML
    async setupUI() {
        if (!this.currentUser) return;
        
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
            <header class="volvo-header sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between py-3">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Volvo-Iron-Mark-Black.svg" 
                                     class="volvo-logo h-8 w-8" alt="Volvo Logo">
                            </div>
                            <div>
                                <h1 class="volvo-title">Volvo OneView</h1>
                                <p class="volvo-subtitle">Strategic Portfolio Management</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                                <div class="w-5 h-5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-white text-xs"></i>
                                </div>
                                <span class="text-sm font-medium text-gray-700" id="currentUser">${this.currentUser.name || 'User'}</span>
                            </div>
                            <button id="logoutBtn" class="btn btn-secondary text-sm">
                                <i class="fas fa-sign-out-alt mr-2"></i>Logout
                            </button>
                        </div>
                    </div>
                    <nav class="flex border-t border-gray-200 pt-1">
                        <button id="tab-config" class="tab-elegant active">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-cogs"></i>
                                <span>Configuration</span>
                            </div>
                        </button>
                        <button id="tab-onepagers" class="tab-elegant">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-chart-bar"></i>
                                <span>Portfolio</span>
                            </div>
                        </button>
                    </nav>
                </div>
            </header>

            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div id="config-tab-content" class="tab-content active">
                    <div class="space-y-6">
                        <!-- Etapa 1: Carregar Dados -->
                        <div id="config-step-1" class="config-card p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-semibold text-gray-800">Data Synchronization</h2>
                                <button id="settings-btn" class="text-gray-400 hover:text-teal-600 hidden">
                                    <i class="fas fa-cog text-lg"></i>
                                </button>
                            </div>
                            <div class="flex items-center gap-4 mb-6">
                                <button id="load-data-btn" class="btn btn-primary">
                                    <i class="fas fa-sync-alt mr-2"></i>Load Data
                                </button>
                                <div class="flex items-center gap-2">
                                    <div id="connection-status" class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span class="text-sm text-gray-600">Azure SQL: <span id="sql-status">Connecting...</span></span>
                                </div>
                            </div>
                        </div>

                        <!-- Etapa 2: Editar Dados -->
                        <div id="config-step-2" class="config-card p-6 hidden">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <h2 class="text-lg font-semibold text-gray-800">Edit and View</h2>
                                    <p class="text-gray-600 text-sm">Select an initiative to edit custom data.</p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="md:col-span-1">
                                    <h3 class="text-base font-medium mb-3">Initiatives</h3>
                                    <div id="initiatives-preview-list" class="border rounded-lg max-h-96 overflow-y-auto p-2">
                                        <!-- JS will render here -->
                                    </div>
                                </div>

                                <div class="md:col-span-2 space-y-6">
                                    <div id="edit-form-section" class="hidden">
                                        <form id="edit-form" class="space-y-4 bg-gray-50 p-4 rounded-lg">
                                            <input type="hidden" id="edit-initiative-id">
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label class="block font-medium text-sm mb-1">Market</label>
                                                    <select id="edit-market" class="select-field"></select>
                                                </div>
                                                <div>
                                                    <label class="block font-medium text-sm mb-1">Deadline Status</label>
                                                    <select id="edit-deadline-status" class="select-field">
                                                        <option value="green">On Time</option>
                                                        <option value="yellow">At Risk</option>
                                                        <option value="red">Delayed</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label class="block font-medium text-sm mb-1">DPM</label>
                                                    <input type="text" id="edit-dpm" class="input-field">
                                                </div>
                                                <div>
                                                    <label class="block font-medium text-sm mb-1">Business Owner</label>
                                                    <input type="text" id="edit-business-owner" class="input-field">
                                                </div>
                                            </div>
                                            <button id="save-edits-btn" type="button" class="btn btn-success w-full">
                                                Save Changes
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="onepagers-tab-content" class="tab-content">
                    <div id="portfolio-container" class="space-y-6">
                        <div class="config-card p-8 text-center text-gray-500">
                            Use the "Configuration" tab to load and edit data.
                        </div>
                    </div>
                </div>
            </main>
        `;
        
        // PRESERVAR TODOS OS EVENT LISTENERS ORIGINAIS
        this.bindAllOriginalEvents();
    }

    // PRESERVAR TODAS AS FUNÇÕES ORIGINAIS + AZURE SQL
    bindAllOriginalEvents() {
        // Tab switching
        const tabConfig = document.getElementById('tab-config');
        const tabOnepagers = document.getElementById('tab-onepagers');
        
        if (tabConfig) tabConfig.addEventListener('click', () => this.switchTab('config'));
        if (tabOnepagers) tabOnepagers.addEventListener('click', () => this.switchTab('onepagers'));

        // Load data button
        const loadDataBtn = document.getElementById('load-data-btn');
        if (loadDataBtn) {
            loadDataBtn.addEventListener('click', async () => {
                await this.loadAllInitiativeData();
            });
        }

        // Save edits button  
        const saveEditsBtn = document.getElementById('save-edits-btn');
        if (saveEditsBtn) {
            saveEditsBtn.addEventListener('click', async () => {
                await this.saveInitiativeEdits();
            });
        }

        // Event listeners dos filtros
        this.filterMarket = document.getElementById('filter-market');
        this.filterBpo = document.getElementById('filter-bpo');
        this.filterDpm = document.getElementById('filter-dpm');
        
        if (this.filterMarket) {
            this.filterMarket.addEventListener('change', () => this.applyFiltersAndRender());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.session.logout());
        }
    }

    // FUNÇÃO DE CONEXÃO COM AZURE SQL (PRESERVADA DO BACKUP)
    async connectToAzureSQL() {
        try {
            console.log('🔗 Connecting to Azure SQL Database...');
            
            const response = await fetch('/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const healthData = await response.json();
                console.log('✅ Azure SQL connection successful:', healthData);
                
                this.azureSqlConnected = healthData.database === 'CONNECTED';
                this.updateConnectionStatus(true);
                
                return { success: true, data: healthData };
            } else {
                throw new Error(`Connection failed: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Azure SQL connection failed:', error);
            this.azureSqlConnected = false;
            this.updateConnectionStatus(false);
            
            return { success: false, error: error.message };
        }
    }

    // ATUALIZAR STATUS DA CONEXÃO
    updateConnectionStatus(connected) {
        const statusIndicator = document.getElementById('connection-status');
        const statusText = document.getElementById('sql-status');
        
        if (statusIndicator && statusText) {
            if (connected) {
                statusIndicator.className = 'w-2 h-2 bg-green-500 rounded-full animate-pulse';
                statusText.textContent = 'Connected';
            } else {
                statusIndicator.className = 'w-2 h-2 bg-red-500 rounded-full';
                statusText.textContent = 'Using Local Data';
            }
        }
    }

    // CARREGAR DADOS DO AZURE SQL (PRESERVADO DO BACKUP)
    async loadFromAzureSQL() {
        try {
            console.log('🔍 Loading data from Azure SQL Database...');
            
            const response = await fetch('/api/getInitiatives', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Data loaded from Azure SQL:', Object.keys(data).length, 'initiatives');
                
                return { 
                    success: true, 
                    data: data,
                    source: "Azure SQL Database",
                    timestamp: new Date().toISOString()
                };
            } else {
                throw new Error(`Failed to load data: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error loading from Azure SQL:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    // SALVAR NO AZURE SQL (PRESERVADO DO BACKUP)
    async saveToAzureSQL(initiatives) {
        try {
            console.log('💾 Saving to Azure SQL Database...');
            
            const response = await fetch('/api/saveInitiatives', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ initiatives })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Data saved to Azure SQL successfully');
                
                return { 
                    success: true, 
                    message: result.message,
                    timestamp: new Date().toISOString()
                };
            } else {
                throw new Error(`Save failed: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error saving to Azure SQL:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    // PRESERVAR FUNÇÃO ORIGINAL COMPLETA + AZURE SQL
    async loadAllInitiativeData() {
        try {
            console.log("🔄 Loading all initiative data...");
            this.toast.show('Loading portfolio data...', 'info');
            
            const loadDataBtn = document.getElementById('load-data-btn');
            if (loadDataBtn) {
                loadDataBtn.disabled = true;
                loadDataBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
            }

            // Tentar conectar com Azure SQL primeiro
            await this.connectToAzureSQL();

            // Carregar dados do Azure SQL ou fallback
            let dataLoaded = false;
            
            if (this.azureSqlConnected) {
                const azureData = await this.loadFromAzureSQL();
                
                if (azureData.success && azureData.data) {
                    this.localInitiativeData.clear();
                    for (const id in azureData.data) {
                        this.localInitiativeData.set(id, azureData.data[id]);
                    }
                    console.log("✅ Data loaded from Azure SQL:", Object.keys(azureData.data).length, "initiatives");
                    this.toast.show('Data loaded from Azure SQL Database!', 'success');
                    dataLoaded = true;
                }
            }

            // Fallback para dados locais se Azure SQL falhar
            if (!dataLoaded) {
                console.log("📁 Using fallback data...");
                this.localInitiativeData.clear();
                
                for (const id in this.fallbackData) {
                    this.localInitiativeData.set(id, this.fallbackData[id]);
                }
                
                this.toast.show('Using local fallback data', 'warning');
            }

            // Carregar dados do Azure DevOps
            await this.devops.loadWorkItems();
            await this.portfolio.processInitiatives();
            
            // Renderizar lista de iniciativas
            this.renderInitiativesList();
            
            // Mostrar próximas etapas
            const configStep2 = document.getElementById('config-step-2');
            if (configStep2) configStep2.classList.remove('hidden');
            
        } catch (error) {
            console.error("❌ Error loading data:", error);
            this.toast.show('Failed to load data', 'error');
        } finally {
            const loadDataBtn = document.getElementById('load-data-btn');
            if (loadDataBtn) {
                loadDataBtn.disabled = false;
                loadDataBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Load Data';
            }
        }
    }

    // RENDERIZAR LISTA DE INICIATIVAS
    renderInitiativesList() {
        const container = document.getElementById('initiatives-preview-list');
        if (!container) return;

        if (this.localInitiativeData.size === 0) {
            container.innerHTML = '<div class="p-4 text-center text-gray-500">No initiatives found</div>';
            return;
        }

        let html = '';
        this.localInitiativeData.forEach((data, id) => {
            const statusColor = {
                'green': 'bg-green-500',
                'yellow': 'bg-yellow-500', 
                'red': 'bg-red-500'
            }[data.deadlineStatus] || 'bg-gray-500';

            html += `
                <div class="initiative-preview-item p-3 border-b cursor-pointer hover:bg-gray-50" data-id="${id}">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-medium text-sm">${data.market || 'Unknown Market'}</span>
                        <div class="w-2 h-2 rounded-full ${statusColor}"></div>
                    </div>
                    <div class="text-xs text-gray-600 mb-1">${data.dpm || 'No DPM assigned'}</div>
                    <div class="text-xs text-gray-500">${data.businessOwner || 'No Business Owner'}</div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Adicionar event listeners para seleção
        container.querySelectorAll('.initiative-preview-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.selectInitiative(id);
            });
        });
    }

    // SELECIONAR INICIATIVA PARA EDIÇÃO
    selectInitiative(initiativeId) {
        const data = this.localInitiativeData.get(initiativeId);
        if (!data) return;

        // Atualizar visual da seleção
        document.querySelectorAll('.initiative-preview-item').forEach(item => {
            item.classList.remove('selected', 'bg-primary', 'text-white');
        });
        
        const selectedItem = document.querySelector(`[data-id="${initiativeId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected', 'bg-primary', 'text-white');
        }

        // Preencher formulário
        document.getElementById('edit-initiative-id').value = initiativeId;
        document.getElementById('edit-market').value = data.market || '';
        document.getElementById('edit-dpm').value = data.dpm || '';
        document.getElementById('edit-business-owner').value = data.businessOwner || '';
        document.getElementById('edit-deadline-status').value = data.deadlineStatus || 'green';

        // Mostrar formulário
        document.getElementById('edit-form-section').classList.remove('hidden');
    }

    // SALVAR EDIÇÕES DA INICIATIVA
    async saveInitiativeEdits() {
        const initiativeId = document.getElementById('edit-initiative-id').value;
        if (!initiativeId) {
            this.toast.show('No initiative selected', 'error');
            return;
        }

        const saveBtn = document.getElementById('save-edits-btn');
        const originalText = saveBtn.innerHTML;
        
        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';

            const editedData = {
                market: document.getElementById('edit-market').value,
                dpm: document.getElementById('edit-dpm').value, 
                businessOwner: document.getElementById('edit-business-owner').value,
                deadlineStatus: document.getElementById('edit-deadline-status').value,
                lastModified: new Date().toISOString(),
                modifiedBy: this.currentUser.name || 'OneView User'
            };

            // Mesclar com dados existentes
            const existingData = this.localInitiativeData.get(initiativeId) || {};
            const updatedData = { ...existingData, ...editedData };

            // Salvar localmente
            this.localInitiativeData.set(initiativeId, updatedData);

            // Tentar salvar no Azure SQL
            if (this.azureSqlConnected) {
                const initiativesToSave = Object.fromEntries(this.localInitiativeData);
                const saveResult = await this.saveToAzureSQL(initiativesToSave);
                
                if (saveResult.success) {
                    this.toast.show('Changes saved to Azure SQL Database!', 'success');
                } else {
                    this.toast.show('Saved locally (Azure SQL unavailable)', 'warning');
                }
            } else {
                this.toast.show('Changes saved locally', 'warning');
            }

            // Atualizar lista
            this.renderInitiativesList();
            this.selectInitiative(initiativeId);

        } catch (error) {
            console.error('❌ Error saving:', error);
            this.toast.show('Failed to save changes', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    // PRESERVAR FUNÇÃO ORIGINAL
    async applyFiltersAndRender() {
        const filteredData = this.filters.applyAllFilters(this.initiativeData);
        await this.renderOnePagers(filteredData);
    }

    // PRESERVAR TODA A RENDERIZAÇÃO ORIGINAL
    async renderOnePagers(initiatives) {
        const container = document.getElementById('portfolio-container');
        if (!container) return;
        
        // TODO: Implementar renderização completa dos one-pagers usando o código original
        container.innerHTML = `
            <div class="config-card p-6">
                <h2 class="text-lg font-semibold mb-4">Portfolio Overview</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${Array.from(this.localInitiativeData.entries()).map(([id, data]) => `
                        <div class="one-pager-card p-4">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium">${data.market}</span>
                                <div class="w-2 h-2 rounded-full bg-${data.deadlineStatus === 'green' ? 'green' : data.deadlineStatus === 'yellow' ? 'yellow' : 'red'}-500"></div>
                            </div>
                            <div class="text-sm text-gray-600 mb-1">DPM: ${data.dpm || 'Not assigned'}</div>
                            <div class="text-sm text-gray-500">Owner: ${data.businessOwner || 'Not assigned'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // PRESERVAR switchTab ORIGINAL
    switchTab(tabName) {
        const configTab = document.getElementById('tab-config');
        const onepagersTab = document.getElementById('tab-onepagers');
        const configContent = document.getElementById('config-tab-content');
        const onepagersContent = document.getElementById('onepagers-tab-content');

        if (configTab && onepagersTab && configContent && onepagersContent) {
            // Update tab states
            configTab.classList.toggle('active', tabName === 'config');
            onepagersTab.classList.toggle('active', tabName === 'onepagers');
            
            // Update content visibility
            configContent.classList.toggle('active', tabName === 'config');
            onepagersContent.classList.toggle('active', tabName === 'onepagers');

            // Load portfolio when switching to onepagers tab
            if (tabName === 'onepagers' && this.localInitiativeData.size > 0) {
                this.renderOnePagers();
            }
        }
    }

    // PRESERVAR loadInitialData ORIGINAL
    async loadInitialData() {
        // Conectar com Azure SQL no startup
        await this.connectToAzureSQL();
        
        // Setup inicial dos selects de market
        this.setupMarketSelects();
    }

    // SETUP DOS SELECTS DE MARKET
    setupMarketSelects() {
        const marketOptions = ["Brazil", "Peru", "Chile", "Mexico", "Latam"];
        const editMarketSelect = document.getElementById('edit-market');
        
        if (editMarketSelect) {
            editMarketSelect.innerHTML = '<option value="">Select Market</option>';
            marketOptions.forEach(market => {
                editMarketSelect.innerHTML += `<option value="${market}">${market}</option>`;
            });
        }
    }

    // PRESERVAR FUNÇÕES UTILITÁRIAS ORIGINAIS
    async showMainApp() {
        // App principal já está sendo mostrado no setupUI()
        console.log('🎯 Showing main app for user:', this.currentUser.name);
    }

    async showLoginScreen() {
        window.location.href = '/login.html';
    }
}