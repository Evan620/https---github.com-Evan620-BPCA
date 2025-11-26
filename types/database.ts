export interface Database {
    public: {
        Tables: {
            folders: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    user_id: string
                    folder_id: string | null
                    name: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    folder_id?: string | null
                    name: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    folder_id?: string | null
                    name?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            project_versions: {
                Row: {
                    id: string
                    project_id: string
                    version_number: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    version_number: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    version_number?: number
                    created_at?: string
                }
            }
            analyses: {
                Row: {
                    id: string
                    version_id: string
                    status: 'waiting_for_selection' | 'processing' | 'completed' | 'failed'
                    pdf_url: string | null
                    page_number: number | null
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    version_id: string
                    status: 'waiting_for_selection' | 'processing' | 'completed' | 'failed'
                    pdf_url?: string | null
                    page_number?: number | null
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    version_id?: string
                    status?: 'waiting_for_selection' | 'processing' | 'completed' | 'failed'
                    pdf_url?: string | null
                    page_number?: number | null
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            preset_codes: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    pdf_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    pdf_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    pdf_url?: string | null
                    created_at?: string
                }
            }
            analysis_codes: {
                Row: {
                    id: string
                    analysis_id: string
                    preset_code_id: string | null
                    custom_code_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    analysis_id: string
                    preset_code_id?: string | null
                    custom_code_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    analysis_id?: string
                    preset_code_id?: string | null
                    custom_code_url?: string | null
                    created_at?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    analysis_id: string
                    json_report: any | null
                    annotated_pdf_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    analysis_id: string
                    json_report?: any | null
                    annotated_pdf_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    analysis_id?: string
                    json_report?: any | null
                    annotated_pdf_url?: string | null
                    created_at?: string
                }
            }
            feedback: {
                Row: {
                    id: string
                    user_id: string
                    analysis_id: string | null
                    rating: number | null
                    message: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    analysis_id?: string | null
                    rating?: number | null
                    message?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    analysis_id?: string | null
                    rating?: number | null
                    message?: string | null
                    created_at?: string
                }
            }
        }
    }
}

// Helper types
export type Folder = Database['public']['Tables']['folders']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectVersion = Database['public']['Tables']['project_versions']['Row']
export type Analysis = Database['public']['Tables']['analyses']['Row']
export type PresetCode = Database['public']['Tables']['preset_codes']['Row']
export type Report = Database['public']['Tables']['reports']['Row']

// Extended types with relations
export interface ProjectWithAnalysis extends Project {
    latestAnalysis?: Analysis
    latestVersion?: ProjectVersion
}
