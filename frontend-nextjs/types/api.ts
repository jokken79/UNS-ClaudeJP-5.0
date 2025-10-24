// ============= SHARED TYPES =============
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export type Gender = 'M' | 'F' | 'O';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'COORDINATOR'
  | 'KANRININSHA'
  | 'EMPLOYEE'
  | 'CONTRACT_WORKER';

export type CandidateStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'hired';

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export type RequestType =
  | 'yukyu'
  | 'hankyu'
  | 'ikkikokoku'
  | 'taisha';

export type ShiftType =
  | 'asa'
  | 'hiru'
  | 'yoru'
  | 'other';

// ============= AUTH TYPES =============
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ============= CANDIDATE TYPES =============
export interface Candidate {
  id: number;
  rirekisho_id: string;

  // Dates
  reception_date?: string;
  arrival_date?: string;
  hire_date?: string;

  // Basic Information
  full_name_kanji?: string;
  full_name_kana?: string;
  full_name_roman?: string;
  gender?: string;
  date_of_birth?: string;
  photo_url?: string;
  photo_data_url?: string;
  nationality?: string;
  marital_status?: string;

  // Address
  postal_code?: string;
  current_address?: string;
  address?: string;
  address_banchi?: string;
  address_building?: string;
  registered_address?: string;

  // Contact
  phone?: string;
  mobile?: string;
  email?: string;

  // Passport
  passport_number?: string;
  passport_expiry?: string;

  // Residence Card
  residence_status?: string;
  residence_expiry?: string;
  residence_card_number?: string;

  // Driver's License
  license_number?: string;
  license_expiry?: string;
  car_ownership?: string;
  voluntary_insurance?: string;

  // Qualifications
  forklift_license?: string;
  tama_kake?: string;
  mobile_crane_under_5t?: string;
  mobile_crane_over_5t?: string;
  gas_welding?: string;

  // Work Experience
  exp_nc_lathe?: boolean;
  exp_lathe?: boolean;
  exp_press?: boolean;
  exp_forklift?: boolean;
  exp_packing?: boolean;
  exp_welding?: boolean;
  exp_car_assembly?: boolean;
  exp_car_line?: boolean;
  exp_car_inspection?: boolean;
  exp_electronic_inspection?: boolean;
  exp_food_processing?: boolean;
  exp_casting?: boolean;
  exp_line_leader?: boolean;
  exp_painting?: boolean;
  exp_other?: string;

  // Japanese Language
  japanese_qualification?: string;
  japanese_level?: string;
  jlpt_taken?: string;
  jlpt_date?: string;
  jlpt_score?: number;
  listening_level?: string;
  speaking_level?: string;
  read_katakana?: string;
  read_hiragana?: string;
  read_kanji?: string;
  write_katakana?: string;
  write_hiragana?: string;
  write_kanji?: string;
  can_speak?: string;
  can_understand?: string;
  can_read_kana?: string;
  can_write_kana?: string;

  // Commute
  commute_method?: string;
  commute_time_oneway?: number;

  // Interview
  interview_result?: string;
  antigen_test_kit?: string;
  antigen_test_date?: string;
  covid_vaccine_status?: string;

  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;

  // Physical
  blood_type?: string;
  dominant_hand?: string;
  allergy_exists?: string;
  glasses?: string;

  // Others
  major?: string;
  ocr_notes?: string;

  // Status & Audit
  status: CandidateStatus;
  created_at: string;
  updated_at?: string;
  approved_by?: number;
  approved_at?: string;

  // Computed property
  age?: number;
}

export interface CandidateCreateData {
  rirekisho_id?: string;
  full_name_kanji?: string;
  full_name_kana?: string;
  full_name_roman?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  current_address?: string;
  address_banchi?: string;
  address_building?: string;
  postal_code?: string;
  residence_status?: string;
  residence_expiry?: string;
  photo_data_url?: string;
  japanese_level?: string;
  marital_status?: string;
  passport_number?: string;
  passport_expiry?: string;
  residence_card_number?: string;
  license_number?: string;
  license_expiry?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  commute_method?: string;
  status?: CandidateStatus;
}

export interface CandidateListParams {
  page?: number;
  page_size?: number;
  status_filter?: string;
  search?: string;
  nationality?: string;
  japanese_level?: string;
  sort?: string;
}

// ============= EMPLOYEE TYPES =============
export interface Employee {
  id: number;
  hakenmoto_id: number;
  rirekisho_id?: string;
  factory_id?: string;
  hakensaki_shain_id?: string;

  // Personal Information
  full_name_kanji: string;
  full_name_kana?: string;
  photo_url?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  zairyu_card_number?: string;
  zairyu_expire_date?: string;

  // Contact
  address?: string;
  current_address?: string;
  address_banchi?: string;
  address_building?: string;
  phone?: string;
  email?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;

  // Employment
  hire_date?: string;
  current_hire_date?: string;
  jikyu?: number;
  jikyu_revision_date?: string;
  position?: string;
  contract_type?: string;

  // Assignment
  assignment_location?: string;
  assignment_line?: string;
  job_description?: string;

