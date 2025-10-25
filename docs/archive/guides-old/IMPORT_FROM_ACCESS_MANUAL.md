# Access候補者インポートスクリプト

## 概要

このスクリプトは、Access データベース（`T_履歴書` テーブル）から PostgreSQL の `candidates` テーブルに候補者データを移行します。

**データベース情報:**
- **Access DB**: `C:\Users\JPUNS\Desktop\ユニバーサル企画㈱データベースv25.3.24.accdb`
- **テーブル**: `T_履歴書` (1,148 レコード, 172 カラム)
- **対象**: PostgreSQL `candidates` テーブル

## 主な機能

1. **完全なフィールドマッピング**: 172 Access カラムを candidates テーブルにマッピング
2. **写真処理**: ファイルパスまたは Base64 データの自動検出と変換
3. **重複チェック**: 挿入前に履歴書ID・氏名・生年月日で重複を確認
4. **バッチ処理**: 100 レコード単位でインポート
5. **詳細レポート**: JSON 形式で結果を出力
6. **サンプルモード**: 実際にインポートせず、最初の 5 レコードを検査

## 前提条件

### 必要なソフトウェア

- Python 3.11+
- Microsoft Access Driver (ODBC)
- PostgreSQL (Docker コンテナで実行中)

### Python パッケージ

```bash
pip install pyodbc sqlalchemy psycopg2-binary
```

### Access ODBC ドライバー

Windows の場合、通常は既にインストール済みです。インストールされていない場合:

1. [Microsoft Access Database Engine 2016 Redistributable](https://www.microsoft.com/en-us/download/details.aspx?id=54920) をダウンロード
2. インストール実行

## 使用方法

### 1. サンプルモード（推奨：最初に実行）

最初の 5 レコードを検査し、データ形式を確認します（データベースへの挿入は行いません）:

```bash
cd D:\JPUNS-CLAUDE4.2\UNS-ClaudeJP-4.2\backend
python scripts\import_access_candidates.py --sample
```

**出力例:**
```
================================================================================
Sample Record #1:
================================================================================
履歴書ID: 12345
氏名: 田中太郎
生年月日: 1990-05-15
国籍: ベトナム
Photo URL: C:\photos\tanaka.jpg
Photo Data URL: Yes

Mapped Fields (75 total):
  rirekisho_id: 12345
  full_name_kanji: 田中太郎
  date_of_birth: 1990-05-15
  nationality: ベトナム
  ...
```

### 2. 全レコードインポート

全 1,148 レコードをインポート:

```bash
python scripts\import_access_candidates.py --full
```

### 3. 制限付きインポート

最初の 100 レコードのみインポート（テスト用）:

```bash
python scripts\import_access_candidates.py --limit 100
```

### 4. カスタムレポート名

レポートファイル名を指定:

```bash
python scripts\import_access_candidates.py --full --report custom_report.json
```

## 出力ファイル

### 1. ログファイル

`import_candidates_YYYYMMDD_HHMMSS.log`

すべての処理内容を記録:
- 処理済みレコード数
- エラー詳細
- 重複スキップ
- 写真処理状況

### 2. レポートファイル

`import_candidates_report.json` (デフォルト)

```json
{
  "timestamp": "2025-10-24T15:30:00",
  "access_database": "C:\\Users\\JPUNS\\Desktop\\...",
  "postgres_url": "postgresql://uns_admin:***@localhost:5432/uns_claudejp",
  "statistics": {
    "total_records": 1148,
    "processed": 1148,
    "inserted": 1120,
    "skipped_duplicates": 25,
    "errors": 3,
    "photo_file_paths": 800,
    "photo_base64": 50,
    "photo_empty": 298
  },
  "errors": [
    {
      "record_num": 45,
      "error": "Invalid date format",
      "rirekisho_id": "12345"
    }
  ]
}
```

## フィールドマッピング詳細

### 基本情報

| Access カラム | PostgreSQL カラム | 型 |
|--------------|------------------|-----|
| 履歴書ID | rirekisho_id | String(20) |
| 受付日 | reception_date | Date |
| 来日 | arrival_date | Date |
| 氏名 | full_name_kanji | String(100) |
| フリガナ | full_name_kana | String(100) |
| 氏名（ローマ字) | full_name_roman | String(100) |
| 性別 | gender | String(10) |
| 生年月日 | date_of_birth | Date |
| 国籍 | nationality | String(50) |
| 配偶者 | marital_status | String(20) |
| 入社日 | hire_date | Date |

### 住所情報

