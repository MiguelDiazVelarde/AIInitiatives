import { AuthResponse, LoginData, RegisterData, Course, ProgressEntry, CreateProgressData, OverallStats } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/logout', {
      method: 'POST',
    });
  }

  async checkAuth(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/me');
  }

  // Course endpoints
  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>('/courses');
  }

  async getCourse(id: string): Promise<Course> {
    return this.request<Course>(`/courses/${id}`);
  }

  // Progress endpoints
  async registerProgress(data: CreateProgressData): Promise<ProgressEntry> {
    return this.request<ProgressEntry>('/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyProgress(): Promise<ProgressEntry[]> {
    return this.request<ProgressEntry[]>('/progress');
  }

  async getStats(): Promise<OverallStats> {
    return this.request<OverallStats>('/progress/stats');
  }
}

export const apiService = new ApiService();