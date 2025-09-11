import axios, { AxiosInstance } from 'axios';
import { ApiResponse, Repository, Commit, FileEntry, Branch } from '../types';
import { getConfig } from './config';
import { getApiUrl } from './remote';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const config = getConfig();
    this.client = axios.create({
      baseURL: config.remote.origin || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
        ...(config.auth.token && { Authorization: `Bearer ${config.auth.token}` })
      }
    });
  }

  // Create a client for a specific remote URL
  private getClientForRemote(remoteUrl: string): AxiosInstance {
    const config = getConfig();
    const apiUrl = getApiUrl(remoteUrl);
    return axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(config.auth.token && { Authorization: `Bearer ${config.auth.token}` })
      }
    });
  }

  async getRepository(owner: string, repo: string): Promise<ApiResponse<Repository>> {
    try {
      const response = await this.client.get(`/repositories/${owner}/${repo}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async createRepository(data: Partial<Repository>): Promise<ApiResponse<Repository>> {
    try {
      const response = await this.client.post('/repositories', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async cloneRepository(owner: string, repo: string): Promise<ApiResponse<{ repository: Repository; files: FileEntry[] }>> {
    try {
      const response = await this.client.post(`/repositories/${owner}/${repo}/clone`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async createCommit(owner: string, repo: string, commitData: {
    message: string;
    files: { path: string; content: string }[];
    branch: string;
  }): Promise<ApiResponse<Commit>> {
    try {
      const response = await this.client.post(`/repositories/${owner}/${repo}/commits`, commitData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async pushCommits(owner: string, repo: string, pushData: {
    commits: string[];
    branch: string;
  }): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.client.post(`/repositories/${owner}/${repo}/push`, pushData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getFiles(owner: string, repo: string, branch?: string): Promise<ApiResponse<FileEntry[]>> {
    try {
      const response = await this.client.get(`/repositories/${owner}/${repo}/files`, {
        params: { branch }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getBranches(owner: string, repo: string): Promise<ApiResponse<Branch[]>> {
    try {
      const response = await this.client.get(`/repositories/${owner}/${repo}/branches`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getCommits(owner: string, repo: string, remoteUrl?: string): Promise<ApiResponse<Commit[]>> {
    try {
      const client = remoteUrl ? this.getClientForRemote(remoteUrl) : this.client;
      const repositoryId = `${owner}/${repo}`;
      const encodedRepositoryId = encodeURIComponent(repositoryId);
      const endpoint = `/repositories/${encodedRepositoryId}/commits`;
      const response = await client.get(endpoint);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
}

export const apiClient = new ApiClient();