| Access カラム | PostgreSQL カラム |
|--------------|------------------|
| 郵便番号 | postal_code |
| 現住所 | current_address |
| 番地 | address_banchi |
| 物件名 | building_name |
| 登録住所 | registered_address |

### 連絡先

| Access カラム | PostgreSQL カラム |
|--------------|------------------|
| 電話番号 | phone |
| 携帯電話 | mobile |

### 在留資格・パスポート

| Access カラム | PostgreSQL カラム |
|--------------|------------------|
| パスポート番号 | passport_number |
| パスポート期限 | passport_expiry |
| 在留資格 | residence_status |
| 在留期限 | residence_expiry |
| 在留カード番号 | residence_card_number |

### 運転免許

| Access カラム | PostgreSQL カラム |
|--------------|------------------|
| 運転免許番号及び条件 | license_number |
| 運転免許期限 | license_expiry |
| 自動車所有 | car_ownership |
| 任意保険加入 | voluntary_insurance |

### 資格

| Access カラム | PostgreSQL カラム |
|--------------|------------------|
| ﾌｫｰｸﾘﾌﾄ免許 | forklift_license |
| 玉掛 | tama_kake |
| 移動式ｸﾚｰﾝ運転士(5ﾄﾝ未満) | mobile_crane_under_5t |
| 移動式ｸﾚｰﾝ運転士(5ﾄﾝ以上) | mobile_crane_over_5t |
| ｶﾞｽ溶接作業者 | gas_welding |

### 家族構成（1-5人）

各家族メンバーについて:
- 氏名 (`family_name_1` ~ `family_name_5`)
- 続柄 (`family_relation_1` ~ `family_relation_5`)
- 年齢 (`family_age_1` ~ `family_age_5`)
- 居住 (`family_residence_1` ~ `family_residence_5`)
- 別居住所 (`family_separate_address_1` ~ `family_separate_address_5`)

### 日本語能力

| Access カラム | PostgreSQL カラム |
|--------------|------------------|
| 会話ができる | can_speak |
| 会話が理解できる | can_understand |
| ひらがな・カタカナ読める | can_read_kana |
| ひらがな・カタカナ書ける | can_write_kana |
| 読む　カナ | read_katakana |
| 読む　ひら | read_hiragana |
| 読む　漢字 | read_kanji |
| 書く　カナ | write_katakana |
| 書く　ひら | write_hiragana |
| 書く　漢字 | write_kanji |
| 日本語能力資格 | japanese_qualification |
| 日本語能力資格Level | japanese_level |

### 職務経験

| Access カラム | PostgreSQL カラム | 型 |
|--------------|------------------|-----|
| NC旋盤 | exp_nc_lathe | Boolean |
| 旋盤 | exp_lathe | Boolean |
| ﾌﾟﾚｽ | exp_press | Boolean |
| ﾌｫｰｸﾘﾌﾄ | exp_forklift | Boolean |
| 梱包 | exp_packing | Boolean |
| 溶接 | exp_welding | Boolean |
| 車部品組立 | exp_car_assembly | Boolean |
| 車部品ライン | exp_car_line | Boolean |
| 車部品検査 | exp_car_inspection | Boolean |
| 電子部品検査 | exp_electronic_inspection | Boolean |
| 食品加工 | exp_food_processing | Boolean |
| 鋳造 | exp_casting | Boolean |
| ラインリーダー | exp_line_leader | Boolean |
| 塗装 | exp_painting | Boolean |

### お弁当

| Access カラム | PostgreSQL カラム |
|--------------|------------------|
| お弁当　昼/夜 | bento_lunch_dinner |
| お弁当　昼のみ | bento_lunch_only |
| お弁当　夜のみ | bento_dinner_only |
| お弁当　持参 | bento_bring_own |

### 通勤

| Access カラム | PostgreSQL カラム |
|--------------|------------------|
| 通勤方法 | commute_method |
| 通勤片道時間 | commute_time_oneway |

### その他

| Access カラム | PostgreSQL カラム |
|--------------|------------------|
| 面接結果OK | interview_result |
| 簡易抗原検査キット | antigen_test_kit |
| 簡易抗原検査実施日 | antigen_test_date |
| コロナワクチン予防接種状態 | covid_vaccine_status |
| 語学スキル有無 | language_skill_exists |
| 緊急連絡先　氏名 | emergency_contact_name |
| 緊急連絡先　続柄 | emergency_contact_relation |
| 緊急連絡先　電話番号 | emergency_contact_phone |
| 専攻 | major |
| 血液型 | blood_type |
| 利き腕 | dominant_hand |
| アレルギー有無 | allergy_exists |
| 安全靴 | safety_shoes |

