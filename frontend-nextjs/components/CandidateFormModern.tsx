'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import OCRUploader from './OCRUploader';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { candidateService } from '@/lib/api';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface CandidateFormProps {
  candidateId?: string;
  isEdit?: boolean;
}

type CandidateFormData = {
  [key: string]: any;
  full_name_kanji?: string;
  full_name_kana?: string;
  full_name_roman?: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  phone?: string;
  mobile?: string;
  fax_number?: string;
  email?: string;
  postal_code?: string;
  current_address?: string;
  address?: string;
  residence_status?: string;
  visa_period?: string;
  residence_expiry?: string;
  residence_card_number?: string;
  passport_number?: string;
  passport_expiry?: string;
  license_number?: string;
  license_expiry?: string;
  listening_level?: string;
  speaking_level?: string;
  reading_level?: string;
  writing_level?: string;
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
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  photo_url?: string;
};

export default function CandidateFormModern({ candidateId, isEdit = false }: CandidateFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CandidateFormData>({});
  const [submitting, setSubmitting] = useState(false);
  const [showOCRUploader, setShowOCRUploader] = useState(false);

  // Fetch candidate data if editing
  const { data: candidate, isLoading } = useQuery<CandidateFormData>({
    queryKey: ['candidate', candidateId],
    queryFn: () => candidateService.getCandidate(candidateId!),
    enabled: !!candidateId && isEdit,
  });

  useEffect(() => {
    if (candidate) {
      setFormData(candidate);
    }
  }, [candidate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.full_name_kanji && !formData.full_name_roman) {
      toast.error('氏名を入力してください');
      return;
    }

    try {
      setSubmitting(true);

      let savedCandidate;
      if (isEdit && candidateId) {
        savedCandidate = await candidateService.updateCandidate(candidateId, formData);
      } else {
        savedCandidate = await candidateService.createCandidate(formData);
      }

      toast.success(isEdit ? '候補者を正常に更新しました。' : '候補者を正常に作成しました。');

      if (!isEdit) {
        router.push(`/candidates/${savedCandidate.id}`);
      } else {
        router.push(`/candidates/${candidateId}`);
      }
    } catch (err: any) {
      toast.error(`保存に失敗しました: ${err.message || err.response?.data?.detail || 'サーバーエラーが発生しました。'}`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOCRComplete = (ocrData: any) => {
    const mappedData: Partial<CandidateFormData> = {};

    // Names
    const fullNameKanji = ocrData.full_name_kanji || ocrData.name_kanji;
    const fullNameKana = ocrData.full_name_kana || ocrData.name_kana;
    const fullNameRoman = ocrData.full_name_roman || ocrData.name_roman;
    if (fullNameKanji) mappedData.full_name_kanji = fullNameKanji;
    if (fullNameKana) mappedData.full_name_kana = fullNameKana;
    if (fullNameRoman) mappedData.full_name_roman = fullNameRoman;

    // Contact info
    if (ocrData.phone || ocrData.phone_number) mappedData.phone = ocrData.phone || ocrData.phone_number;
    if (ocrData.email) mappedData.email = ocrData.email;

    // Address
    const detectedAddress = ocrData.current_address || ocrData.address || ocrData.registered_address;
    if (detectedAddress) {
      mappedData.current_address = detectedAddress;
      mappedData.address = detectedAddress;
    }
    if (ocrData.postal_code) mappedData.postal_code = ocrData.postal_code;

    // Personal
    const dateOfBirth = ocrData.date_of_birth || ocrData.birthday;
    if (dateOfBirth) mappedData.date_of_birth = dateOfBirth;
    if (ocrData.gender) mappedData.gender = ocrData.gender;

    // Visa/Residence
    if (ocrData.nationality) mappedData.nationality = ocrData.nationality;
    const residenceStatus = ocrData.residence_status || ocrData.visa_status;
    if (residenceStatus) mappedData.residence_status = residenceStatus;
    const visaPeriod = ocrData.visa_period;
    if (visaPeriod) mappedData.visa_period = visaPeriod;
    const residenceExpiry = ocrData.residence_expiry || ocrData.zairyu_expire_date;
    if (residenceExpiry) mappedData.residence_expiry = residenceExpiry;
    const residenceCardNumber = ocrData.residence_card_number || ocrData.zairyu_card_number;
    if (residenceCardNumber) mappedData.residence_card_number = residenceCardNumber;

    // License
    if (ocrData.license_number) mappedData.license_number = ocrData.license_number;
    const licenseExpiry = ocrData.license_expiry || ocrData.license_expire_date;
    if (licenseExpiry) mappedData.license_expiry = licenseExpiry;

    // Photo
    const photoUrl = ocrData.photo_url || ocrData.photo;
    if (photoUrl) mappedData.photo_url = photoUrl;

    setFormData(prev => ({
      ...prev,
      ...mappedData
    }));

    toast.success('OCRデータをフォームに適用しました。内容を確認して必要に応じて編集してください。');
    setShowOCRUploader(false);
  };

  if (isLoading && isEdit) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  const workExperiences = [
    { name: 'exp_nc_lathe', label: 'NC旋盤' },
    { name: 'exp_lathe', label: '旋盤' },
    { name: 'exp_press', label: 'プレス' },
    { name: 'exp_forklift', label: 'フォークリフト' },
    { name: 'exp_packing', label: '梱包' },
    { name: 'exp_welding', label: '溶接' },
    { name: 'exp_car_assembly', label: '車部品組立' },
    { name: 'exp_car_line', label: '車部品ライン' },
    { name: 'exp_car_inspection', label: '車部品検査' },
    { name: 'exp_electronic_inspection', label: '電子部品検査' },
    { name: 'exp_food_processing', label: '食品加工' },
    { name: 'exp_casting', label: '鋳造' },
    { name: 'exp_line_leader', label: 'ラインリーダー' },
    { name: 'exp_painting', label: '塗装' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl">履歴書フォーム</CardTitle>
              <CardDescription className="mt-2">
                候補者の詳細情報を入力してください
              </CardDescription>
            </div>
            <Button
              type="button"
              variant={showOCRUploader ? "destructive" : "secondary"}
              onClick={() => setShowOCRUploader(!showOCRUploader)}
            >
              {showOCRUploader ? 'OCRを閉じる' : '📄 OCRスキャン'}
            </Button>
          </div>
        </CardHeader>

        {/* OCR Uploader */}
        {showOCRUploader && (
          <CardContent>
            <OCRUploader onOCRComplete={handleOCRComplete} />
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-start border border-blue-200 dark:border-blue-800">
              <InformationCircleIcon className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">💡 OCRについて</p>
                <p>履歴書や在留カードをアップロードすると自動的に情報を抽出します。</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tabs for organized sections */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">👤 個人情報</TabsTrigger>
          <TabsTrigger value="contact">📞 連絡先</TabsTrigger>
          <TabsTrigger value="documents">📋 書類</TabsTrigger>
          <TabsTrigger value="skills">🗣️ 能力</TabsTrigger>
          <TabsTrigger value="experience">💼 経験</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>個人情報</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name_kanji">
                  氏名 (Kanji) <Badge variant="destructive">必須</Badge>
                </Label>
                <Input
                  id="full_name_kanji"
                  name="full_name_kanji"
                  value={formData.full_name_kanji || ''}
                  onChange={handleInputChange}
                  placeholder="山田 太郎"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name_kana">フリガナ (Kana)</Label>
                <Input
                  id="full_name_kana"
                  name="full_name_kana"
                  value={formData.full_name_kana || ''}
                  onChange={handleInputChange}
                  placeholder="ヤマダ タロウ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name_roman">氏名 (Roman)</Label>
                <Input
                  id="full_name_roman"
                  name="full_name_roman"
                  value={formData.full_name_roman || ''}
                  onChange={handleInputChange}
                  placeholder="Yamada Taro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">生年月日</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">性別</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男性">男性 (Male)</SelectItem>
                    <SelectItem value="女性">女性 (Female)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">国籍</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality || ''}
                  onChange={handleInputChange}
                  placeholder="フィリピン"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>連絡先情報</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="postal_code">郵便番号</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code || ''}
                  onChange={handleInputChange}
                  placeholder="123-4567"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="current_address">現住所</Label>
                <Textarea
                  id="current_address"
                  name="current_address"
                  value={formData.current_address || ''}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="東京都..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="03-1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">携帯電話</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile || ''}
                  onChange={handleInputChange}
                  placeholder="090-1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fax_number">ファックス番号</Label>
                <Input
                  id="fax_number"
                  name="fax_number"
                  type="tel"
                  value={formData.fax_number || ''}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>緊急連絡先</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">氏名</Label>
                <Input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relation">続柄</Label>
                <Input
                  id="emergency_contact_relation"
                  name="emergency_contact_relation"
                  value={formData.emergency_contact_relation || ''}
                  onChange={handleInputChange}
                  placeholder="父, 母, 兄弟"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">電話番号</Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone || ''}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="residence">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  🏠 在留資格・在留カード
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="residence_status">在留資格</Label>
                      <Input
                        id="residence_status"
                        name="residence_status"
                        value={formData.residence_status || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visa_period">在留期間</Label>
                      <Input
                        id="visa_period"
                        name="visa_period"
                        value={formData.visa_period || ''}
                        onChange={handleInputChange}
                        placeholder="3年, 5年"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="residence_expiry">在留期間満了日</Label>
                      <Input
                        id="residence_expiry"
                        name="residence_expiry"
                        type="date"
                        value={formData.residence_expiry || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="residence_card_number">在留カード番号</Label>
                      <Input
                        id="residence_card_number"
                        name="residence_card_number"
                        value={formData.residence_card_number || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="passport">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  🛂 パスポート
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="passport_number">パスポート番号</Label>
                      <Input
                        id="passport_number"
                        name="passport_number"
                        value={formData.passport_number || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passport_expiry">パスポート期限</Label>
                      <Input
                        id="passport_expiry"
                        name="passport_expiry"
                        type="date"
                        value={formData.passport_expiry || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="license">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  🚗 運転免許証
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="license_number">運転免許番号</Label>
                      <Input
                        id="license_number"
                        name="license_number"
                        value={formData.license_number || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license_expiry">運転免許期限</Label>
                      <Input
                        id="license_expiry"
                        name="license_expiry"
                        type="date"
                        value={formData.license_expiry || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>日本語能力</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="listening_level">聞く (Listening)</Label>
                <Select
                  value={formData.listening_level || ''}
                  onValueChange={(value) => handleSelectChange('listening_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">初級</SelectItem>
                    <SelectItem value="intermediate">中級</SelectItem>
                    <SelectItem value="advanced">上級</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speaking_level">話す (Speaking)</Label>
                <Select
                  value={formData.speaking_level || ''}
                  onValueChange={(value) => handleSelectChange('speaking_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">初級</SelectItem>
                    <SelectItem value="intermediate">中級</SelectItem>
                    <SelectItem value="advanced">上級</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reading_level">読む (Reading)</Label>
                <Input
                  id="reading_level"
                  name="reading_level"
                  value={formData.reading_level || ''}
                  onChange={handleInputChange}
                  placeholder="N2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="writing_level">書く (Writing)</Label>
                <Input
                  id="writing_level"
                  name="writing_level"
                  value={formData.writing_level || ''}
                  onChange={handleInputChange}
                  placeholder="N3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>経験作業内容</CardTitle>
              <CardDescription>該当する項目をチェックしてください</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {workExperiences.map(exp => (
                  <div key={exp.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={exp.name}
                      checked={!!formData[exp.name]}
                      onCheckedChange={(checked) => handleCheckboxChange(exp.name, checked as boolean)}
                    />
                    <Label
                      htmlFor={exp.name}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {exp.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <Label htmlFor="exp_other">その他の経験</Label>
                <Textarea
                  id="exp_other"
                  name="exp_other"
                  value={formData.exp_other || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="その他の経験や特記事項を記入してください"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? '保存中...' : '💾 保存'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
