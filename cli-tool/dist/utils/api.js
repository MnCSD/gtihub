"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const remote_1 = require("./remote");
class ApiClient {
    constructor() {
        const config = (0, config_1.getConfig)();
        this.client = axios_1.default.create({
            baseURL: config.remote.origin || 'http://localhost:3000/api',
            headers: {
                'Content-Type': 'application/json',
                ...(config.auth.token && { Authorization: `Bearer ${config.auth.token}` })
            }
        });
    }
    // Create a client for a specific remote URL
    getClientForRemote(remoteUrl) {
        const config = (0, config_1.getConfig)();
        const apiUrl = (0, remote_1.getApiUrl)(remoteUrl);
        return axios_1.default.create({
            baseURL: apiUrl,
            headers: {
                'Content-Type': 'application/json',
                ...(config.auth.token && { Authorization: `Bearer ${config.auth.token}` })
            }
        });
    }
    async getRepository(owner, repo) {
        try {
            const response = await this.client.get(`/repositories/${owner}/${repo}`);
            return { success: true, data: response.data };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
    async createRepository(data) {
        try {
            const response = await this.client.post('/repositories', data);
            return { success: true, data: response.data };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
    async cloneRepository(owner, repo) {
        try {
            const response = await this.client.post(`/repositories/${owner}/${repo}/clone`);
            return { success: true, data: response.data };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
    async createCommit(owner, repo, commitData) {
        try {
            const response = await this.client.post(`/repositories/${owner}/${repo}/commits`, commitData);
            return { success: true, data: response.data };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
    async pushCommits(owner, repo, pushData) {
        try {
            const response = await this.client.post(`/repositories/${owner}/${repo}/push`, pushData);
            return { success: true, data: response.data };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
    async getFiles(owner, repo, branch) {
        try {
            const response = await this.client.get(`/repositories/${owner}/${repo}/files`, {
                params: { branch }
            });
            return { success: true, data: response.data };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
    async getBranches(owner, repo) {
        try {
            const response = await this.client.get(`/repositories/${owner}/${repo}/branches`);
            return { success: true, data: response.data };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
    async getCommits(owner, repo, remoteUrl) {
        try {
            const client = remoteUrl ? this.getClientForRemote(remoteUrl) : this.client;
            const repositoryId = `${owner}/${repo}`;
            const encodedRepositoryId = encodeURIComponent(repositoryId);
            const endpoint = `/repositories/${encodedRepositoryId}/commits`;
            const response = await client.get(endpoint);
            return { success: true, data: response.data };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
}
exports.apiClient = new ApiClient();
//# sourceMappingURL=api.js.map