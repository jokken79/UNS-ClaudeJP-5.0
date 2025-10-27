'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  BuildingOffice2Icon,
  ClockIcon,
  BanknotesIcon,
  DocumentTextIcon,
  UsersIcon,
  ArrowLeftIcon,
  CheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import { factoryService } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

type TabType = 'general' | 'lines' | 'schedule' | 'payment' | 'agreement';

interface Line {
  line_id: string;
  assignment: {
    department: string;
    line: string;
    supervisor: {
      department: string;
      name: string;
      phone: string;
    };
  };
  job: {
    description: string;
    description2?: string;
    hourly_rate: number;
  };
}

interface FactoryConfig {
  factory_id: string;
  client_company: {
    name: string;
    address: string;
    phone: string;
    responsible_person?: {
      department: string;
      name: string;
      phone: string;
    };
    complaint_handler?: {
      department: string;
      name: string;
      phone: string;
    };
  };
  plant: {
    name: string;
    address: string;
    phone: string;
  };
  lines: Line[];
  dispatch_company?: {
    responsible_person?: {
      department: string;
      name: string;
      phone: string;
    };
    complaint_handler?: {
      department: string;
      name: string;
      phone: string;
    };
  };
  schedule?: {
    work_hours: string;
    break_time: string;
    calendar: string;
    start_date: string;
    end_date: string;
    conflict_date?: string;
    non_work_day_labor?: string;
    overtime_labor?: string;
    time_unit?: string;
  };
  payment?: {
    closing_date: string;
    payment_date: string;
    bank_account: string;
    worker_closing_date?: string;
    worker_payment_date?: string;
    worker_calendar?: string;
  };
  agreement?: {
    period: string;
    explainer?: string;
  };
}

