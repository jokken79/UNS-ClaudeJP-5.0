"""
Modelo adicional para SocialInsuranceRate
Este código debe agregarse al final de app/models/models.py
"""

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
    prefecture = Column(String(20), default='愛知')  # Prefectura (愛知, 東京, etc.)
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
