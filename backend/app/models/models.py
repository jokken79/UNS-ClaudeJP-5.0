"""
SQLAlchemy Models for UNS-ClaudeJP 1.0
"""
from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, Date, Time, Numeric, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.core.database import Base


# ============================================
# ENUMS
# ============================================

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    COORDINATOR = "COORDINATOR"
    KANRININSHA = "KANRININSHA"  # Staff - Office/HR personnel
    EMPLOYEE = "EMPLOYEE"  # 派遣元社員 - Dispatch workers
    CONTRACT_WORKER = "CONTRACT_WORKER"  # 請負 - Contract workers


class CandidateStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    HIRED = "hired"


class DocumentType(str, enum.Enum):
    RIREKISHO = "rirekisho"
    ZAIRYU_CARD = "zairyu_card"
    LICENSE = "license"
    CONTRACT = "contract"
    OTHER = "other"


class RequestType(str, enum.Enum):
    YUKYU = "yukyu"
    HANKYU = "hankyu"
    IKKIKOKOKU = "ikkikokoku"
    TAISHA = "taisha"


class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ShiftType(str, enum.Enum):
    ASA = "asa"  # 朝番
    HIRU = "hiru"  # 昼番
    YORU = "yoru"  # 夜番
    OTHER = "other"


# ============================================
# MODELS
# ============================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole, name='user_role'), nullable=False, default=UserRole.EMPLOYEE)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Candidate(Base):
    """Candidate Table - Complete Resume/CV fields (履歴書/Rirekisho)"""
    __tablename__ = "candidates"

    # Primary Key & IDs
    id = Column(Integer, primary_key=True, index=True)
    rirekisho_id = Column(String(20), unique=True, nullable=False, index=True)  # 履歴書ID

    # 受付日・来日 (Reception & Arrival Dates)
    reception_date = Column(Date)  # 受付日
    arrival_date = Column(Date)  # 来日

    # 基本情報 (Basic Information)
    full_name_kanji = Column(String(100))  # 氏名
    full_name_kana = Column(String(100))  # フリガナ
    full_name_roman = Column(String(100))  # 氏名（ローマ字)
    gender = Column(String(10))  # 性別
    date_of_birth = Column(Date)  # 生年月日
    photo_url = Column(String(255))  # 写真
    photo_data_url = Column(Text)  # Base64データURLの証明写真
    nationality = Column(String(50))  # 国籍
    marital_status = Column(String(20))  # 配偶者
    hire_date = Column(Date)  # 入社日

    # 住所情報 (Address Information)
    postal_code = Column(String(10))  # 郵便番号
    current_address = Column(Text)  # 現住所
    address = Column(Text)  # 住所 (principal)
    address_banchi = Column(String(100))  # 番地
    address_building = Column(String(100))  # 物件名 (Building/apartment name)
    registered_address = Column(Text)  # 登録住所

    # 連絡先 (Contact Information)
    phone = Column(String(20))  # 電話番号
    mobile = Column(String(20))  # 携帯電話

    # パスポート情報 (Passport Information)
    passport_number = Column(String(50))  # パスポート番号
    passport_expiry = Column(Date)  # パスポート期限

    # 在留カード情報 (Residence Card Information)
    residence_status = Column(String(50))  # 在留資格
    residence_expiry = Column(Date)  # （在留カード記載）在留期限
    residence_card_number = Column(String(50))  # 在留カード番号

    # 運転免許情報 (Driver's License Information)
    license_number = Column(String(50))  # 運転免許番号及び条件
    license_expiry = Column(Date)  # 運転免許期限
    car_ownership = Column(String(10))  # 自動車所有
    voluntary_insurance = Column(String(10))  # 任意保険加入

    # 資格・免許 (Qualifications & Licenses)
    forklift_license = Column(String(10))  # ﾌｫｰｸﾘﾌﾄ免許
    tama_kake = Column(String(10))  # 玉掛
    mobile_crane_under_5t = Column(String(10))  # 移動式ｸﾚｰﾝ運転士(5ﾄﾝ未満)
    mobile_crane_over_5t = Column(String(10))  # 移動式ｸﾚｰﾝ運転士(5ﾄﾝ以上)
    gas_welding = Column(String(10))  # ｶﾞｽ溶接作業者

    # 家族構成 (Family Members) - Member 1
    family_name_1 = Column(String(100))  # 家族構成氏名1
    family_relation_1 = Column(String(50))  # 家族構成続柄1
    family_age_1 = Column(Integer)  # 年齢1
    family_residence_1 = Column(String(50))  # 居住1
    family_separate_address_1 = Column(Text)  # 別居住住所1

    # 家族構成 - Member 2
    family_name_2 = Column(String(100))  # 家族構成氏名2
    family_relation_2 = Column(String(50))  # 家族構成続柄2
    family_age_2 = Column(Integer)  # 年齢2
    family_residence_2 = Column(String(50))  # 居住2
    family_separate_address_2 = Column(Text)  # 別居住住所2

    # 家族構成 - Member 3
    family_name_3 = Column(String(100))  # 氏名3
    family_relation_3 = Column(String(50))  # 家族構成続柄3
    family_age_3 = Column(Integer)  # 年齢3
    family_residence_3 = Column(String(50))  # 居住3
    family_separate_address_3 = Column(Text)  # 別居住住所3

    # 家族構成 - Member 4
    family_name_4 = Column(String(100))  # 家族構成氏名4
    family_relation_4 = Column(String(50))  # 家族構成続柄4
    family_age_4 = Column(Integer)  # 年齢4
    family_residence_4 = Column(String(50))  # 居住4
    family_separate_address_4 = Column(Text)  # 別居住住所4

    # 家族構成 - Member 5
    family_name_5 = Column(String(100))  # 家族構成氏名5
    family_relation_5 = Column(String(50))  # 家族構成続柄5
    family_age_5 = Column(Integer)  # 年齢5
    family_residence_5 = Column(String(50))  # 居住5
    family_separate_address_5 = Column(Text)  # 別居住住所5

    # 職歴 (Work History) - Entry 7 (as per your column list)
    work_history_company_7 = Column(String(200))  # 家族構成社社7
    work_history_entry_company_7 = Column(String(200))  # 職歴入社会社名7
    work_history_exit_company_7 = Column(String(200))  # 職歴退社会社名7

    # 経験作業 (Work Experience)
    exp_nc_lathe = Column(Boolean)  # NC旋盤
    exp_lathe = Column(Boolean)  # 旋盤
    exp_press = Column(Boolean)  # ﾌﾟﾚｽ
    exp_forklift = Column(Boolean)  # ﾌｫｰｸﾘﾌﾄ
    exp_packing = Column(Boolean)  # 梱包
    exp_welding = Column(Boolean)  # 溶接
    exp_car_assembly = Column(Boolean)  # 車部品組立
    exp_car_line = Column(Boolean)  # 車部品ライン
    exp_car_inspection = Column(Boolean)  # 車部品検査
    exp_electronic_inspection = Column(Boolean)  # 電子部品検査
    exp_food_processing = Column(Boolean)  # 食品加工
    exp_casting = Column(Boolean)  # 鋳造
    exp_line_leader = Column(Boolean)  # ラインリーダー
    exp_painting = Column(Boolean)  # 塗装
    exp_other = Column(Text)  # その他

    # お弁当 (Lunch/Bento Options)
    bento_lunch_dinner = Column(String(10))  # お弁当　昼/夜
    bento_lunch_only = Column(String(10))  # お弁当　昼のみ
    bento_dinner_only = Column(String(10))  # お弁当　夜のみ
    bento_bring_own = Column(String(10))  # お弁当　持参
    lunch_preference = Column(String(50))  # お弁当（社内食堂）

    # 通勤 (Commute)
    commute_method = Column(String(50))  # 通勤方法
    commute_time_oneway = Column(Integer)  # 通勤片道時間

    # 面接・検査 (Interview & Tests)
    interview_result = Column(String(20))  # 面接結果OK
    antigen_test_kit = Column(String(20))  # 簡易抗原検査キット
    antigen_test_date = Column(Date)  # 簡易抗原検査実施日
    covid_vaccine_status = Column(String(50))  # コロナワクチン予防接種状態

    # 語学スキル (Language Skills)
    language_skill_exists = Column(String(10))  # 語学スキル有無
    language_skill_1 = Column(String(100))  # 語学スキル有無１
    language_skill_2 = Column(String(100))  # 語学スキル有無2

    # 日本語能力 (Japanese Language Ability)
    japanese_qualification = Column(String(50))  # 日本語能力資格
    japanese_level = Column(String(10))  # 日本語能力資格Level
    jlpt_taken = Column(String(10))  # 能力試験受験
    jlpt_date = Column(Date)  # 能力試験受験日付
    jlpt_score = Column(Integer)  # 能力試験受験点数
    jlpt_scheduled = Column(String(10))  # 能力試験受験受験予定

    # 有資格 (Qualifications)
    qualification_1 = Column(String(100))  # 有資格取得
    qualification_2 = Column(String(100))  # 有資格取得1
    qualification_3 = Column(String(100))  # 有資格取得2

    # 学歴 (Education)
    major = Column(String(100))  # 専攻

    # 身体情報 (Physical Information)
    blood_type = Column(String(5))  # 血液型
    dominant_hand = Column(String(10))  # 利き腕
    allergy_exists = Column(String(10))  # アレルギー有無
    glasses = Column(String(100))  # 眼（メガネ、コンタクト使用）

    # 日本語能力詳細 (Japanese Ability Details)
    listening_level = Column(String(20))  # 聞く選択
    speaking_level = Column(String(20))  # 話す選択

    # 緊急連絡先 (Emergency Contact)
    emergency_contact_name = Column(String(100))  # 緊急連絡先　氏名
    emergency_contact_relation = Column(String(50))  # 緊急連絡先　続柄
    emergency_contact_phone = Column(String(20))  # 緊急連絡先　電話番号

    # 作業用品 (Work Equipment)
    safety_shoes = Column(String(10))  # 安全靴

    # 読み書き能力 (Reading & Writing Ability)
    read_katakana = Column(String(20))  # 読む　カナ
    read_hiragana = Column(String(20))  # 読む　ひら
    read_kanji = Column(String(20))  # 読む　漢字
    write_katakana = Column(String(20))  # 書く　カナ
    write_hiragana = Column(String(20))  # 書く　ひら
    write_kanji = Column(String(20))  # 書く　漢字氏名3

    # 会話能力 (Conversation Ability)
    can_speak = Column(String(20))  # 会話ができる
    can_understand = Column(String(20))  # 会話が理解できる
    can_read_kana = Column(String(20))  # ひらがな・カタカナ読める
    can_write_kana = Column(String(20))  # ひらがな・カタカナ書け

    # Legacy fields for compatibility
    email = Column(String(100))
    # phone y address ya están definidos arriba, no duplicar

    ocr_notes = Column(Text)  # OCR処理に関するメモ

    # Status & Audit Fields (usando String en lugar de SQLEnum para evitar problemas de serialización)
    status = Column(String(20), server_default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))

    # Relationships
    documents = relationship("Document", back_populates="candidate", foreign_keys="Document.candidate_id")
    form_submissions = relationship("CandidateForm", back_populates="candidate", cascade="all, delete-orphan")


