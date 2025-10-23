'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/lib/api';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// Complete Employee interface with ALL 42+ fields
interface Employee {
  id: number;
  hakenmoto_id: number;
  rirekisho_id: string | null;
  factory_id: string | null;
  factory_name: string | null;
  hakensaki_shain_id: string | null;
  photo_url: string | null;

  // Personal
  full_name_kanji: string;
  full_name_kana: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  postal_code: string | null;

  // Assignment
  assignment_location: string | null;
  assignment_line: string | null;
  job_description: string | null;

  // Employment
  hire_date: string;
  current_hire_date: string | null;
  entry_request_date: string | null;
  termination_date: string | null;

  // Financial
  jikyu: number;
  jikyu_revision_date: string | null;
  hourly_rate_charged: number | null;
  billing_revision_date: string | null;
  profit_difference: number | null;
  standard_compensation: number | null;
  health_insurance: number | null;
  nursing_insurance: number | null;
  pension_insurance: number | null;
  social_insurance_date: string | null;

  // Visa
  visa_type: string | null;
  zairyu_expire_date: string | null;
  visa_renewal_alert: boolean | null;
  visa_alert_days: number | null;

  // Documents
  license_type: string | null;
  license_expire_date: string | null;
  commute_method: string | null;
  optional_insurance_expire: string | null;
  japanese_level: string | null;
  career_up_5years: boolean | null;

  // Apartment
  apartment_id: number | null;
  apartment_start_date: string | null;
  apartment_move_out_date: string | null;
  apartment_rent: number | null;

  // Yukyu
  yukyu_remaining: number;

  // Status
  current_status: string | null;
  is_active: boolean;
  notes: string | null;
  contract_type: string | null;
}

interface PaginatedResponse {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function ExcelViewPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const pageSize = 1000; // Load all employees for Excel view

  // Fetch ALL employees
  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['employees-excel', searchTerm, filterActive],
    queryFn: async () => {
      const params: any = {
        page: 1,
        page_size: pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterActive !== null) params.is_active = filterActive;

      return employeeService.getEmployees(params);
    },
  });

  const employees = data?.items || [];
  const total = data?.total || 0;

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '';
    return `¥${amount.toLocaleString()}`;
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age}`;
  };

  const getStatusText = (status: string | null) => {
    const statusMap: Record<string, string> = {
      active: '在籍中',
      terminated: '退社済',
      suspended: '休職中',
    };
    return status ? statusMap[status] || status : '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/employees')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="font-medium">通常表示に戻る</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">従業員管理 - Excel ビュー</h1>
              <p className="text-sm text-gray-400">全 {total} 名 | 全列表示モード</p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="検索..."
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterActive === null ? '' : filterActive.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setFilterActive(value === '' ? null : value === 'true');
              }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全て</option>
              <option value="true">在籍中</option>
              <option value="false">退社済</option>
            </select>
          </div>
        </div>
      </div>

      {/* Excel-style Table - Full Screen */}
      <div className="pt-24 px-4 pb-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
            <table className="w-full border-collapse" style={{ minWidth: '5000px' }}>
              {/* Header Row */}
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-800">
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600 sticky left-0 bg-gray-800 z-20">写真</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">現在</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">社員№</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">派遣先ID</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">派遣先</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">配属先</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">配属ライン</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">仕事内容</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">氏名</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">カナ</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">性別</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">国籍</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">生年月日</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">年齢</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">時給</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">時給改定</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">請求単価</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">請求改定</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">差額利益</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">標準報酬</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">健康保険</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">介護保険</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">厚生年金</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">ビザ期限</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">ビザ種類</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">〒</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">住所</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">電話</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">ｱﾊﾟｰﾄ</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">入居</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">入社日</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">現入社</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">退社日</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">退去</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">社保加入</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">入社依頼</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">免許種類</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">免許期限</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">通勤方法</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">任意保険期限</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">日本語検定</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">キャリアアップ5年目</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">有給残</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-600">備考</th>
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={45} className="px-6 py-12 text-center text-sm text-gray-500 bg-white">
                      従業員が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, index) => (
                    <tr
                      key={emp.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                    >
                      {/* Photo */}
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 sticky left-0 bg-inherit">
                        {emp.photo_url ? (
                          <img
                            src={emp.photo_url}
                            alt={emp.full_name_kanji}
                            className="w-10 h-10 rounded object-cover border border-gray-300"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{getStatusText(emp.current_status)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 font-medium">{emp.hakenmoto_id}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-blue-600 font-medium">{emp.hakensaki_shain_id || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.factory_name || emp.factory_id || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.assignment_location || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.assignment_line || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 max-w-[200px] truncate">{emp.job_description || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 font-medium">{emp.full_name_kanji}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.full_name_kana || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.gender || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.nationality || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.date_of_birth)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{calculateAge(emp.date_of_birth)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 text-right">{formatCurrency(emp.jikyu)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.jikyu_revision_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 text-right">{formatCurrency(emp.hourly_rate_charged)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.billing_revision_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 text-right">{formatCurrency(emp.profit_difference)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 text-right">{formatCurrency(emp.standard_compensation)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 text-right">{formatCurrency(emp.health_insurance)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 text-right">{formatCurrency(emp.nursing_insurance)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 text-right">{formatCurrency(emp.pension_insurance)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.zairyu_expire_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.visa_type || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.postal_code || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 max-w-[250px] truncate">{emp.address || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.phone || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.email || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.apartment_id ? `#${emp.apartment_id}` : ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.apartment_start_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.hire_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.current_hire_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.termination_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.apartment_move_out_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.social_insurance_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.entry_request_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.license_type || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.license_expire_date)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.commute_method || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{formatDate(emp.optional_insurance_expire)}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900">{emp.japanese_level || ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 text-center">{emp.career_up_5years ? '✓' : ''}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 text-center">{emp.yukyu_remaining}</td>
                      <td className="px-3 py-2 border border-gray-300 text-xs text-gray-900 max-w-[200px] truncate">{emp.notes || ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center text-sm text-gray-400">
          <p>全 {employees.length} 件の従業員データを表示中 | 横スクロールで全列を確認できます</p>
        </div>
      </div>
    </div>
  );
}