## 写真処理

### サポートされる形式

1. **ファイルパス** (例: `C:\photos\tanaka.jpg`)
   - ファイルを読み込み、Base64 データ URL に変換
   - サポート形式: JPG, PNG, GIF, BMP

2. **Base64 データ URL** (例: `data:image/jpeg;base64,/9j/4AAQ...`)
   - そのまま保存

3. **空または不明**
   - NULL として処理

### データ URL フォーマット

```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...
```

PostgreSQL の `photo_data_url` カラム（TEXT型）に保存されます。

## 重複チェック

以下の条件で重複を検出:

1. **履歴書ID が一致**
2. **氏名 + 生年月日 が一致**

重複が検出された場合:
- レコードをスキップ
- `skipped_duplicates` カウンタを増やす
- ログに警告を記録

## エラーハンドリング

### エラーが発生した場合

1. エラーをログに記録
2. `errors` カウンタを増やす
3. エラー詳細を `errors` 配列に追加
4. 次のレコードに進む（全体の処理は継続）

### よくあるエラー

| エラー | 原因 | 対処 |
|-------|------|------|
| Invalid date format | 日付フォーマットが不正 | Access データを確認 |
| File not found | 写真ファイルが存在しない | ファイルパスを確認 |
| Duplicate key | 履歴書ID が重複 | 重複を手動確認 |
| Encoding error | 文字エンコーディング問題 | Access データベースの文字コードを確認 |

## トラブルシューティング

### Access データベースに接続できない

**エラー:**
```
pyodbc.Error: ('IM002', '[IM002] [Microsoft][ODBC Driver Manager] ...')
```

**解決策:**
1. Microsoft Access Database Engine をインストール
2. Python のビット版（32/64）と ODBC ドライバーのビット版を一致させる

### PostgreSQL に接続できない

**エラー:**
```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not connect to server
```

**解決策:**
1. Docker コンテナが起動しているか確認:
   ```bash
   docker ps | findstr uns-claudejp-db
   ```
2. ポート 5432 が開いているか確認
3. 接続文字列を確認

### メモリ不足

**症状:**
大量のレコードをインポート中にメモリエラー

**解決策:**
1. バッチサイズを減らす（スクリプト内の `BATCH_SIZE` を 50 に変更）
2. `--limit` オプションを使用して少しずつインポート

## パフォーマンス

### ベンチマーク

- **1,148 レコード**: 約 5-10 分
- **バッチサイズ 100**: 最適
- **写真変換あり**: +2-3 分

### 最適化のヒント

1. サンプルモードで事前確認
2. PostgreSQL インデックスを一時的に無効化（大量インポートの場合）
3. バッチサイズを調整
4. 写真ファイルを事前にコピー

## セキュリティ

### 認証情報

スクリプト内のデータベース認証情報:
- **Access**: 不要（ローカルファイル）
- **PostgreSQL**: ハードコード（`POSTGRES_URL`）

**本番環境では環境変数を使用:**

```python
POSTGRES_URL = os.getenv('DATABASE_URL', 'postgresql://...')
```

### データ保護

- ログファイルに機密情報が含まれる可能性
- レポートファイルを安全な場所に保存
- インポート後、Access データベースをバックアップ

## メンテナンス

### 定期的なタスク

1. **インポート前**:
   - Access データベースをバックアップ
   - PostgreSQL をバックアップ

2. **インポート後**:
   - レコード数を確認
   - データの整合性を検証
   - 不要なレコードを削除

### データ検証クエリ

```sql
-- インポートされた候補者数を確認
SELECT COUNT(*) FROM candidates;

-- 履歴書ID の重複を確認
SELECT rirekisho_id, COUNT(*)
FROM candidates
GROUP BY rirekisho_id
HAVING COUNT(*) > 1;

-- 写真データがあるレコード数
SELECT COUNT(*) FROM candidates WHERE photo_data_url IS NOT NULL;

-- 国籍別の集計
SELECT nationality, COUNT(*)
FROM candidates
GROUP BY nationality
ORDER BY COUNT(*) DESC;
```

## サポート

問題が発生した場合:

1. ログファイルを確認
2. レポートファイルのエラーセクションを確認
3. サンプルモードで再実行
4. データベース管理者に連絡

## 変更履歴

- **2025-10-24**: 初版作成
  - 172 カラムの完全マッピング
  - 写真処理機能
  - 重複チェック
  - バッチインポート
  - 詳細レポート生成

## ライセンス

UNS-ClaudeJP 4.2 プロジェクトの一部