class CandidateForm(Base):
    """Raw rirekisho form submissions stored as JSON snapshots."""

    __tablename__ = "candidate_forms"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="SET NULL"))
    rirekisho_id = Column(String(20), index=True)
    applicant_id = Column(String(50), index=True)
    form_data = Column(JSON, nullable=False)
    photo_data_url = Column(Text)
    azure_metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    candidate = relationship("Candidate", back_populates="form_submissions")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"))
    document_type = Column(SQLEnum(DocumentType, name='document_type'), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    ocr_data = Column(JSON)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(Integer, ForeignKey("users.id"))

    # Relationships
    candidate = relationship("Candidate", back_populates="documents", foreign_keys=[candidate_id])
    employee = relationship("Employee", back_populates="documents", foreign_keys=[employee_id])


class Factory(Base):
    __tablename__ = "factories"

    id = Column(Integer, primary_key=True, index=True)
    factory_id = Column(String(200), unique=True, nullable=False, index=True)  # Compound: Company__Plant
    company_name = Column(String(100))  # 企業名 - Company name
    plant_name = Column(String(100))    # 工場名 - Plant/Factory name
    name = Column(String(100), nullable=False)
    address = Column(Text)
    phone = Column(String(20))
    contact_person = Column(String(100))
    config = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    employees = relationship("Employee", back_populates="factory")
    contract_workers = relationship("ContractWorker", back_populates="factory")


class Apartment(Base):
    __tablename__ = "apartments"

    id = Column(Integer, primary_key=True, index=True)
    apartment_code = Column(String(50), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    monthly_rent = Column(Integer, nullable=False)
    capacity = Column(Integer)
    is_available = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    employees = relationship("Employee", back_populates="apartment")
    contract_workers = relationship("ContractWorker", back_populates="apartment")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    hakenmoto_id = Column(Integer, unique=True, nullable=False, index=True)
    rirekisho_id = Column(String(20), ForeignKey("candidates.rirekisho_id"))  # Changed from uns_id
    factory_id = Column(String(200), ForeignKey("factories.factory_id"))  # Compound: Company__Plant
    company_name = Column(String(100))  # 企業名 - Company name (denormalized for easy display)
    plant_name = Column(String(100))    # 工場名 - Plant name (denormalized for easy display)
    hakensaki_shain_id = Column(String(50))

    # Personal information
    full_name_kanji = Column(String(100), nullable=False)
    full_name_kana = Column(String(100))
    photo_url = Column(String(255))  # Photo from candidate
    photo_data_url = Column(Text)  # Base64 data URL photo synchronized from candidates
    date_of_birth = Column(Date)
    gender = Column(String(10))
    nationality = Column(String(50))
    zairyu_card_number = Column(String(50))
    zairyu_expire_date = Column(Date)

    # Contact information
    address = Column(Text)
    current_address = Column(String)  # 現住所 - Base address from postal code
    address_banchi = Column(String)  # 番地 - Block/lot number
    address_building = Column(String)  # 物件名 - Building/apartment name
    phone = Column(String(20))
    email = Column(String(100))
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(20))
    emergency_contact_relationship = Column(String(50))

    # Employment information
    hire_date = Column(Date)  # 入社日
    current_hire_date = Column(Date)  # 現入社 - Fecha de entrada a fábrica actual
    jikyu = Column(Integer)  # 時給
    jikyu_revision_date = Column(Date)  # 時給改定 - Fecha de revisión de salario
    position = Column(String(100))
    contract_type = Column(String(50))

    # Assignment information
    assignment_location = Column(String(200))  # 配属先 - Ubicación de asignación
    assignment_line = Column(String(200))  # 配属ライン - Línea de asignación
    job_description = Column(Text)  # 仕事内容 - Descripción del trabajo

    # Financial information
    hourly_rate_charged = Column(Integer)  # 請求単価
    billing_revision_date = Column(Date)  # 請求改定 - Fecha de revisión de facturación
    profit_difference = Column(Integer)    # 差額利益
    standard_compensation = Column(Integer)  # 標準報酬
    health_insurance = Column(Integer)     # 健康保険
    nursing_insurance = Column(Integer)    # 介護保険
    pension_insurance = Column(Integer)    # 厚生年金
    social_insurance_date = Column(Date)   # 社保加入日

    # Visa and documents
    visa_type = Column(String(50))         # ビザ種類
    visa_renewal_alert = Column(Boolean, default=False)  # ビザ更新アラート - Auto-calculado por trigger
    visa_alert_days = Column(Integer, default=30)  # Días antes de alerta de visa
    license_type = Column(String(100))     # 免許種類
    license_expire_date = Column(Date)     # 免許期限
    commute_method = Column(String(50))    # 通勤方法
    optional_insurance_expire = Column(Date)  # 任意保険期限
    japanese_level = Column(String(50))    # 日本語検定
    career_up_5years = Column(Boolean, default=False)  # キャリアアップ5年目
    entry_request_date = Column(Date)      # 入社依頼日
    # photo_url ya está definido arriba, no duplicar
    notes = Column(Text)                   # 備考
    postal_code = Column(String(10))       # 郵便番号

    # Apartment
    apartment_id = Column(Integer, ForeignKey("apartments.id"))
    apartment_start_date = Column(Date)
    apartment_move_out_date = Column(Date) # 退去日
    apartment_rent = Column(Integer)

    # Yukyu (有給休暇)
    yukyu_total = Column(Integer, default=0)
    yukyu_used = Column(Integer, default=0)
    yukyu_remaining = Column(Integer, default=0)

    # Status
    current_status = Column(String(20), default='active')  # 現在: "active", "terminated", "suspended"
    is_active = Column(Boolean, default=True)
    termination_date = Column(Date)
    termination_reason = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    factory = relationship("Factory", back_populates="employees")
    apartment = relationship("Apartment", back_populates="employees")
    documents = relationship("Document", back_populates="employee", foreign_keys="Document.employee_id")
    timer_cards = relationship("TimerCard", back_populates="employee")
    salary_calculations = relationship("SalaryCalculation", back_populates="employee")
    requests = relationship("Request", back_populates="employee")
    contracts = relationship("Contract", back_populates="employee")


class ContractWorker(Base):
    """請負社員 (Ukeoi) - Contract Workers Table"""
    __tablename__ = "contract_workers"

    id = Column(Integer, primary_key=True, index=True)
    hakenmoto_id = Column(Integer, unique=True, nullable=False, index=True)
    rirekisho_id = Column(String(20), ForeignKey("candidates.rirekisho_id"))
    factory_id = Column(String(200), ForeignKey("factories.factory_id"))  # Compound: Company__Plant
    company_name = Column(String(100))  # 企業名 - Company name (denormalized for easy display)
    plant_name = Column(String(100))    # 工場名 - Plant name (denormalized for easy display)
    hakensaki_shain_id = Column(String(50))

    # Personal information
    full_name_kanji = Column(String(100), nullable=False)
    full_name_kana = Column(String(100))
    photo_url = Column(String(255))
    photo_data_url = Column(Text)  # Base64 data URL photo synchronized from candidates
    date_of_birth = Column(Date)
    gender = Column(String(10))
    nationality = Column(String(50))
    zairyu_card_number = Column(String(50))
    zairyu_expire_date = Column(Date)

    # Contact information
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(100))
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(20))
    emergency_contact_relationship = Column(String(50))

    # Employment information
    hire_date = Column(Date)  # 入社日
    current_hire_date = Column(Date)  # 現入社 - Fecha de entrada a fábrica actual
    jikyu = Column(Integer)  # 時給
    jikyu_revision_date = Column(Date)  # 時給改定 - Fecha de revisión de salario
    position = Column(String(100))
    contract_type = Column(String(50))

    # Assignment information
    assignment_location = Column(String(200))  # 配属先 - Ubicación de asignación
    assignment_line = Column(String(200))  # 配属ライン - Línea de asignación
    job_description = Column(Text)  # 仕事内容 - Descripción del trabajo

    # Financial information
    hourly_rate_charged = Column(Integer)  # 請求単価
    billing_revision_date = Column(Date)  # 請求改定 - Fecha de revisión de facturación
    profit_difference = Column(Integer)
    standard_compensation = Column(Integer)
    health_insurance = Column(Integer)
    nursing_insurance = Column(Integer)
    pension_insurance = Column(Integer)
    social_insurance_date = Column(Date)

    # Visa and documents
    visa_type = Column(String(50))
    license_type = Column(String(100))
    license_expire_date = Column(Date)
    commute_method = Column(String(50))
    optional_insurance_expire = Column(Date)
    japanese_level = Column(String(50))
    career_up_5years = Column(Boolean, default=False)
    entry_request_date = Column(Date)
    notes = Column(Text)
    postal_code = Column(String(10))

    # Apartment
    apartment_id = Column(Integer, ForeignKey("apartments.id"))
    apartment_start_date = Column(Date)
    apartment_move_out_date = Column(Date)
    apartment_rent = Column(Integer)

    # Yukyu (有給休暇)
    yukyu_total = Column(Integer, default=0)
    yukyu_used = Column(Integer, default=0)
    yukyu_remaining = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)
    termination_date = Column(Date)
    termination_reason = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    factory = relationship("Factory", back_populates="contract_workers")
    apartment = relationship("Apartment", back_populates="contract_workers")


