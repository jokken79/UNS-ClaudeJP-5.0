"use client";
import React, { useMemo, useRef, useState, useEffect } from "react"; // Import useEffect
import { toast } from "react-hot-toast";
import AzureOCRUploader from "@/components/AzureOCRUploader";
import {
  CheckCircleIcon,
  DocumentMagnifyingGlassIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * 履歴書（A4横）— 単一ファイル TSX コンポーネント
 * - 画面：入力フォーム（日本語ラベル）＋ツールバー（印刷／保存）
 * - 印刷：入力枠をそのまま表示（公式様式風の枠線を保持）
 * - 注意：在留カード・免許証などの「書類画像」は印刷しません（本フォームは履歴書のみ）
 *
 * 配置想定：/app/(dashboard)/candidates/rirekisho/page.tsx
 */

export default function Page() {
  // --- State Management ---
  const [data, setData] = useState<FormDataState>(() => ({
    applicantId: `UNS-${Date.now().toString().slice(-6)}`,
    receptionDate: "",
    timeInJapan: "",
    nameKanji: "",
    nameFurigana: "",
    birthday: "",
    age: "",
    gender: "",
    nationality: "",
    postalCode: "",
    address: "", // Address state remains
    mobile: "",
    phone: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    visaType: "",
    visaPeriod: "",
    residenceCardNo: "",
    passportNo: "",
    passportExpiry: "",
    licenseNo: "",
    licenseExpiry: "",
    carOwner: "",
    insurance: "",
    speakLevel: "",
    listenLevel: "",
    kanjiReadLevel: "",
    kanjiWriteLevel: "",
    hiraganaReadLevel: "",
    hiraganaWriteLevel: "",
    katakanaReadLevel: "",
    katakanaWriteLevel: "",
    education: "",
    major: "",
    height: "",
    weight: "",
    uniformSize: "",
    waist: "",
    shoeSize: "",
    bloodType: "",
    visionRight: "",
    visionLeft: "",
    glasses: "",
    dominantArm: "",
    allergy: "",
    safetyShoes: "",
    vaccine: "",
    forkliftLicense: false,
    jlpt: false,
    jlptLevel: "",
    otherQualifications: "",
    lunchPref: "昼/夜",
    commuteTimeMin: "",
    commuteMethod: "", // Added commute method state
    jobs: [],
    family: [], // Initial state for family
  }));

   // State to track which family relation input is being edited (for 'その他')
   const [editingRelationIndex, setEditingRelationIndex] = useState<number | null>(null);


  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoDataUrl = useRef<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [showAzurePanel, setShowAzurePanel] = useState(false);
  const [azureAppliedFields, setAzureAppliedFields] = useState<{ label: string; value: string }[]>([]);
  const [lastAzureDocumentType, setLastAzureDocumentType] = useState<string | null>(null);
  const [lastAzureRaw, setLastAzureRaw] = useState<Record<string, unknown> | null>(null);

  // --- Core Functions ---
  function onChange<K extends keyof FormDataState>(key: K, value: FormDataState[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // --- Handlers for formatting Height, Weight, Waist, CommuteTime on Blur ---
  const handleBlurHeight = () => {
    const heightValue = (data.height || "").toString().replace(/[^0-9.]/g, ''); // Remove non-numeric except dot
    if (heightValue && !isNaN(parseFloat(heightValue))) {
      setData(prev => ({ ...prev, height: `${heightValue} cm` }));
    } else if (data.height !== "") { // Only clear if it wasn't already empty
       setData(prev => ({ ...prev, height: "" })); // Clear if invalid or empty
    }
  };

  const handleBlurWeight = () => {
    const weightValue = (data.weight || "").toString().replace(/[^0-9.]/g, ''); // Remove non-numeric except dot
    if (weightValue && !isNaN(parseFloat(weightValue))) {
      setData(prev => ({ ...prev, weight: `${weightValue} kg` }));
    } else if (data.weight !== "") { // Only clear if it wasn't already empty
        setData(prev => ({ ...prev, weight: "" })); // Clear if invalid or empty
    }
  };

  const handleBlurWaist = () => {
    const waistValue = (data.waist || "").toString().replace(/[^0-9.]/g, ''); // Remove non-numeric except dot
    if (waistValue && !isNaN(parseFloat(waistValue))) {
      setData(prev => ({ ...prev, waist: `${waistValue} cm` }));
    } else if (data.waist !== "") { // Only clear if it wasn't already empty
        setData(prev => ({ ...prev, waist: "" })); // Clear if invalid or empty
    }
  };

  const handleBlurCommuteTime = () => {
    const timeValue = (data.commuteTimeMin || "").toString().replace(/[^0-9]/g, ''); // Remove non-numeric (integers only)
    if (timeValue && !isNaN(parseInt(timeValue, 10))) {
      setData(prev => ({ ...prev, commuteTimeMin: `${timeValue} 分` }));
    } else if (data.commuteTimeMin !== "") { // Only clear if it wasn't already empty
      setData(prev => ({ ...prev, commuteTimeMin: "" })); // Clear if invalid or empty
    }
  };
 // --- End Handlers ---


  function addJob() {
    setData((prev) => ({
      ...prev,
      jobs: [
        ...prev.jobs,
        { start: "", end: "", hakenmoto: "", hakensaki: "", content: "", reason: "" }, // 'reason' state remains but header changes
      ],
    }));
  }

  function removeJob(idx: number) {
    setData((prev) => ({ ...prev, jobs: prev.jobs.filter((_, i) => i !== idx) }));
  }

  function updateJob(idx: number, patch: Partial<JobEntry>) {
    setData((prev) => ({
      ...prev,
      jobs: prev.jobs.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    }));
  }

  function addFamily() {
    setData((prev) => ({
      ...prev,
      family: [
        ...prev.family,
        // Default values for new family member, birthday removed, residence changed
        { name: "", relation: "", age: "", residence: "", dependent: "有" },
      ],
    }));
  }

  function removeFamily(idx: number) {
    setData((prev) => ({ ...prev, family: prev.family.filter((_, i) => i !== idx) }));
  }

  // Updated updateFamily function
  function updateFamily(idx: number, patch: Partial<FamilyEntry>) {
    setData((prev) => ({
      ...prev,
      family: prev.family.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    }));
  }


  function onSelectPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      photoDataUrl.current = url;
      setPhotoPreview(url);
    };
    reader.readAsDataURL(f);
  }

  // Simplified handlePrint function
  function handlePrint() {
    console.log("Attempting to print..."); // Add log for debugging
    window.print(); // Just call window.print directly
  }

  function handleSaveJson() {
    const blob = new Blob([JSON.stringify({ ...data, photo: photoDataUrl.current }, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rirekisho_${data.applicantId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const normalizeJapaneseDate = (value: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";

    const withoutSuffix = trimmed.replace(/まで$/u, "").trim();
    const jpMatch = withoutSuffix.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日?$/u);
    if (jpMatch) {
      const [, year, month, day] = jpMatch;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const normalized = withoutSuffix.replace(/[\.\/]/g, "-");
    const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return trimmed;
  };

  const normalizeVisaPeriod = (value: string) => {
    const normalized = normalizeJapaneseDate(value);
    return normalized || value.trim();
  };

  const normalizePhoneNumber = (value: string) => {
    if (!value) return "";
    const digits = value.replace(/[^0-9+]/g, "");
    if (!digits) return "";

    if (digits.startsWith("+81")) {
      const rest = digits.slice(3);
      if (!rest) return "";
      return rest.startsWith("0") ? rest : `0${rest}`;
    }

    if (digits.startsWith("81") && digits.length >= 4) {
      return `0${digits.slice(2)}`;
    }

    return digits;
  };

  const formatPostalCode = (value: string) => {
    if (!value) return "";
    const digits = value.replace(/[^0-9]/g, "");
    if (digits.length === 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return value.trim();
  };

  const normalizeGender = (value: string) => {
    if (!value) return "";
    const normalized = value.trim().toLowerCase();
    if (!normalized) return "";
    if (normalized.includes("male") || normalized.includes("男")) return "男性";
    if (normalized.includes("female") || normalized.includes("女")) return "女性";
    return value.trim();
  };

  const ensureDataUrl = (value: string) => {
    if (!value) return "";
    return value.startsWith("data:") ? value : `data:image/jpeg;base64,${value}`;
  };

  const handleAzureOcrComplete = (ocrRaw: Record<string, unknown>) => {
    if (!ocrRaw || typeof ocrRaw !== "object") {
      toast.error("Azure OCR の結果を読み取れませんでした。");
      return;
    }

    const updates: Partial<FormDataState> = {};
    const applied: { label: string; value: string }[] = [];

    const applyField = (
      targetKey: keyof FormDataState,
      label: string,
      ...sourceKeys: string[]
    ) => {
      const rawValue = sourceKeys
        .map((key) => ocrRaw[key])
        .find((value) => {
          if (value === undefined || value === null) {
            return false;
          }
          if (typeof value === "string") {
            return value.trim() !== "";
          }
          return true;
        });

      if (rawValue === undefined || rawValue === null) {
        return;
      }

      const rawString = typeof rawValue === "string" ? rawValue : String(rawValue);
      let value = rawString.trim();
      if (!value) return;

      if (targetKey === "postalCode") {
        value = formatPostalCode(value);
      }

      if (targetKey === "phone" || targetKey === "mobile" || targetKey === "emergencyPhone") {
        value = normalizePhoneNumber(value);
        if (!value) return;
      }

      if (targetKey === "birthday" || targetKey === "passportExpiry" || targetKey === "licenseExpiry") {
        value = normalizeJapaneseDate(value);
      }

      if (targetKey === "visaPeriod") {
        value = normalizeVisaPeriod(value);
      }

      if (targetKey === "gender") {
        value = normalizeGender(value);
      }

      if (targetKey === "nationality") {
        const upper = value.toUpperCase();
        if (upper === value) {
          value = `${upper.charAt(0)}${upper.slice(1).toLowerCase()}`;
        }
      }

      updates[targetKey] = value as FormDataState[typeof targetKey];
      applied.push({ label, value });
    };

    applyField("nameKanji", "氏名（漢字）", "full_name_kanji", "name_kanji", "name_roman");
    applyField("nameFurigana", "フリガナ", "full_name_kana", "name_kana", "name_katakana");
    applyField("birthday", "生年月日", "date_of_birth", "birthday");
    applyField("age", "年齢", "age");
    applyField("gender", "性別", "gender");
    applyField("nationality", "国籍", "nationality");
    applyField("postalCode", "郵便番号", "postal_code", "zip_code");
    applyField("address", "現住所", "current_address", "address", "registered_address");
    applyField("mobile", "携帯電話", "mobile", "mobile_phone", "cell_phone");
    applyField("phone", "電話番号", "phone", "phone_number");
    applyField("visaType", "在留資格", "residence_status", "visa_status");
    applyField("visaPeriod", "在留期間", "visa_period", "residence_expiry", "period_of_stay");
    applyField("residenceCardNo", "在留カード番号", "residence_card_number", "zairyu_card_number");
    applyField("passportNo", "パスポート番号", "passport_number");
    applyField("passportExpiry", "パスポート有効期限", "passport_expiry", "passport_expire_date");
    applyField("licenseNo", "免許証番号", "license_number", "menkyo_number");
    applyField("licenseExpiry", "免許証有効期限", "license_expiry", "license_expire_date");
    applyField("emergencyName", "緊急連絡先 氏名", "emergency_contact_name");
    applyField("emergencyRelation", "緊急連絡先 続柄", "emergency_contact_relation");
    applyField("emergencyPhone", "緊急連絡先 電話", "emergency_contact_phone");

    const photoCandidate = ["photo_url", "photo", "face_photo"]
      .map((key) => ocrRaw[key])
      .find((value): value is string => typeof value === "string" && value.trim() !== "");

    if (photoCandidate) {
      const safePhoto = ensureDataUrl(photoCandidate);
      photoDataUrl.current = safePhoto;
      setPhotoPreview(safePhoto);
      applied.push({ label: "証明写真", value: "Azure OCR から自動抽出" });
    }

    if (Object.keys(updates).length > 0) {
      setData((prev) => ({ ...prev, ...updates }));
    }

    if (applied.length > 0) {
      toast.success("Azure OCR の結果をフォームへ反映しました。");
    } else {
      toast("Azure OCR から読み取れる項目がありませんでした。", { icon: "ℹ️" });
    }

    setAzureAppliedFields(applied);
    setLastAzureDocumentType(typeof ocrRaw.document_type === "string" ? ocrRaw.document_type : null);
    setLastAzureRaw(ocrRaw);
    setShowAzurePanel(true);
  };

  const levels = useMemo(
    () => ({
      speak: ["初級（挨拶程度）", "中級（日常会話・就職可）", "上級（通訳可）"],
      listen: ["初級（挨拶程度）", "中級（日常会話・就職可）", "上級（通訳可）"],
      simple: ["できる", "少し", "できない"],
      timeInJapan: [
        ...[...Array(11).keys()].map(i => `${i + 1}ヶ月`),
        ...[...Array(20).keys()].map(i => `${i + 1}年`),
        "20年以上",
      ],
      residenceOptions: ["同居", "別居", "国内", "国外"], // New options for residence
      commuteOptions: ["自家用車", "送迎", "原付電動機", "自転車", "歩き"], // Added "歩き"
       // Family relation options
       relationOptions: ["妻", "長男", "次男", "息子", "子", "長女", "次女", "娘", "母", "父", "その他"],
    }),
    []
  );

    // Helper to check if a relation value is one of the predefined options (excluding 'その他')
    const isPredefinedRelation = (relationValue: string) => {
        // Check if it exists in the list AND it's not exactly 'その他'
        return levels.relationOptions.includes(relationValue) && relationValue !== 'その他';
    };


  // --- Helper to format date for display (used for printing) ---
    const formatDateToJapanese = (dateString: string) => {
        if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return ""; // Return empty if invalid format
        }
        try {
            // Split the date string instead of relying on Date constructor
            // which can be affected by timezones causing off-by-one day errors.
            const [year, month, day] = dateString.split('-');
            if (!year || !month || !day) return ""; // Extra check

            // Ensure month and day are correctly padded if needed (though type="date" usually handles this)
            const paddedMonth = month.padStart(2, '0');
            const paddedDay = day.padStart(2, '0');

            return `${year}年${paddedMonth}月${paddedDay}日`;
        } catch (e) {
            console.error("Error formatting date string:", dateString, e);
            return ""; // Return empty string on error
        }
    };


    // --- Effect for Print Formatting ---
    // This function updates the content of the print-only spans
    const updatePrintDates = () => {
        document.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach(input => {
            const displaySpanId = input.getAttribute('data-print-target');
            if (displaySpanId) {
                const displaySpan = document.getElementById(displaySpanId);
                if (displaySpan) {
                    displaySpan.textContent = formatDateToJapanese(input.value);
                }
            }
        });
         // Also format month inputs for print
        document.querySelectorAll<HTMLInputElement>('input[type="month"]').forEach(input => {
            const displaySpanId = input.getAttribute('data-print-target');
            if (displaySpanId) {
                const displaySpan = document.getElementById(displaySpanId);
                if (displaySpan && input.value) {
                     try {
                        const [year, month] = input.value.split('-');
                        if(year && month) {
                            displaySpan.textContent = `${year}年${month}月`;
                        } else {
                            displaySpan.textContent = '';
                        }
                    } catch(e) {
                         console.error("Error formatting month:", input.value, e);
                         displaySpan.textContent = '';
                    }

                } else if (displaySpan) {
                     displaySpan.textContent = ''; // Clear if no value
                }
            }
        });
    };

    // Add event listener for printing
    useEffect(() => {
        const handleBeforePrint = () => {
            console.log("Before print event triggered. Updating dates..."); // Log for debugging
            updatePrintDates();
        };

        window.addEventListener('beforeprint', handleBeforePrint);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
        };
    }, [data]); // Re-run if data changes might be needed if dates are updated dynamically elsewhere



  // --- Render ---
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 print:p-0 font-noto-sans-jp">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 mb-6 flex items-center justify-center gap-3 rounded-xl border bg-white/80 p-3 shadow-md backdrop-blur print:hidden">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
          title="証明写真は印刷されます（書類画像は印刷しません）"
        >
          写真アップロード
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onSelectPhoto}
        />
        <button onClick={handlePrint} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          印刷する
        </button>
        <button
          onClick={() => setShowAzurePanel((prev) => !prev)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold transition ${
            showAzurePanel
              ? "border-sky-500 bg-sky-50 text-sky-700 shadow-inner"
              : "hover:bg-gray-50"
          }`}
        >
          <DocumentMagnifyingGlassIcon className="h-5 w-5" />
          Azure OCR 連携
        </button>
        <button onClick={handleSaveJson} className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50">
          保存（JSON）
        </button>
      </div>

      {showAzurePanel && (
        <div className="mb-6 space-y-4 rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-lg backdrop-blur print:hidden">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-slate-700">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 text-sky-600" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Azure OCR アシスタント</h2>
                <p className="text-sm text-slate-500">
                  在留カードや免許証の画像をアップロードして氏名・在留資格・顔写真を自動でフォームに転記します。
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAzurePanel(false)}
              className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              パネルを閉じる
            </button>
          </div>

          <AzureOCRUploader onResult={handleAzureOcrComplete} />

          {azureAppliedFields.length > 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-semibold">フォームに反映された項目</span>
                {lastAzureDocumentType && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {lastAzureDocumentType === "zairyu_card"
                      ? "在留カード"
                      : lastAzureDocumentType === "license"
                      ? "運転免許証"
                      : "履歴書"}
                  </span>
                )}
              </div>
              <ul className="mt-3 grid gap-2 md:grid-cols-2">
                {azureAppliedFields.map((field, index) => (
                  <li
                    key={`${field.label}-${index}`}
                    className="rounded-lg bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm"
                  >
                    <span className="block text-xs text-slate-500">{field.label}</span>
                    <span className="font-medium text-slate-900">{field.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : lastAzureRaw ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Azure OCR から転記できるフィールドが見つかりませんでした。</p>
                <p className="text-xs text-amber-600">
                  画像の解像度や明るさを調整して再度お試しください。必要に応じて手入力で補完できます。
                </p>
              </div>
            </div>
          ) : null}

          {lastAzureRaw && (
            <details className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-700">Azure OCR 詳細データを表示</summary>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all text-[11px]">
                {JSON.stringify(lastAzureRaw, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* A4 Canvas */}
      <div
        className="relative mx-auto box-border flex flex-col bg-white p-6 shadow print:p-0 print:shadow-none" // Added print:p-0
        style={{ width: "297mm", minHeight: "210mm" }}
      >
        <h1 className="mb-4 text-center text-3xl font-extrabold tracking-widest">履 歴 書</h1>

        {/* Basic Info & Contact */}
        <div className="mb-4 flex gap-4">
          <div className="grid place-items-center" style={{ width: "40mm" }}>
            <div className="grid place-items-center border border-black" style={{ width: "40mm", height: "50mm" }}>
              {photoPreview ? (
                <img src={photoPreview} className="h-full w-full object-cover" alt="証明写真" />
              ) : (
                <span className="text-xs text-gray-400">写真</span>
              )}
            </div>
          </div>
          {/* Main info table - Reverted Layout */}
           <table className="w-full table-fixed border-collapse border border-black text-[11pt]">
             {/* Define 8 columns total (4 labels + 4 data) */}
             <colgroup>
                <col className="w-[10%]" /> {/* Label 1 */}
                <col className="w-[15%]" /> {/* Data 1 */}
                <col className="w-[10%]" /> {/* Label 2 */}
                <col className="w-[15%]" /> {/* Data 2 */}
                <col className="w-[10%]" /> {/* Label 3 */}
                <col className="w-[15%]" /> {/* Data 3 */}
                <col className="w-[10%]" /> {/* Label 4 */}
                <col className="w-[15%]" /> {/* Data 4 */}
             </colgroup>
             <tbody>
               <tr>{/* Row 1: 受付日 (span 3) | 来日 (span 3) */}
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">受付日</th>
                 <td className="border border-black px-2 py-1" colSpan={3}>
                    <input
                      id="receptionDateInput" type="date" value={data.receptionDate}
                      onChange={(e) => onChange("receptionDate", e.target.value)}
                      className="w-full border-0 p-0 outline-none bg-transparent print:hidden"
                      data-print-target="receptionDatePrint" />
                    <span id="receptionDatePrint" className="hidden print:inline">{formatDateToJapanese(data.receptionDate)}</span>
                 </td>
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">来日</th>
                 <td className="border border-black px-2 py-1" colSpan={3}>
                   <select value={data.timeInJapan} onChange={(e) => onChange("timeInJapan", e.target.value)} className="w-full border-0 p-0 outline-none bg-transparent">
                     <option value="">選択</option>
                     {levels.timeInJapan.map(item => <option key={item} value={item}>{item}</option>)}
                   </select>
                 </td>
               </tr>
               <tr>{/* Row 2: 氏名 (span 3) | フリガナ (span 3) */}
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">氏名</th>
                 <td className="border border-black px-2 py-1" colSpan={3}>
                   <input value={data.nameKanji} onChange={(e) => onChange("nameKanji", e.target.value)} className="w-full border-0 p-0 outline-none" />
                 </td>
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">フリガナ</th>
                 <td className="border border-black px-2 py-1" colSpan={3}>
                   <input value={data.nameFurigana} onChange={(e) => onChange("nameFurigana", e.target.value)} className="w-full border-0 p-0 outline-none" />
                 </td>
               </tr>
               <tr>{/* Row 3: 生年月日 | 年齢 | 性別 | 国籍 */}
                  <th className="border border-black bg-gray-100 px-2 py-1 text-left">生年月日</th>
                  <td className="border border-black px-2 py-1">
                     <input id="birthdayInput" type="date" value={data.birthday} onChange={(e) => onChange("birthday", e.target.value)} className="w-full border-0 p-0 outline-none bg-transparent print:hidden" data-print-target="birthdayPrint" />
                     <span id="birthdayPrint" className="hidden print:inline">{formatDateToJapanese(data.birthday)}</span>
                  </td>
                  <th className="border border-black bg-gray-100 px-2 py-1 text-left">年齢</th>
                  <td className="border border-black px-2 py-1">
                    <input type="number" min={18} max={80} value={data.age} onChange={(e) => onChange("age", e.target.value)} className="w-full border-0 p-0 outline-none" />
                  </td>
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">性別</th>
                  <td className="border border-black px-2 py-1">
                     <select value={data.gender} onChange={(e) => onChange("gender", e.target.value)} className="w-full border-0 p-0 outline-none bg-transparent">
                       <option value="">選択</option>
                       <option value="男性">男性</option>
                       <option value="女性">女性</option>
                     </select>
                  </td>
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">国籍</th>
                  <td className="border border-black px-2 py-1">
                    <input value={data.nationality} onChange={(e) => onChange("nationality", e.target.value)} className="w-full border-0 p-0 outline-none" />
                  </td>
               </tr>
               <tr>{/* Row 4: 郵便番号 | 携帯電話 | 電話番号 - Adjusted structure */}
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">郵便番号</th>
                 <td className="border border-black px-2 py-1"> {/* Approx 1/3 */}
                   <input value={data.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} placeholder="000-0000" className="w-full border-0 p-0 outline-none" />
                 </td>
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">携帯電話</th>
                 <td className="border border-black px-2 py-1"> {/* Approx 1/3 */}
                   <input value={data.mobile} onChange={(e) => onChange("mobile", e.target.value)} className="w-full border-0 p-0 outline-none" />
                 </td>
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">電話番号</th>
                 <td className="border border-black px-2 py-1" colSpan={3}> {/* Span 3 to fill remaining */}
                   <input value={data.phone} onChange={(e) => onChange("phone", e.target.value)} className="w-full border-0 p-0 outline-none" />
                 </td>
               </tr>
                <tr>{/* Row 5: 住所 */}
                  <th className="border border-black bg-gray-100 px-2 py-1 text-left">住所</th>
                  <td className="border border-black px-2 py-1" colSpan={7}> {/* Span all 7 data/label cols */}
                     <input value={data.address} onChange={(e) => onChange("address", e.target.value)} className="w-full border-0 p-0 outline-none" />
                  </td>
               </tr>
             </tbody>
           </table>
        </div>

        {/* Emergency Contact - Modified to single row */}
        <div className="mb-3">
          <div className="mb-1 font-semibold">緊急連絡先</div>
          <table className="w-full table-fixed border-collapse border border-black text-[11pt]">
             {/* Define 6 columns for 3 label-input pairs */}
             <colgroup>
                <col className="w-[10%]" /> {/* Label 1 */}
                <col className="w-[calc(100%/6*0.9)]" /> {/* Data 1 */}
                <col className="w-[10%]" /> {/* Label 2 */}
                <col className="w-[calc(100%/6*0.9)]" /> {/* Data 2 */}
                <col className="w-[10%]" /> {/* Label 3 */}
                <col className="w-[calc(100%/6*0.9)]" /> {/* Data 3 */}
             </colgroup>
            <tbody>
              <tr> {/* Single Row */}
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">氏名</th>
                <td className="border border-black px-2 py-1">
                  <input
                    value={data.emergencyName}
                    onChange={(e) => onChange("emergencyName", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  />
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">続柄</th>
                <td className="border border-black px-2 py-1">
                  <input
                    value={data.emergencyRelation}
                    onChange={(e) => onChange("emergencyRelation", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  />
                </td>
                 <th className="border border-black bg-gray-100 px-2 py-1 text-left">電話番号</th>
                 <td className="border border-black px-2 py-1">
                   <input
                     value={data.emergencyPhone}
                     onChange={(e) => onChange("emergencyPhone", e.target.value)}
                     className="w-full border-0 p-0 outline-none"
                   />
                 </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Documents */}
        <div className="mb-3">
          <div className="mb-1 font-semibold">書類関係</div>
          <table className="w-full table-fixed border-collapse border border-black text-[11pt]">
            <tbody>
              <tr>
                <th className="w-[16%] border border-black bg-gray-100 px-2 py-1 text-left">在留種類</th>
                <td className="w-[18%] border border-black px-2 py-1">
                  <input
                    value={data.visaType}
                    onChange={(e) => onChange("visaType", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  />
                </td>
                <th className="w-[16%] border border-black bg-gray-100 px-2 py-1 text-left">在留期間</th>
                <td className="w-[18%] border border-black px-2 py-1">
                  <input
                    value={data.visaPeriod}
                    onChange={(e) => onChange("visaPeriod", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  />
                </td>
                <th className="w-[16%] border border-black bg-gray-100 px-2 py-1 text-left">在留カード番号</th>
                <td className="w-[16%] border border-black px-2 py-1">
                  <input
                    value={data.residenceCardNo}
                    onChange={(e) => onChange("residenceCardNo", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  />
                </td>
              </tr>
              <tr>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">パスポート番号</th>
                <td className="border border-black px-2 py-1">
                  <input
                    value={data.passportNo}
                    onChange={(e) => onChange("passportNo", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  />
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">パスポート期限</th>
                <td className="border border-black px-2 py-1">
                   <input
                     id="passportExpiryInput"
                     type="date"
                     value={data.passportExpiry}
                     onChange={(e) => onChange("passportExpiry", e.target.value)}
                     className="w-full border-0 p-0 outline-none bg-transparent print:hidden"
                     data-print-target="passportExpiryPrint"
                   />
                    <span id="passportExpiryPrint" className="hidden print:inline">{formatDateToJapanese(data.passportExpiry)}</span>
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">運転免許番号</th>
                <td className="border border-black px-2 py-1">
                  <input
                    value={data.licenseNo}
                    onChange={(e) => onChange("licenseNo", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  />
                </td>
              </tr>
              <tr>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">運転免許期限</th>
                <td className="border border-black px-2 py-1">
                    <input
                      id="licenseExpiryInput"
                      type="date"
                      value={data.licenseExpiry}
                      onChange={(e) => onChange("licenseExpiry", e.target.value)}
                      className="w-full border-0 p-0 outline-none bg-transparent print:hidden"
                      data-print-target="licenseExpiryPrint"
                    />
                     <span id="licenseExpiryPrint" className="hidden print:inline">{formatDateToJapanese(data.licenseExpiry)}</span>
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">自動車所有</th>
                <td className="border border-black px-2 py-1">
                  <select
                    value={data.carOwner}
                    onChange={(e) => onChange("carOwner", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  >
                    <option value="">選択</option>
                    <option value="有">有</option>
                    <option value="無">無</option>
                  </select>
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">任意保険加入</th>
                <td className="border border-black px-2 py-1">
                  <select
                    value={data.insurance}
                    onChange={(e) => onChange("insurance", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  >
                    <option value="">選択</option>
                    <option value="有">有</option>
                    <option value="無">無</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Language & Education */}
        <div className="mb-3">
          <div className="mb-1 font-semibold">日本語能力・学歴</div>
          <table className="mb-2 w-full table-fixed border-collapse border border-black text-[11pt]">
            <tbody>
              <tr>
                <th className="w-[20%] border border-black bg-gray-100 px-2 py-1 text-left">話す</th>
                <td className="w-[30%] border border-black px-2 py-1">
                  <select
                    value={data.speakLevel}
                    onChange={(e) => onChange("speakLevel", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  >
                    <option value="">選択</option>
                    {levels.speak.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                </td>
                <th className="w-[20%] border border-black bg-gray-100 px-2 py-1 text-left">聞く</th>
                <td className="w-[30%] border border-black px-2 py-1">
                  <select
                    value={data.listenLevel}
                    onChange={(e) => onChange("listenLevel", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  >
                    <option value="">選択</option>
                    {levels.listen.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left align-middle">読み書き</th>
                <td className="border border-black px-2 py-1" colSpan={3}>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {/* Kanji */}
                        <div className="flex items-center gap-1">
                            <label className="shrink-0 w-28">漢字(読み):</label>
                            <select value={data.kanjiReadLevel} onChange={(e) => onChange("kanjiReadLevel", e.target.value)} className="w-full border-0 p-0 outline-none bg-transparent">
                                <option value="">選択</option>
                                {levels.simple.map((lv) => (<option key={lv} value={lv}>{lv}</option>))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <label className="shrink-0 w-28">漢字(書き):</label>
                            <select value={data.kanjiWriteLevel} onChange={(e) => onChange("kanjiWriteLevel", e.target.value)} className="w-full border-0 p-0 outline-none bg-transparent">
                                <option value="">選択</option>
                                {levels.simple.map((lv) => (<option key={lv} value={lv}>{lv}</option>))}
                            </select>
                        </div>
                        {/* Hiragana */}
                        <div className="flex items-center gap-1">
                            <label className="shrink-0 w-28">ひらがな(読み):</label>
                            <select value={data.hiraganaReadLevel} onChange={(e) => onChange("hiraganaReadLevel", e.target.value)} className="w-full border-0 p-0 outline-none bg-transparent">
                                <option value="">選択</option>
                                {levels.simple.map((lv) => (<option key={lv} value={lv}>{lv}</option>))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <label className="shrink-0 w-28">ひらがな(書き):</label>
                            <select value={data.hiraganaWriteLevel} onChange={(e) => onChange("hiraganaWriteLevel", e.target.value)} className="w-full border-0 p-0 outline-none bg-transparent">
                                <option value="">選択</option>
                                {levels.simple.map((lv) => (<option key={lv} value={lv}>{lv}</option>))}
                            </select>
                        </div>
                        {/* Katakana */}
                        <div className="flex items-center gap-1">
                            <label className="shrink-0 w-28">カタカナ(読み):</label>
                            <select value={data.katakanaReadLevel} onChange={(e) => onChange("katakanaReadLevel", e.target.value)} className="w-full border-0 p-0 outline-none bg-transparent">
                                <option value="">選択</option>
                                {levels.simple.map((lv) => (<option key={lv} value={lv}>{lv}</option>))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <label className="shrink-0 w-28">カタカナ(書き):</label>
                            <select value={data.katakanaWriteLevel} onChange={(e) => onChange("katakanaWriteLevel", e.target.value)} className="w-full border-0 p-0 outline-none bg-transparent">
                                <option value="">選択</option>
                                {levels.simple.map((lv) => (<option key={lv} value={lv}>{lv}</option>))}
                            </select>
                        </div>
                    </div>
                </td>
              </tr>
              <tr>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">最終学歴</th>
                <td className="border border-black px-2 py-1">
                  <input
                    value={data.education}
                    onChange={(e) => onChange("education", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  />
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">専攻</th>
                <td className="border border-black px-2 py-1">
                  <input
                    value={data.major}
                    onChange={(e) => onChange("major", e.target.value)}
                    className="w-full border-0 p-0 outline-none"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Qualifications */}
        <div className="mb-3">
          <div className="mb-1 font-semibold">有資格取得</div>
          <div className="flex items-center gap-x-6 gap-y-2 border border-black p-2 text-[11pt] flex-wrap">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.forkliftLicense}
                onChange={(e) => onChange("forkliftLicense", e.target.checked)}
                className="h-4 w-4"
              />
              <span>フォークリフト資格</span>
            </label>
            <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={data.jlpt}
                    onChange={(e) => onChange("jlpt", e.target.checked)}
                    className="h-4 w-4"
                />
                <span>日本語検定</span>
                </label>
                {data.jlpt && (
                <select
                    value={data.jlptLevel}
                    onChange={(e) => onChange("jlptLevel", e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm outline-none p-0.5"
                >
                    <option value="">レベル選択</option>
                    <option value="N1">N1</option>
                    <option value="N2">N2</option>
                    <option value="N3">N3</option>
                    <option value="N4">N4</option>
                    <option value="N5">N5</option>
                </select>
                )}
            </div>
            <div className="flex items-center gap-2">
                <span>その他:</span>
                <input
                    type="text"
                    value={data.otherQualifications}
                    onChange={(e) => onChange('otherQualifications', e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm outline-none p-1"
                    placeholder="その他の資格を入力"
                />
            </div>
          </div>
        </div>

        {/* Physical Info */}
        <div className="mb-3">
          <div className="mb-1 font-semibold">身体情報・健康状態</div>
          <table className="w-full table-fixed border-collapse border border-black text-[11pt]">
            <tbody>
              <tr>
                <th className="w-[16%] border border-black bg-gray-100 px-2 py-1 text-left">身長(cm)</th>
                <td className="w-[12%] border border-black px-2 py-1">
                  <input
                    type="text" // Change type to text
                    value={data.height}
                    onChange={(e) => onChange("height", e.target.value.replace(/[^0-9.]/g, ''))} // Allow only numbers/dot during typing
                    onBlur={handleBlurHeight} // Add onBlur handler
                    className="w-full border-0 p-0 outline-none" />
                </td>
                <th className="w-[16%] border border-black bg-gray-100 px-2 py-1 text-left">体重(kg)</th>
                <td className="w-[12%] border border-black px-2 py-1">
                  <input
                    type="text" // Change type to text
                    value={data.weight}
                    onChange={(e) => onChange("weight", e.target.value.replace(/[^0-9.]/g, ''))} // Allow only numbers/dot during typing
                    onBlur={handleBlurWeight} // Add onBlur handler
                    className="w-full border-0 p-0 outline-none" />
                </td>
                <th className="w-[16%] border border-black bg-gray-100 px-2 py-1 text-left">服のサイズ</th>
                <td className="w-[12%] border border-black px-2 py-1">
                  <input value={data.uniformSize} onChange={(e) => onChange("uniformSize", e.target.value)} className="w-full border-0 p-0 outline-none" />
                </td>
                <th className="w-[16%] border border-black bg-gray-100 px-2 py-1 text-left">ウエスト(cm)</th>
                <td className="w-[12%] border border-black px-2 py-1">
                  <input
                     type="text" // Change type to text
                     value={data.waist}
                     onChange={(e) => onChange("waist", e.target.value.replace(/[^0-9.]/g, ''))} // Allow only numbers/dot
                     onBlur={handleBlurWaist} // Add onBlur handler
                     className="w-full border-0 p-0 outline-none" />
                </td>
              </tr>
              <tr>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">靴サイズ(cm)</th>
                <td className="border border-black px-2 py-1">
                  <input value={data.shoeSize} onChange={(e) => onChange("shoeSize", e.target.value)} className="w-full border-0 p-0 outline-none" />
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">血液型</th>
                <td className="border border-black px-2 py-1">
                  <input value={data.bloodType} onChange={(e) => onChange("bloodType", e.target.value)} className="w-full border-0 p-0 outline-none" />
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">視力(右)</th>
                <td className="border border-black px-2 py-1">
                  <input value={data.visionRight} onChange={(e) => onChange("visionRight", e.target.value)} className="w-full border-0 p-0 outline-none" />
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">視力(左)</th>
                <td className="border border-black px-2 py-1">
                  <input value={data.visionLeft} onChange={(e) => onChange("visionLeft", e.target.value)} className="w-full border-0 p-0 outline-none" />
                </td>
              </tr>
              <tr>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">メガネ使用</th>
                <td className="border border-black px-2 py-1">
                  <select value={data.glasses} onChange={(e) => onChange("glasses", e.target.value)} className="w-full border-0 p-0 outline-none">
                    <option value="">選択</option>
                    <option value="有">有</option>
                    <option value="無">無</option>
                  </select>
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">利き腕</th>
                <td className="border border-black px-2 py-1">
                  <select value={data.dominantArm} onChange={(e) => onChange("dominantArm", e.target.value)} className="w-full border-0 p-0 outline-none">
                    <option value="">選択</option>
                    <option value="右">右</option>
                    <option value="左">左</option>
                  </select>
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">アレルギー</th>
                <td className="border border-black px-2 py-1">
                  <select value={data.allergy} onChange={(e) => onChange("allergy", e.target.value)} className="w-full border-0 p-0 outline-none">
                    <option value="">選択</option>
                    <option value="有">有</option>
                    <option value="無">無</option>
                  </select>
                </td>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">安全靴</th>
                <td className="border border-black px-2 py-1">
                  <select value={data.safetyShoes} onChange={(e) => onChange("safetyShoes", e.target.value)} className="w-full border-0 p-0 outline-none">
                    <option value="">選択</option>
                    <option value="有">有</option>
                    <option value="無">無</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th className="border border-black bg-gray-100 px-2 py-1 text-left">コロナワクチン</th>
                <td className="border border-black px-2 py-1" colSpan={7}>
                  <select value={data.vaccine} onChange={(e) => onChange("vaccine", e.target.value)} className="w-full border-0 p-0 outline-none">
                    <option value="">選択</option>
                    <option value="未接種">未接種</option>
                    <option value="1回">1回接種</option>
                    <option value="2回">2回接種</option>
                    <option value="3回">3回接種</option>
                    <option value="4回">4回接種</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Work History - Updated Column Order */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold">職務経歴</span>
            <button onClick={addJob} className="rounded border px-3 py-1 text-sm hover:bg-gray-50 print:hidden">職歴追加</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed border-collapse border border-black text-[11pt]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="w-[13%] border border-black px-2 py-1 text-left">開始</th>
                  <th className="w-[13%] border border-black px-2 py-1 text-left">終了</th>
                  <th className="w-[17%] border border-black bg-gray-100 px-2 py-1 text-left">派遣元</th>
                  <th className="w-[17%] border border-black bg-gray-100 px-2 py-1 text-left">派遣先</th>
                   <th className="w-[15%] border border-black px-2 py-1 text-left">勤務地</th>{/* Moved */}
                   <th className="border border-black px-2 py-1 text-left">内容</th>{/* Moved */}
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-black px-2 py-1">
                        <input id={`jobStartInput-${i}`} type="month" value={row.start} onChange={(e) => updateJob(i, { start: e.target.value })} className="w-full border-0 p-0 outline-none print:hidden" data-print-target={`jobStartPrint-${i}`}/>
                        <span id={`jobStartPrint-${i}`} className="hidden print:inline"></span> {/* Formatted in useEffect */}
                    </td>
                    <td className="border border-black px-2 py-1">
                        <input id={`jobEndInput-${i}`} type="month" value={row.end} onChange={(e) => updateJob(i, { end: e.target.value })} className="w-full border-0 p-0 outline-none print:hidden" data-print-target={`jobEndPrint-${i}`}/>
                         <span id={`jobEndPrint-${i}`} className="hidden print:inline"></span> {/* Formatted in useEffect */}
                    </td>
                    <td className="border border-black px-2 py-1"><input value={row.hakenmoto} onChange={(e) => updateJob(i, { hakenmoto: e.target.value })} className="w-full border-0 p-0 outline-none" /></td>
                    <td className="border border-black px-2 py-1"><input value={row.hakensaki} onChange={(e) => updateJob(i, { hakensaki: e.target.value })} className="w-full border-0 p-0 outline-none" /></td>
                     <td className="border border-black px-2 py-1"> {/* Moved Cell: 勤務地 (Work Location) */}
                       <div className="flex gap-2">
                         {/* Input still linked to 'reason' state */}
                         <input value={row.reason} onChange={(e) => updateJob(i, { reason: e.target.value })} className="w-full border-0 p-0 outline-none" />
                         {/* Keep delete button with this input conceptually */}
                         <button type="button" onClick={() => removeJob(i)} className="h-7 w-7 shrink-0 rounded-full bg-red-100 text-red-600 print:hidden" title="行を削除">×</button>
                       </div>
                     </td>
                     <td className="border border-black px-2 py-1"> {/* Moved Cell: 内容 (Content) */}
                       <div className="flex items-center gap-1">
                         <input value={row.content} onChange={(e) => updateJob(i, { content: e.target.value })} className="w-full border-0 p-0 outline-none" />
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Family Composition - Updated */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold">家族構成</span>
            <button onClick={addFamily} className="rounded border px-3 py-1 text-sm hover:bg-gray-50 print:hidden">家族追加</button>
          </div>
          <div className="overflow-x-auto">
            {/* Adjusted column widths */}
            <table className="w-full min-w-[600px] table-fixed border-collapse border border-black text-[11pt]">
               <colgroup>
                  <col className="w-[30%]" /> {/* Name */}
                  <col className="w-[20%]" /> {/* Relation */}
                  <col className="w-[15%]" /> {/* Age */}
                  <col className="w-[20%]" /> {/* Residence */}
                  <col className="w-[15%]" /> {/* Dependent */}
               </colgroup>
               <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-2 py-1 text-left">氏名</th>
                  <th className="border border-black px-2 py-1 text-left">続柄</th>
                  {/* Removed Birthday Header */}
                  <th className="border border-black px-2 py-1 text-left">年齢</th>
                  <th className="border border-black px-2 py-1 text-left">居住</th>
                  <th className="border border-black px-2 py-1 text-left">扶養</th>
                </tr>
              </thead>
              <tbody>
                 {data.family.map((row, i) => {
                    // Determine if the current relation is custom (not empty and not in the predefined list)
                    const isCustomRelation = row.relation && !levels.relationOptions.includes(row.relation);
                     // Show input if explicitly editing OR if the current value is custom
                    const showTextInput = editingRelationIndex === i || isCustomRelation;

                    return (
                      <tr key={i}>
                        <td className="border border-black px-2 py-1"><input value={row.name} onChange={(e) => updateFamily(i, { name: e.target.value })} className="w-full border-0 p-0 outline-none" /></td>
                        <td className="border border-black px-2 py-1 relative"> {/* Added relative positioning */}
                           {/* Show input if editing OR if the value is custom */}
                          {showTextInput ? (
                            <input
                              type="text"
                              value={row.relation}
                              onChange={(e) => updateFamily(i, { relation: e.target.value })}
                              onBlur={() => {
                                  // If the input is empty on blur, reset to empty string to show select again
                                  if (data.family[i].relation === "") {
                                      updateFamily(i, { relation: "" });
                                  }
                                  setEditingRelationIndex(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Tab') { // Also handle Tab
                                    // If text is empty after edit, reset to show select
                                    if(e.currentTarget.value === "") {
                                        updateFamily(i, { relation: "" }); // Explicitly set empty
                                    }
                                    setEditingRelationIndex(null);
                                    e.preventDefault(); // Prevent default Tab behavior if needed
                                }
                               }}
                              placeholder="関係を入力"
                              className="w-full border-gray-300 rounded-md shadow-sm outline-none p-1 text-[10pt]"
                              autoFocus={editingRelationIndex === i} // Focus only when explicitly starting edit
                            />
                          ) : (
                             // Show dropdown if not editing and not custom
                             <div onClick={() => setEditingRelationIndex(i)} className="cursor-pointer w-full h-full flex items-center min-h-[24px]"> {/* Clickable div with min-height */}
                               <select
                                 value={row.relation || ""} // Default to "選択" if empty
                                 onChange={(e) => {
                                   const newValue = e.target.value;
                                   if (newValue === 'その他') {
                                     // Set state to start editing, clear current value to force input
                                      updateFamily(i, { relation: "" }); // Clear relation to ensure input shows prompt
                                      setEditingRelationIndex(i);
                                   } else {
                                     updateFamily(i, { relation: newValue });
                                     setEditingRelationIndex(null); // Stop editing
                                   }
                                 }}
                                 // Make select itself clickable too
                                 onClick={(e) => {
                                     // If clicking the select again, ensure edit mode starts if needed
                                     if (row.relation && !levels.relationOptions.includes(row.relation)) {
                                          setEditingRelationIndex(i);
                                     }
                                 }}
                                 className="w-full border-0 p-0 outline-none bg-transparent appearance-none cursor-pointer" /* Added cursor-pointer */
                               >
                                  {/* Base option */}
                                  <option value="">選択</option>
                                  {/* Predefined options */}
                                  {levels.relationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}

                               </select>
                               {/* Simple down arrow */}
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</span>
                            </div>
                          )}
                        </td>
                        <td className="border border-black px-2 py-1"><input type="number" value={row.age} onChange={(e) => updateFamily(i, { age: e.target.value })} className="w-full border-0 p-0 outline-none" /></td>
                        <td className="border border-black px-2 py-1">
                           {/* Residence Select */}
                           <select
                             value={row.residence}
                             onChange={(e) => updateFamily(i, { residence: e.target.value })}
                             className="w-full border-0 p-0 outline-none bg-transparent"
                           >
                             <option value="">選択</option>
                             {levels.residenceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </td>
                        <td className="border border-black px-2 py-1">
                          <select value={row.dependent} onChange={(e) => updateFamily(i, { dependent: e.target.value })} className="w-full border-0 p-0 outline-none">
                            <option value="有">有</option>
                            <option value="無">無</option>
                          </select>
                        </td>
                      </tr>
                   );
                 })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer - Updated */}
        <div className="mt-auto pt-4">
            <table className="w-full table-fixed border-collapse border border-black text-[11pt]">
               {/* Adjust colgroup for 3 pairs */}
                <colgroup>
                    <col className="w-[15%]" /> {/* Label 1 */}
                    <col className="w-[18.33%]" />{/* Data 1 */}
                    <col className="w-[15%]" /> {/* Label 2 */}
                    <col className="w-[18.33%]" />{/* Data 2 */}
                    <col className="w-[15%]" /> {/* Label 3 */}
                    <col className="w-[18.33%]" />{/* Data 3 */}
                </colgroup>
                <tbody>
                    <tr>
                        <th className="border border-black bg-gray-100 px-2 py-1 text-left">通勤方法</th>
                        <td className="border border-black px-2 py-1">
                            <select
                                value={data.commuteMethod}
                                onChange={(e) => onChange("commuteMethod", e.target.value)}
                                className="w-full border-0 p-0 outline-none bg-transparent"
                            >
                                <option value="">選択</option>
                                {levels.commuteOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </td>
                        <th className="border border-black bg-gray-100 px-2 py-1 text-left">通勤片道時間（分）</th>
                        <td className="border border-black px-2 py-1">
                            <input
                                type="text" // Changed to text for formatting
                                value={data.commuteTimeMin}
                                onChange={(e) => onChange("commuteTimeMin", e.target.value.replace(/[^0-9]/g, ''))} // Allow only numbers
                                onBlur={handleBlurCommuteTime} // Add onBlur handler
                                className="w-full border-0 p-0 outline-none" />
                        </td>
                        <th className="border border-black bg-gray-100 px-2 py-1 text-left">お弁当（社内食堂）</th>
                        <td className="border border-black px-2 py-1">
                        <select value={data.lunchPref} onChange={(e) => onChange("lunchPref", e.target.value)} className="w-full border-0 p-0 outline-none">
                            {(["昼/夜", "昼のみ", "夜のみ", "持参"] as const).map((v) => (<option key={v} value={v}>{v}</option>))}
                        </select>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="mt-4 text-center text-[10pt]">
                <div>ユニバーサル企画株式会社</div>
                <div>TEL 052-938-8840　FAX 052-938-8841</div>
            </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
        .font-noto-sans-jp { font-family: 'Noto Sans JP', sans-serif; }
        @page { size: A4 landscape; margin: 8mm; }
        @media print {
          html, body {
            background: white !important;
            font-family: 'Noto Sans JP', sans-serif;
            padding: 0; /* Remove default padding for printing */
            margin: 0; /* Remove default margin for printing */
          }
          /* Ensure the main content uses the full print area */
          .mx-auto.max-w-\\[1200px\\] {
             max-width: none;
             width: 100%;
             padding: 0 !important; /* Override padding */
             margin: 0 !important; /* Override margin */
          }
           /* Specific adjustments for the A4 canvas */
          div[style*="width: 297mm"] {
              box-shadow: none !important; /* Remove shadow for print */
              padding: 6mm !important; /* Adjust padding for print if needed */
              margin: 0 auto !important; /* Center the content if needed */
              border: none !important; /* Remove border for print */
              height: auto !important; /* Allow height to adjust */
              min-height: 194mm !important; /* Adjust min-height based on margins */
          }

          input, select, textarea {
            -webkit-print-color-adjust: exact !important; /* Important for some browsers */
            print-color-adjust: exact !important;
            background-color: transparent !important; /* Ensure background is transparent */
            border: none !important; /* Remove borders */
            box-shadow: none !important; /* Remove shadows */
            padding: 0 !important; /* Reset padding */
            margin: 0 !important; /* Reset margin */
            color: black !important; /* Ensure text color is black */
          }
          select {
             appearance: none; /* Hide dropdown arrow */
             -webkit-appearance: none;
             -moz-appearance: none;
          }
          /* Hide custom arrow in print */
          td span.absolute {
             display: none !important;
          }


          /* Use display:block to potentially help with breaking */
          table, div.mb-3 {
            page-break-inside: avoid;
          }
           /* Hide elements not meant for printing */
          .print\\:hidden { display: none !important; }

           /* Show the formatted span during print */
           span.print\\:inline {
               display: inline !important; /* Or block depending on context */
               white-space: nowrap; /* Prevent wrapping */
           }

           /* Hide browser's date/month picker icon specifically for printing */
           input[type="date"]::-webkit-calendar-picker-indicator,
           input[type="month"]::-webkit-calendar-picker-indicator {
               display: none !important;
               -webkit-appearance: none !important;
           }
            input[type="date"]::-moz-calendar-picker-indicator, /* Firefox */
            input[type="month"]::-moz-calendar-picker-indicator {
               display: none !important;
           }

        }
      `}</style>

    </div>
  );
}

// --- Types ---
type JobEntry = { start: string; end: string; hakenmoto: string; hakensaki: string; content: string; reason: string; }; // 'reason' corresponds to '勤務地' input
// Updated FamilyEntry type
type FamilyEntry = {
    name: string;
    relation: string; // Will store predefined or custom 'その他' text
    // birthday: string; // Removed birthday
    age: string;
    residence: string; // Changed from input to select options
    dependent: "有" | "無" | "";
};
type FormDataState = {
  applicantId: string; receptionDate: string; timeInJapan: string; nameKanji: string; nameFurigana: string; birthday: string; age: string; gender: string;
  nationality: string; postalCode: string; address: string; mobile: string; phone: string; emergencyName: string;
  emergencyRelation: string; emergencyPhone: string; visaType: string; visaPeriod: string; residenceCardNo: string;
  passportNo: string; passportExpiry: string; licenseNo: string; licenseExpiry: string; carOwner: string; insurance: string;
  speakLevel: string; listenLevel: string; kanjiReadLevel: string; kanjiWriteLevel: string; hiraganaReadLevel: string; hiraganaWriteLevel: string; katakanaReadLevel: string; katakanaWriteLevel: string; education: string;
  major: string; height: string; weight: string; uniformSize: string; waist: string; shoeSize: string; bloodType: string;
  visionRight: string; visionLeft: string; glasses: string; dominantArm: string; allergy: string; safetyShoes: string;
  vaccine: string; forkliftLicense: boolean; jlpt: boolean; jlptLevel: string; otherQualifications: string; lunchPref: "昼/夜" | "昼のみ" | "夜のみ" | "持参";
  commuteTimeMin: string; commuteMethod: string; // Added commuteMethod type
  jobs: JobEntry[];
  family: FamilyEntry[]; // Use updated FamilyEntry type
};
