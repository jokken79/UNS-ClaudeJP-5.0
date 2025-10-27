# 🚀 クイックスタート - Access候補者インポート

## 3ステップで完了！

### ステップ 1: 接続テスト（30秒）

```bash
cd D:\JPUNS-CLAUDE4.2\UNS-ClaudeJP-4.2\backend
python scripts\test_access_connection.py
```

**期待される出力:**
```
✓ Connection successful!
Total records: 1148
Total columns: 172
```

---

### ステップ 2: サンプル確認（1分）

```bash
python scripts\import_access_candidates.py --sample
```

**確認項目:**
- [ ] 5件のサンプルレコードが表示される
- [ ] フィールドマッピングが正しい
- [ ] 写真データが処理される

---

### ステップ 3: インポート実行（5-10分）

#### オプション A: テストインポート（最初の10件のみ）

```bash
python scripts\import_access_candidates.py --limit 10
```

#### オプション B: 全件インポート（1,148件）

```bash
python scripts\import_access_candidates.py --full
```

---

## 📊 実行後の確認

### PostgreSQL で確認

```bash
# Docker コンテナに接続
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp
```

```sql
-- インポート件数確認
SELECT COUNT(*) FROM candidates;

-- サンプルデータ確認
SELECT rirekisho_id, full_name_kanji, nationality, date_of_birth
FROM candidates
ORDER BY id DESC
LIMIT 5;

-- 終了
\q
```

---

## 📁 生成されるファイル

1. **`import_candidates_YYYYMMDD_HHMMSS.log`**
   - 全処理ログ

2. **`import_candidates_report.json`**
   - 統計情報とエラー詳細

---

## ⚠️ トラブルシューティング

### Access に接続できない

```
エラー: [IM002] [Microsoft][ODBC Driver Manager] データ ソース名および指定された既定のドライバーが見つかりません
```

**解決策:**
1. [Microsoft Access Database Engine 2016](https://www.microsoft.com/en-us/download/details.aspx?id=54920) をインストール
2. Python のビット版と ODBC ドライバーのビット版を一致させる

### PostgreSQL に接続できない

```
エラー: could not connect to server
```

**解決策:**
```bash
# Docker コンテナが起動しているか確認
docker ps | findstr uns-claudejp-db

# 起動していない場合
cd D:\JPUNS-CLAUDE4.2\UNS-ClaudeJP-4.2
scripts\START.bat
```

---

## 📚 詳細情報

完全なドキュメント:
- **使用ガイド**: `backend/scripts/README_IMPORT_ACCESS_CANDIDATES.md`
- **実装報告**: `docs/IMPLEMENTATION_ACCESS_IMPORT.md`

---

## ✅ 成功の確認

インポート成功時の出力:

```
================================================================================
Import Summary:
================================================================================
Total records in Access: 1148
Records processed: 1148
Records inserted: 1120
Skipped (duplicates): 25
Errors: 3

Photo Statistics:
  File paths: 800
  Base64: 50
  Empty: 298

✓ Import completed!
```

**これで完了です！** 🎉