class Staff(Base):
    """スタッフ (Staff) - Office/HR Personnel Table (Kanrininsha)"""
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, unique=True, nullable=False, index=True)
    rirekisho_id = Column(String(20), ForeignKey("candidates.rirekisho_id"))

    # Personal information
    full_name_kanji = Column(String(100), nullable=False)
    full_name_kana = Column(String(100))
    photo_url = Column(String(255))
    photo_data_url = Column(Text)  # Base64 data URL photo synchronized from candidates
    date_of_birth = Column(Date)
    gender = Column(String(10))
    nationality = Column(String(50))

    # Contact information
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(100))
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(20))
    emergency_contact_relationship = Column(String(50))
    postal_code = Column(String(10))

    # Employment information
    hire_date = Column(Date)
    position = Column(String(100))
    department = Column(String(100))
    monthly_salary = Column(Integer)  # Fixed monthly salary instead of hourly

    # Social insurance
    health_insurance = Column(Integer)
    nursing_insurance = Column(Integer)
    pension_insurance = Column(Integer)
    social_insurance_date = Column(Date)

    # Yukyu (有給休暇)
    yukyu_total = Column(Integer, default=0)
    yukyu_used = Column(Integer, default=0)
    yukyu_remaining = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)
    termination_date = Column(Date)
    termination_reason = Column(Text)
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class TimerCard(Base):
    __tablename__ = "timer_cards"

    id = Column(Integer, primary_key=True, index=True)
    hakenmoto_id = Column(Integer, ForeignKey("employees.hakenmoto_id", ondelete="CASCADE"), nullable=True)
    employee_id = Column(Integer, nullable=True)  # For easier querying
    factory_id = Column(String(20), nullable=True)  # For easier querying
    work_date = Column(Date, nullable=False)

    # Shift type
    shift_type = Column(SQLEnum(ShiftType, name='shift_type'))

    # Schedules
    clock_in = Column(Time)
    clock_out = Column(Time)
    break_minutes = Column(Integer, default=0)
    overtime_minutes = Column(Integer, default=0)

    # Calculated hours
    regular_hours = Column(Numeric(5, 2), default=0)
    overtime_hours = Column(Numeric(5, 2), default=0)
    night_hours = Column(Numeric(5, 2), default=0)
    holiday_hours = Column(Numeric(5, 2), default=0)

    # Notes and approval
    notes = Column(Text)
    is_approved = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", foreign_keys=[hakenmoto_id], back_populates="timer_cards")
    approver = relationship("User", foreign_keys=[approved_by])