export default function FactoryEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const factoryId = params.id as string;
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [config, setConfig] = useState<FactoryConfig | null>(null);

  // Check if user has admin role
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      toast.error('アクセス権限がありません');
      router.push('/factories');
    }
  }, [user, isAdmin, router]);

  // Fetch factory data
  const { data: factory, isLoading } = useQuery({
    queryKey: ['factory', factoryId],
    queryFn: () => factoryService.getFactory(factoryId),
  });

  useEffect(() => {
    if (factory?.config) {
      setConfig(factory.config as FactoryConfig);
    } else if (factory) {
      // Initialize with default structure
      setConfig({
        factory_id: factory.factory_id,
        client_company: {
          name: factory.name || '',
          address: factory.address || '',
          phone: factory.phone || '',
        },
        plant: {
          name: '',
          address: '',
          phone: '',
        },
        lines: [],
      });
    }
  }, [factory]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => factoryService.updateFactory(factoryId, data),
    onSuccess: () => {
      toast.success('工場情報を更新しました');
      queryClient.invalidateQueries({ queryKey: ['factory', factoryId] });
      queryClient.invalidateQueries({ queryKey: ['factories'] });
    },
    onError: () => {
      toast.error('更新に失敗しました');
    },
  });

  const handleSave = () => {
    if (!config) return;

    updateMutation.mutate({
      name: config.client_company.name,
      address: config.client_company.address,
      phone: config.client_company.phone,
      config: config,
    });
  };

  const tabs = [
    { id: 'general', name: '基本情報', icon: BuildingOffice2Icon },
    { id: 'lines', name: 'ライン/部署', icon: UsersIcon },
    { id: 'schedule', name: '勤務時間', icon: ClockIcon },
    { id: 'payment', name: '支払条件', icon: BanknotesIcon },
    { id: 'agreement', name: '契約情報', icon: DocumentTextIcon },
  ];

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-12 max-w-md">
          <ShieldExclamationIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">アクセス拒否</h2>
          <p className="text-gray-600 mb-6">この機能は管理者のみ利用できます</p>
          <button
            onClick={() => router.push('/factories')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            工場一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/factories')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {config.client_company.name}
              </h1>
              <p className="text-gray-600 mt-1">Factory ID: {config.factory_id}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            {updateMutation.isPending ? '保存中...' : '保存'}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-sm p-6">
          {activeTab === 'general' && (
            <GeneralTab config={config} setConfig={setConfig} />
          )}
          {activeTab === 'lines' && (
            <LinesTab config={config} setConfig={setConfig} />
          )}
          {activeTab === 'schedule' && (
            <ScheduleTab config={config} setConfig={setConfig} />
          )}
          {activeTab === 'payment' && (
            <PaymentTab config={config} setConfig={setConfig} />
          )}
          {activeTab === 'agreement' && (
            <AgreementTab config={config} setConfig={setConfig} />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// GENERAL TAB - Basic Information
// ============================================
function GeneralTab({ config, setConfig }: { config: FactoryConfig; setConfig: (c: FactoryConfig) => void }) {
  const updateClientCompany = (field: string, value: string) => {
    setConfig({
      ...config,
      client_company: { ...config.client_company, [field]: value },
    });
  };

  const updatePlant = (field: string, value: string) => {
    setConfig({
      ...config,
      plant: { ...config.plant, [field]: value },
    });
  };

  return (
    <div className="space-y-8">
      {/* Client Company */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">派遣先企業情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              企業名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.client_company.name}
              onChange={(e) => updateClientCompany('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
            <input
              type="text"
              value={config.client_company.phone}
              onChange={(e) => updateClientCompany('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
            <textarea
              value={config.client_company.address}
              onChange={(e) => updateClientCompany('address', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Plant */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">工場情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">工場名</label>
            <input
              type="text"
              value={config.plant.name}
              onChange={(e) => updatePlant('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
            <input
              type="text"
              value={config.plant.phone}
              onChange={(e) => updatePlant('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
            <textarea
              value={config.plant.address}
              onChange={(e) => updatePlant('address', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LINES TAB - Lines/Departments
// ============================================
function LinesTab({ config, setConfig }: { config: FactoryConfig; setConfig: (c: FactoryConfig) => void }) {
  const addLine = () => {
    const newLine: Line = {
      line_id: `Factory-${config.lines.length + 1}`,
      assignment: {
        department: '',
        line: '',
        supervisor: { department: '', name: '', phone: '' },
      },
      job: { description: '', hourly_rate: 0 },
    };
    setConfig({ ...config, lines: [...config.lines, newLine] });
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...config.lines];
    if (field.includes('.')) {
      const [parent, child, subchild] = field.split('.');
      if (subchild) {
        newLines[index] = {
          ...newLines[index],
          [parent]: {
            ...newLines[index][parent as keyof Line] as any,
            [child]: {
              ...(newLines[index][parent as keyof Line] as any)[child],
              [subchild]: value,
            },
          },
        };
      } else {
        newLines[index] = {
          ...newLines[index],
          [parent]: { ...(newLines[index][parent as keyof Line] as any), [child]: value },
        };
      }
    } else {
      newLines[index] = { ...newLines[index], [field]: value };
    }
    setConfig({ ...config, lines: newLines });
  };

  const removeLine = (index: number) => {
    setConfig({ ...config, lines: config.lines.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">ライン/部署一覧</h3>
        <button
          onClick={addLine}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          + ライン追加
        </button>
      </div>

      {config.lines.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">ラインが登録されていません</p>
          <button
            onClick={addLine}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            最初のラインを追加
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {config.lines.map((line, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">ライン {index + 1}</h4>
                <button
                  onClick={() => removeLine(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  削除
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">部署</label>
                  <input
                    type="text"
                    value={line.assignment.department}
                    onChange={(e) => updateLine(index, 'assignment.department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ライン名</label>
                  <input
                    type="text"
                    value={line.assignment.line}
                    onChange={(e) => updateLine(index, 'assignment.line', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">責任者名</label>
                  <input
                    type="text"
                    value={line.assignment.supervisor.name}
                    onChange={(e) => updateLine(index, 'assignment.supervisor.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">責任者電話</label>
                  <input
                    type="text"
                    value={line.assignment.supervisor.phone}
                    onChange={(e) => updateLine(index, 'assignment.supervisor.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">業務内容</label>
                  <textarea
                    value={line.job.description}
                    onChange={(e) => updateLine(index, 'job.description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">時給</label>
                  <input
                    type="number"
                    value={line.job.hourly_rate}
                    onChange={(e) => updateLine(index, 'job.hourly_rate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SCHEDULE TAB - Work Hours & Calendar
// ============================================
function ScheduleTab({ config, setConfig }: { config: FactoryConfig; setConfig: (c: FactoryConfig) => void }) {
  const updateSchedule = (field: string, value: string) => {
    setConfig({
      ...config,
      schedule: { ...config.schedule, [field]: value } as any,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">勤務時間・カレンダー設定</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">勤務時間</label>
          <input
            type="text"
            value={config.schedule?.work_hours || ''}
            onChange={(e) => updateSchedule('work_hours', e.target.value)}
            placeholder="例: 昼勤：8時00分～17時00分 / 夜勤：20時00分～5時00分"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">休憩時間</label>
          <input
            type="text"
            value={config.schedule?.break_time || ''}
            onChange={(e) => updateSchedule('break_time', e.target.value)}
            placeholder="例: 12時00分～12時50分"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カレンダー</label>
          <textarea
            value={config.schedule?.calendar || ''}
            onChange={(e) => updateSchedule('calendar', e.target.value)}
            rows={3}
            placeholder="例: 月～金 (祝日、年末年始を除く)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
            <input
              type="date"
              value={config.schedule?.start_date?.split(' ')[0] || ''}
              onChange={(e) => updateSchedule('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
            <input
              type="date"
              value={config.schedule?.end_date?.split(' ')[0] || ''}
              onChange={(e) => updateSchedule('end_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">残業規定</label>
          <textarea
            value={config.schedule?.overtime_labor || ''}
            onChange={(e) => updateSchedule('overtime_labor', e.target.value)}
            rows={2}
            placeholder="例: 45時間/月、360時間/年迄とする"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAYMENT TAB - Payment Terms
// ============================================
function PaymentTab({ config, setConfig }: { config: FactoryConfig; setConfig: (c: FactoryConfig) => void }) {
  const updatePayment = (field: string, value: string) => {
    setConfig({
      ...config,
      payment: { ...config.payment, [field]: value } as any,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">支払条件設定</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">締日</label>
          <input
            type="text"
            value={config.payment?.closing_date || ''}
            onChange={(e) => updatePayment('closing_date', e.target.value)}
            placeholder="例: 20日"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">支払日</label>
          <input
            type="text"
            value={config.payment?.payment_date || ''}
            onChange={(e) => updatePayment('payment_date', e.target.value)}
            placeholder="例: 翌月20日"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">振込先口座</label>
          <textarea
            value={config.payment?.bank_account || ''}
            onChange={(e) => updatePayment('bank_account', e.target.value)}
            rows={2}
            placeholder="例: 愛知銀行 当知支店 普通2075479 名義人 ユニバーサル企画（株）"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">従業員締日</label>
          <input
            type="text"
            value={config.payment?.worker_closing_date || ''}
            onChange={(e) => updatePayment('worker_closing_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">従業員支払日</label>
          <input
            type="text"
            value={config.payment?.worker_payment_date || ''}
            onChange={(e) => updatePayment('worker_payment_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// AGREEMENT TAB - Contract Information
// ============================================
function AgreementTab({ config, setConfig }: { config: FactoryConfig; setConfig: (c: FactoryConfig) => void }) {
  const updateAgreement = (field: string, value: string) => {
    setConfig({
      ...config,
      agreement: { ...config.agreement, [field]: value } as any,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">契約情報</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">契約期間</label>
          <input
            type="date"
            value={config.agreement?.period?.split(' ')[0] || ''}
            onChange={(e) => updateAgreement('period', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">説明事項</label>
          <textarea
            value={config.agreement?.explainer || ''}
            onChange={(e) => updateAgreement('explainer', e.target.value)}
            rows={4}
            placeholder="契約に関する特記事項・説明事項"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
