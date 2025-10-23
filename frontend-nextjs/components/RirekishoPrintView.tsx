import React from 'react';

interface RirekishoPrintViewProps {
  data: any;
  photoPreview?: string;
}

const formatDateToJapanese = (dateString: string) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return "";
  }
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return "";
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    return `${year}年${paddedMonth}月${paddedDay}日`;
  } catch (e) {
    console.error("Error formatting date string:", dateString, e);
    return "";
  }
};

const formatMonthToJapanese = (monthString: string) => {
  if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) {
    return "";
  }
  try {
    const [year, month] = monthString.split('-');
    if (!year || !month) return "";
    const paddedMonth = month.padStart(2, '0');
    return `${year}年${paddedMonth}月`;
  } catch (e) {
    console.error("Error formatting month string:", monthString, e);
    return "";
  }
};

const RirekishoPrintView: React.FC<RirekishoPrintViewProps> = ({ data, photoPreview }) => {
  const levels = {
    speak: ["初級（挨拶程度）", "中級（日常会話・就職可）", "上級（通訳可）"],
    listen: ["初級（挨拶程度）", "中級（日常会話・就職可）", "上級（通訳可）"],
    simple: ["できる", "少し", "できない"],
    timeInJapan: [
      ...[...Array(11).keys()].map(i => `${i + 1}ヶ月`),
      ...[...Array(20).keys()].map(i => `${i + 1}年`),
      "20年以上",
    ],
    residenceOptions: ["同居", "別居", "国内", "国外"],
    commuteOptions: ["自家用車", "送迎", "原付電動機", "自転車", "歩き"],
    relationOptions: ["妻", "長男", "次男", "息子", "子", "長女", "次女", "娘", "母", "父", "その他"],
  };

  return (
    <div className="rirekisho-print-container">
      {/* Header */}
      <div className="print-header">
        <h1>履歴書</h1>
      </div>

      {/* Basic Info & Emergency Contact - Combined Layout */}
      <div className="form-section basic-info-layout">
        <div className="photo-container">
          <div className="photo-frame">
            {photoPreview ? (
              <img src={photoPreview} className="photo-img" alt="証明写真" />
            ) : (
              <span className="photo-placeholder">写真</span>
            )}
          </div>
        </div>
        <div className="info-column">
          <table className="info-table">
            <tbody>
              <tr>
                <th>受付日</th>
                <td colSpan={3}>{formatDateToJapanese(data.receptionDate)}</td>
                <th>来日</th>
                <td colSpan={3}>{data.timeInJapan}</td>
              </tr>
              <tr>
                <th>氏名</th>
                <td colSpan={3}>{data.nameKanji}</td>
                <th>フリガナ</th>
                <td colSpan={3}>{data.nameFurigana}</td>
              </tr>
              <tr>
                <th>生年月日</th>
                <td>{formatDateToJapanese(data.birthday)}</td>
                <th>年齢</th>
                <td>{data.age}</td>
                <th>性別</th>
                <td>{data.gender}</td>
                <th>国籍</th>
                <td>{data.nationality}</td>
              </tr>
              <tr>
                <th>郵便番号</th>
                <td>{data.postalCode}</td>
                <th>携帯電話</th>
                <td>{data.mobile}</td>
                <th>電話番号</th>
                <td colSpan={3}>{data.phone}</td>
              </tr>
              <tr>
                <th>住所</th>
                <td colSpan={7}>{data.address}</td>
              </tr>
            </tbody>
          </table>
          {/* Emergency Contact (Moved) */}
          <div className="form-section moved-emergency-contact">
            <h2>緊急連絡先</h2>
            <table className="info-table">
              <tbody>
                <tr>
                  <th>氏名</th>
                  <td>{data.emergencyName}</td>
                  <th>続柄</th>
                  <td>{data.emergencyRelation}</td>
                  <th>電話番号</th>
                  <td>{data.emergencyPhone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="form-section">
        <h2>書類関係</h2>
        <table className="info-table">
          <tbody>
            <tr>
              <th>在留種類</th>
              <td>{data.visaType}</td>
              <th>在留期間</th>
              <td>{data.visaPeriod}</td>
              <th>在留カード番号</th>
              <td>{data.residenceCardNo}</td>
            </tr>
            <tr>
              <th>パスポート番号</th>
              <td>{data.passportNo}</td>
              <th>パスポート期限</th>
              <td>{formatDateToJapanese(data.passportExpiry)}</td>
              <th>運転免許番号</th>
              <td>{data.licenseNo}</td>
            </tr>
            <tr>
              <th>運転免許期限</th>
              <td>{formatDateToJapanese(data.licenseExpiry)}</td>
              <th>自動車所有</th>
              <td>{data.carOwner}</td>
              <th>任意保険加入</th>
              <td>{data.insurance}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Language & Education */}
      <div className="form-section">
        <h2>日本語能力・学歴</h2>
        <table className="info-table">
          <tbody>
            <tr>
              <th>話す</th>
              <td>{data.speakLevel}</td>
              <th>聞く</th>
              <td>{data.listenLevel}</td>
            </tr>
            <tr>
              <th>読み書き</th>
              <td colSpan={3}>
                <div className="grid-2-cols">
                  <div>漢字(読み): {data.kanjiReadLevel}</div>
                  <div>漢字(書き): {data.kanjiWriteLevel}</div>
                  <div>ひらがな(読み): {data.hiraganaReadLevel}</div>
                  <div>ひらがな(書き): {data.hiraganaWriteLevel}</div>
                  <div>カタカナ(読み): {data.katakanaReadLevel}</div>
                  <div>カタカナ(書き): {data.katakanaWriteLevel}</div>
                </div>
              </td>
            </tr>
            <tr>
              <th>最終学歴</th>
              <td>{data.education}</td>
              <th>専攻</th>
              <td>{data.major}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Qualifications */}
      <div className="form-section">
        <h2>有資格取得</h2>
        <div className="qualifications-container">
          <div className="qualification-item">
            <span className="qualification-label">
              {data.forkliftLicense ? "✓" : "□"} フォークリフト資格
            </span>
          </div>
          <div className="qualification-item">
            <span className="qualification-label">
              {data.jlpt ? "✓" : "□"} 日本語検定
            </span>
            {data.jlpt && <span className="qualification-level">({data.jlptLevel})</span>}
          </div>
          {data.otherQualifications && (
            <div className="qualification-item">
              <span className="qualification-label">その他: {data.otherQualifications}</span>
            </div>
          )}
        </div>
      </div>

      {/* Physical Info */}
      <div className="form-section">
        <h2>身体情報・健康状態</h2>
        <table className="info-table">
          <tbody>
            <tr>
              <th>身長(cm)</th>
              <td>{data.height}</td>
              <th>体重(kg)</th>
              <td>{data.weight}</td>
              <th>血液型</th>
              <td>{data.bloodType}</td>
              <th>ウエスト(cm)</th>
              <td>{data.waist}</td>
            </tr>
            <tr>
              <th>靴サイズ(cm)</th>
              <td>{data.shoeSize}</td>
              <th>服のサイズ</th>
              <td>{data.uniformSize}</td>
              <th>視力(右)</th>
              <td>{data.visionRight}</td>
              <th>視力(左)</th>
              <td>{data.visionLeft}</td>
            </tr>
            <tr>
              <th>メガネ使用</th>
              <td>{data.glasses}</td>
              <th>利き腕</th>
              <td>{data.dominantArm}</td>
              <th>アレルギー</th>
              <td>{data.allergy}</td>
              <th>安全靴</th>
              <td>{data.safetyShoes}</td>
            </tr>
            <tr>
              <th>コロナワクチン</th>
              <td colSpan={7}>{data.vaccine}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Work History */}
      <div className="form-section">
        <h2>職務経歴</h2>
        <table className="info-table">
          <thead>
            <tr>
              <th>開始</th>
              <th>終了</th>
              <th>派遣元</th>
              <th>退職理由</th>
              <th>派遣先 / 内容</th>
            </tr>
          </thead>
          <tbody>
            {data.jobs && data.jobs.length > 0 ? (
              data.jobs.map((row: any, i: number) => (
                <tr key={i}>
                  <td>{formatMonthToJapanese(row.start)}</td>
                  <td>{formatMonthToJapanese(row.end)}</td>
                  <td>{row.hakenmoto}</td>
                  <td>{row.reason}</td>
                  <td>{`${row.hakensaki || ''} / ${row.content || ''}`}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">職務経歴はありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Family Composition */}
      <div className="form-section">
        <h2>家族構成</h2>
        <table className="info-table">
          <thead>
            <tr>
              <th>氏名</th>
              <th>続柄</th>
              <th>年齢</th>
              <th>居住</th>
              <th>扶養</th>
            </tr>
          </thead>
          <tbody>
            {data.family && data.family.length > 0 ? (
              data.family.map((row: any, i: number) => (
                <tr key={i}>
                  <td>{row.name}</td>
                  <td>{row.relation}</td>
                  <td>{row.age}</td>
                  <td>{row.residence}</td>
                  <td>{row.dependent}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">家族構成はありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="form-footer">
        <table className="info-table">
          <tbody>
            <tr>
              <th>通勤方法</th>
              <td>{data.commuteMethod}</td>
              <th>通勤片道時間（分）</th>
              <td>{data.commuteTimeMin}</td>
              <th>お弁当（社内食堂）</th>
              <td>{data.lunchPref}</td>
            </tr>
          </tbody>
        </table>
        <div className="company-info">
          <div>ユニバーサル企画株式会社</div>
          <div>TEL 052-938-8840　FAX 052-938-8841</div>
        </div>
      </div>

      <style jsx>{`
        .rirekisho-print-container {
          width: 210mm;
          /* min-height: 297mm; */ /* Removed to allow natural content flow and pagination */
          margin: 0 auto;
          padding: 8mm;
          background: white;
          font-family: 'Noto Sans JP', sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: black;
          box-sizing: border-box;
          display: block; /* Changed from flex for better page break handling */
        }

        .print-header {
          text-align: center;
          margin-bottom: 10px;
          page-break-after: avoid;
        }

        .print-header h1 {
          font-size: 18pt;
          font-weight: bold;
          margin: 0;
        }

        .form-section {
          margin-bottom: 10px;
          /* page-break-inside: avoid; <- Removed for more granular control */
        }

        .basic-info-layout {
          display: flex;
          flex-direction: row;
          align-items: stretch; /* Make children (photo and info-column) same height */
          gap: 4mm;
          page-break-inside: avoid; /* Keep this section from breaking */
        }
        
        .info-column {
          flex: 1; /* Make column fill remaining space */
          min-width: 0; /* Prevent overflow in flex context */
          display: flex;
          flex-direction: column;
        }

        .info-column > .info-table {
          flex-grow: 1; /* Allow the main table to grow vertically */
        }

        .moved-emergency-contact {
          margin-top: 4px;
          margin-bottom: 0;
        }

        .moved-emergency-contact h2 {
          margin-top: 0;
        }

        .form-section h2 {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 4px;
          margin-top: 8px;
          page-break-after: avoid; /* Avoid breaking right after a heading */
        }

        .photo-container {
          flex-shrink: 0;
          width: 40mm;
          height: 50mm;
        }

        .photo-frame {
          width: 100%;
          height: 100%;
          border: 1px solid black;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-placeholder {
          color: #999;
          font-size: 9pt;
        }

        .info-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          page-break-inside: auto; /* Allow tables to break */
        }

        .info-table th,
        .info-table td {
          border: 1px solid black;
          padding: 2px 4px;
          font-size: 8.5pt; /* Slightly adjusted font size */
          text-align: left;
          vertical-align: middle;
          word-wrap: break-word;
        }

        .info-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        .info-table thead {
          display: table-header-group; /* Repeat headers on page break */
        }

        .info-table tbody tr {
          page-break-inside: avoid; /* Avoid breaking a single row */
        }

        .grid-2-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
        }

        .qualifications-container {
          border: 1px solid black;
          padding: 5px;
          page-break-inside: avoid;
        }

        .form-footer {
          margin-top: auto;
          padding-top: 10px;
          page-break-before: auto;
          page-break-inside: avoid; /* Keep footer from breaking */
        }

        .company-info {
          margin-top: 10px;
          text-align: center;
          font-size: 9pt;
        }

        .text-center {
          text-align: center;
        }

        @page {
          size: A4 portrait;
          margin: 12mm; /* Adjusted margin */
        }

        @media print {
          html, body {
            background: #fff !important;
            font-family: 'Noto Sans JP', sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .rirekisho-print-container {
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
            width: 100% !important;
          }
          .info-table th,
          .info-table td {
            font-size: 8pt !important;
            padding: 1.5px 3px !important;
          }
          .info-table th {
             background-color: #f0f0f0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RirekishoPrintView;