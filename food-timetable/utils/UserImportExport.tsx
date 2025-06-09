'use client'

import { User, userRole } from '@/types'
import ApiService from '@/handler/ApiService'
import { api } from '@/utils/api'

export interface UserImportData {
  email: string;
  role: userRole;
  first_name: string;
  last_name: string;
  phone_number?: string;
  trainee_id?: string;
  employee_id?: string;
}

export interface ImportResponse {
  message: string;
  created_users: User[];
  failed_entries?: Array<{
    email: string;
    errors: string | {
      [key: string]: string[];
    };
  }>;
}

/**
 * Utility class for handling user import/export operations
 */
export class UserImportExport {
  /**
   * Import users from JSON or Excel data
   * @param users Array of users to import
   * @returns Import response with created users and errors
   */
  static async importUsers(users: UserImportData[]): Promise<ImportResponse> {
    try {
      // Add default password for all users
      const usersWithPassword = users.map(user => ({
        ...user,
        password1: 'user@12345', // Default password
        password2: 'user@12345'
      }));
      
      // Create appropriate profiles based on role
      const usersWithProfiles = usersWithPassword.map(user => {
        const enrichedUser: any = { ...user };
        
        // Add specific profile data based on role
        if (user.role === 'trainee' && user.trainee_id) {
          enrichedUser.trainee_profile = {
            trainee_id: user.trainee_id,
            enrollment_date: null,
            graduation_year: null,
            attendance_rate: 0,
            trainee_status: 'active'
          };
        } else if (user.role === 'trainer' && user.employee_id) {
          enrichedUser.trainer_profile = {
            employee_id: user.employee_id,
            hire_date: null,
            qualification: null,
            specialization: null,
            bio: null,
            current_teaching_hours: 0,
            max_teaching_hours: 0
          };
        } else if (user.role === 'hod' && user.employee_id) {
          enrichedUser.hod_profile = {
            employee_id: user.employee_id,
            hire_date: null,
            appointment_date: null
          };
        } else if (user.role === 'dp_academics' && user.employee_id) {
          enrichedUser.dp_academics_profile = {
            employee_id: user.employee_id,
            hire_date: null,
            appointment_date: null
          };
        }
        
        return enrichedUser;
      });
      
      const response = await api.post<ImportResponse>(`${ApiService.USER_URL}/mass-register/`, { 
        users: usersWithProfiles 
      });
      
      return response.data;
    } catch (error) {
      console.error('Import users error:', error);
      throw error;
    }
  }

  /**
   * Export users to Excel
   * @param roleFilter Optional role to filter by
   * @param searchQuery Optional search query
   * @param sortField Optional field to sort by
   * @param sortOrder Optional sort order ('asc' or 'desc')
   */
  static async exportUsers(
    roleFilter?: userRole,
    searchQuery?: string,
    sortField?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<User[]> {
    try {
      // Build query parameters
      const params: Record<string, string> = { 
        all: 'true',
        limit: '10000', // Get all users
      };
      
      if (roleFilter) {
        params.role = roleFilter;
      }
      
      if (searchQuery) {
        params.email = searchQuery;
      }
      
      if (sortField) {
        params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
      }
      
      // Fetch all users
      const response = await api.get<{ results: User[], count: number }>(
        ApiService.USER_URL,
        { params }
      );
      
      return response.data.results;
    } catch (error) {
      console.error('Export users error:', error);
      throw error;
    }
  }

  /**
   * Download Excel template for user import
   */
  static downloadTemplate(role: 'trainee' | 'trainer' | 'hod'): void {
    const url = {
      trainee: ApiService.TRAINEES_MASS_REGISTER_TEMPLATE,
      trainer: ApiService.TRAINERS_MASS_REGISTER_TEMPLATE,
      hod: ApiService.HOD_MASS_REGISTER_TEMPLATE
    }
    // download template from backend
    const templateUrl = url[role];
    if (typeof window !== "undefined") {
      window.open(templateUrl);
    }
  }
  /**
   * Parse Excel file into user data
   * Uses the xlsx package to parse Excel files
   */
  static parseExcelFile(file: File): Promise<UserImportData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Dynamically import xlsx to avoid server-side rendering issues
          import('xlsx').then(XLSX => {
            try {
              const data = e.target?.result;
              const workbook = XLSX.read(data, { type: 'binary' });
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
              const records = XLSX.utils.sheet_to_json(firstSheet);
              
              const users = records.map((record: any) => ({
                email: record.email,
                role: record.role?.toLowerCase() || 'trainee',
                first_name: record.first_name || record.firstName || '',
                last_name: record.last_name || record.lastName || '',
                phone_number: record.phone_number || record.phoneNumber || '',
                trainee_id: record.trainee_id || record.traineeId || '',
                employee_id: record.employee_id || record.employeeId || ''
              }));
                resolve(users);
            } catch (parseError: any) {
              reject(new Error('Failed to parse Excel file: ' + (parseError.message || 'Unknown error')));
            }
          }).catch(importError => {
            reject(new Error('Failed to load Excel parser: ' + importError.message));
          });
        } catch (error) {
          reject(new Error('Failed to read Excel file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Parse JSON file into user data
   */
  static parseJSONFile(file: File): Promise<UserImportData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const users = JSON.parse(e.target?.result as string);
          if (!Array.isArray(users)) {
            reject(new Error('JSON file must contain an array of users'));
            return;
          }
          resolve(users);
        } catch (error) {
          reject(new Error('Failed to parse JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Validate users before import
   */
  static validateUsers(users: UserImportData[], roles: userRole[]): string[] {
    const errors: string[] = [];
    
    users.forEach((user, index) => {
      if (!user.email) errors.push(`Row ${index + 1}: Email is required`);
      if (!roles.includes(user.role)) errors.push(`Row ${index + 1}: Invalid role`);
      if (!user.first_name) errors.push(`Row ${index + 1}: First name is required`);
      if (!user.last_name) errors.push(`Row ${index + 1}: Last name is required`);
    });
    
    return errors;
  }

  /**
   * Export users to Excel file
   * Requires the xlsx package to be installed
   */ 

  /**
   * Upload Excel file directly to the backend
   * @param file Excel file to upload
   * @returns Import response with created users and errors
   */
  static async uploadExcelFile(file: File): Promise<ImportResponse> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
        // Send to backend
      const response = await api.post<ImportResponse>(
        ApiService.MASS_REGISTER_USERS_URL, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Excel upload error:', error);
      throw error;
    }
  }
}

export default UserImportExport;