  // Financial
  hourly_rate_charged?: number;
  billing_revision_date?: string;
  profit_difference?: number;
  standard_compensation?: number;
  health_insurance?: number;
  nursing_insurance?: number;
  pension_insurance?: number;
  social_insurance_date?: string;

  // Visa & Documents
  visa_type?: string;
  visa_renewal_alert?: boolean;
  visa_alert_days?: number;
  license_type?: string;
  license_expire_date?: string;
  commute_method?: string;
  optional_insurance_expire?: string;
  japanese_level?: string;
  career_up_5years?: boolean;
  entry_request_date?: string;

  // Apartment
  apartment_id?: number;
  apartment_start_date?: string;
  apartment_move_out_date?: string;
  apartment_rent?: number;

  // Yukyu
  yukyu_total?: number;
  yukyu_used?: number;
  yukyu_remaining?: number;

  // Status
  current_status?: string;
  is_active?: boolean;
  termination_date?: string;
  termination_reason?: string;
  notes?: string;

  created_at: string;
  updated_at?: string;
}

export interface EmployeeCreateData {
  hakenmoto_id?: number;
  rirekisho_id?: string;
  factory_id?: string;
  full_name_kanji: string;
  full_name_kana?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  address?: string;
  address_banchi?: string;
  address_building?: string;
  postal_code?: string;
  hire_date?: string;
  jikyu?: number;
  position?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  current_status?: string;
}

export interface EmployeeListParams {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
  factory_id?: string;
  nationality?: string;
}

// ============= FACTORY TYPES =============
export interface Factory {
  id: number;
  factory_id: string;
  name: string;
  address?: string;
  phone?: string;
  contact_person?: string;
  config?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface FactoryCreateData {
  factory_id?: string;
  name: string;
  address?: string;
  phone?: string;
  contact_person?: string;
  config?: Record<string, unknown>;
  is_active?: boolean;
}

// ============= TIMERCARD TYPES =============
export interface TimerCard {
  id: number;
  hakenmoto_id?: number;
  employee_id?: number;
  factory_id?: string;
  work_date: string;
  shift_type?: ShiftType;
  clock_in?: string;
  clock_out?: string;
  break_minutes?: number;
  overtime_minutes?: number;
  regular_hours?: number;
  overtime_hours?: number;
  night_hours?: number;
  holiday_hours?: number;
  notes?: string;
  is_approved?: boolean;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface TimerCardCreateData {
  hakenmoto_id: number;
  work_date: string;
  shift_type?: ShiftType;
  clock_in?: string;
  clock_out?: string;
  break_minutes?: number;
  overtime_minutes?: number;
  regular_hours?: number;
  overtime_hours?: number;
  night_hours?: number;
  holiday_hours?: number;
  notes?: string;
}

export interface TimerCardListParams {
  employee_id?: number;
  month?: string;
  work_date?: string;
}

// ============= SALARY TYPES =============
export interface SalaryCalculation {
  id: number;
  employee_id: number;
  month: number;
  year: number;

  // Hours
  total_regular_hours?: number;
  total_overtime_hours?: number;
  total_night_hours?: number;
  total_holiday_hours?: number;

  // Payments
  base_salary?: number;
  overtime_pay?: number;
  night_pay?: number;
  holiday_pay?: number;
  bonus?: number;
  gasoline_allowance?: number;

  // Deductions
  apartment_deduction?: number;
  other_deductions?: number;

  // Total
  gross_salary?: number;
  net_salary?: number;

  // Company
  factory_payment?: number;
  company_profit?: number;

  is_paid?: boolean;
  paid_at?: string;
  created_at: string;
}

export interface SalaryCalculationCreateData {
  employee_id: number;
  month: number;
  year: number;
  base_salary?: number;
  overtime_pay?: number;
  night_pay?: number;
  holiday_pay?: number;
  bonus?: number;
  gasoline_allowance?: number;
  apartment_deduction?: number;
  other_deductions?: number;
}

export interface SalaryListParams {
  employee_id?: number;
  month?: string;
  year?: number;
}

// ============= REQUEST TYPES =============
export interface Request {
  id: number;
  hakenmoto_id: number;
  employee_id?: number;
  request_type: RequestType;
  status: RequestStatus;
  start_date: string;
  end_date: string;
  total_days?: number;
  reason?: string;
  notes?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface RequestCreateData {
  hakenmoto_id: number;
  request_type: RequestType;
  start_date: string;
  end_date: string;
  reason?: string;
  notes?: string;
}

export interface RequestListParams {
  employee_id?: number;
  status?: string;
  request_type?: string;
}

// ============= DASHBOARD TYPES =============
export interface DashboardStats {
  total_candidates: number;
  total_employees: number;
  total_factories: number;
  pending_requests: number;
  active_employees?: number;
  recent_candidates?: Candidate[];
  recent_employees?: Employee[];
}

// ============= API ERROR TYPES =============
export interface APIError {
  detail: string;
  status?: number;
}

export interface APIErrorResponse {
  detail: string;
}
