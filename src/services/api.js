class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
  }

  getAuthHeaders() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async login(username, password) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error(await response.text() || 'Login failed');
    }
    
    const userData = await response.json();
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }

  async getAllUsers() {
    const response = await fetch(`${this.baseUrl}/users`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return await response.json();
  }

    async createUser(userData) {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to create user');
    }
    
    return await response.json();
  }

  async getAuditData(auditType) {
  const response = await fetch(`${this.baseUrl}/audits?type=${auditType}`);
  if (!response.ok) {
    throw new Error('Failed to fetch audit data');
  }
  const result = await response.json();
  
  // Ensure we always return an array, even if the structure is different
  if (Array.isArray(result)) {
    return result;
  } else if (result.data && Array.isArray(result.data)) {
    return result.data;
  } else {
    return []; // Return empty array if no valid data found
  }
}

  async uploadAuditFile(formData, auditType) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

  try {
    const response = await fetch(`${this.baseUrl}/audits/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - let the browser set it with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Upload failed');
    }

    return await response.json();
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
}

  async updateAuditRecord(auditType, record) {
    const response = await fetch(`${this.baseUrl}/audits/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditType, record }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update record');
    }
    
    return await response.json();
  }

  async checkLastUploadDate(auditType) {
    const response = await fetch(`${this.baseUrl}/audits/last-upload?type=${auditType}`);
    if (!response.ok) {
      throw new Error('Failed to check last upload date');
    }
    return await response.json();
  }
}

export default new ApiService();