class SalaryCalculation(Base):
    __tablename__ = "salary_calculations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    # Hours
    total_regular_hours = Column(Numeric(5, 2))
    total_overtime_hours = Column(Numeric(5, 2))
    total_night_hours = Column(Numeric(5, 2))
    total_holiday_hours = Column(Numeric(5, 2))

    # Payments
    base_salary = Column(Integer)
    overtime_pay = Column(Integer)
    night_pay = Column(Integer)
    holiday_pay = Column(Integer)
    bonus = Column(Integer, default=0)
    gasoline_allowance = Column(Integer, default=0)

    # Deductions
    apartment_deduction = Column(Integer, default=0)
    other_deductions = Column(Integer, default=0)

    # Total
    gross_salary = Column(Integer)
    net_salary = Column(Integer)

    # Company profit
    factory_payment = Column(Integer)  # 時給単価 total
    company_profit = Column(Integer)

    is_paid = Column(Boolean, default=False)
    paid_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    employee = relationship("Employee", back_populates="salary_calculations")


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    hakenmoto_id = Column(Integer, ForeignKey("employees.hakenmoto_id", ondelete="CASCADE"), nullable=False)
    request_type = Column(SQLEnum(RequestType, name='request_type'), nullable=False)
    status = Column(SQLEnum(RequestStatus, name='request_status'), default=RequestStatus.PENDING)

    # Dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    # Note: total_days is computed from start_date and end_date, not stored in DB

    # Details
    reason = Column(Text)
    notes = Column(Text)

    # Approval
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", foreign_keys=[hakenmoto_id], back_populates="requests")

    @property
    def total_days(self):
        """Computed property: calculate total days from start_date and end_date"""
        if self.start_date and self.end_date:
            delta = self.end_date - self.start_date
            return float(delta.days + 1)
        return None

    @hybrid_property
    def employee_id(self):
        """Backwards compatibility: return employee.id if relationship is loaded"""
        if self.employee:
            return self.employee.id
        return None


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    contract_type = Column(String(50), nullable=False)
    contract_number = Column(String(50), unique=True)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date)

    pdf_path = Column(String(500))
    signed = Column(Boolean, default=False)
    signed_at = Column(DateTime(timezone=True))
    signature_data = Column(Text)  # Base64 signature

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    employee = relationship("Employee", back_populates="contracts")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    table_name = Column(String(50))
    record_id = Column(Integer)
    old_values = Column(JSON)
    new_values = Column(JSON)
    ip_address = Column(String(50))
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SocialInsuranceRate(Base):
    """
    Tabla de tarifas de seguros sociales (健康保険・厚生年金)
    Basada en la hoja '愛知23' del Excel
    """
    __tablename__ = "social_insurance_rates"

    id = Column(Integer, primary_key=True, index=True)

    # Rango de compensación estándar (標準報酬月額)
    min_compensation = Column(Integer, nullable=False)  # Mínimo del rango
    max_compensation = Column(Integer, nullable=False)  # Máximo del rango
    standard_compensation = Column(Integer, nullable=False)  # 標準報酬月額

    # Seguros (金額 completa, se divide entre empleado y empleador)
    health_insurance_total = Column(Integer)  # 健康保険料 (total)
    health_insurance_employee = Column(Integer)  # 健康保険料 (empleado)
    health_insurance_employer = Column(Integer)  # 健康保険料 (empleador)

    nursing_insurance_total = Column(Integer)  # 介護保険料 (total, solo >40 años)
    nursing_insurance_employee = Column(Integer)  # 介護保険料 (empleado)
    nursing_insurance_employer = Column(Integer)  # 介護保険料 (empleador)

    pension_insurance_total = Column(Integer)  # 厚生年金保険料 (total)
    pension_insurance_employee = Column(Integer)  # 厚生年金保険料 (empleado)
    pension_insurance_employer = Column(Integer)  # 厚生年金保険料 (empleador)

    # Metadata
    effective_date = Column(Date, nullable=False)  # Fecha de vigencia
    prefecture = Column(String(20), default='愛知')  # Prefectura
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SystemSettings(Base):
    """
    System-wide configuration settings
    Used for admin-controlled toggles like content visibility
    """
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(String(255))
    description = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
