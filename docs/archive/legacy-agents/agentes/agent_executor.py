#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ejecutor de Agentes - UNS-CLAUDEJP
Sistema para ejecutar agentes definidos en el catálogo
"""

import os
import sys
import yaml
import subprocess
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

class AgentExecutor:
    """Clase principal para ejecución de agentes"""
    
    def __init__(self, catalog_path: str = "agents_catalog.yaml"):
        """Inicializar el ejecutor de agentes"""
        self.catalog_path = Path(catalog_path)
        self.catalog = self._load_catalog()
        self.logs_dir = Path("../logs/agents")
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
    def _load_catalog(self) -> Dict[str, Any]:
        """Cargar el catálogo de agentes"""
        try:
            with open(self.catalog_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            print(f"❌ Error: No se encuentra el archivo {self.catalog_path}")
            sys.exit(1)
        except yaml.YAMLError as e:
            print(f"❌ Error al leer el catálogo YAML: {e}")
            sys.exit(1)
    
    def _log_execution(self, agent_id: str, action: str, details: str = ""):
        """Registrar ejecución en log"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {agent_id}: {action}"
        if details:
            log_entry += f" - {details}"
        
        log_file = self.logs_dir / f"agent_execution_{datetime.now().strftime('%Y%m%d')}.log"
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry + "\n")
        
        print(log_entry)
    
    def _check_requirements(self, agent: Dict[str, Any]) -> bool:
        """Verificar requisitos del agente"""
        requirements = agent.get('requirements', [])
        
        for req in requirements:
            if "Docker" in req:
                try:
                    result = subprocess.run(['docker', '--version'], 
                                          capture_output=True, text=True)
                    if result.returncode != 0:
                        print(f"❌ Requisito no cumplido: {req}")
                        return False
                except FileNotFoundError:
                    print(f"❌ Requisito no cumplido: {req}")
                    return False
            
            elif "Windows OS" in req:
                if os.name != 'nt':
                    print(f"❌ Requisito no cumplido: {req}")
                    return False
        
        return True
    
    def _execute_batch_script(self, script_path: str) -> bool:
        """Ejecutar script batch de Windows"""
        try:
            # Convertir ruta relativa a absoluta
            if not os.path.isabs(script_path):
                script_path = os.path.abspath(script_path)
            
            print(f"🚀 Ejecutando: {script_path}")
            
            # Ejecutar el script
            result = subprocess.run([script_path], 
                                  shell=True,
                                  capture_output=False,
                                  text=True)
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"❌ Error al ejecutar script: {e}")
            return False
    
    def list_agents(self, category: Optional[str] = None):
        """Listar agentes disponibles"""
        print("\n📋 Catálogo de Agentes Disponibles")
        print("=" * 50)
        
        categories = self.catalog.get('maintenance_agents', []) + \
                     self.catalog.get('system_agents', []) + \
                     self.catalog.get('development_agents', []) + \
                     self.catalog.get('version_control_agents', []) + \
                     self.catalog.get('backup_agents', []) + \
                     self.catalog.get('utility_agents', [])
        
        for agent in categories:
            if category and agent.get('category') != category:
                continue
                
            status = "✅ Activo" if not agent.get('deprecated') else "⚠️ Deprecado"
            print(f"\n🤖 {agent['name']}")
            print(f"   ID: {agent['id']}")
            print(f"   Descripción: {agent['description']}")
            print(f"   Categoría: {agent['category']}")
            print(f"   Tags: {', '.join(agent['tags'])}")
            print(f"   Estado: {status}")
            print(f"   Script: {agent['script_path']}")
    
    def execute_agent(self, agent_id: str) -> bool:
        """Ejecutar un agente específico"""
        # Buscar el agente en todas las categorías
        agent = None
        categories = ['maintenance_agents', 'system_agents', 'development_agents',
                     'version_control_agents', 'backup_agents', 'utility_agents']
        
        for cat in categories:
            for a in self.catalog.get(cat, []):
                if a['id'] == agent_id:
                    agent = a
                    break
            if agent:
                break
        
        if not agent:
            print(f"❌ Agente '{agent_id}' no encontrado")
            return False
        
        # Verificar si está deprecado
        if agent.get('deprecated'):
            print(f"⚠️ Advertencia: El agente '{agent['name']}' está deprecado")
            confirm = input("¿Desea continuar? (S/N): ")
            if confirm.lower() != 's':
                return False
        
        # Verificar requisitos
        print(f"\n🔍 Verificando requisitos para '{agent['name']}'...")
        if not self._check_requirements(agent):
            print("❌ Requisitos no cumplidos. No se puede ejecutar el agente.")
            return False
        
        # Verificar privilegios de administrador si es necesario
        admin_required = agent_id in self.catalog.get('security_policies', {}).get('admin_privileges_required', [])
        if admin_required:
            print("⚠️ Este agente requiere privilegios de administrador")
            confirm = input("¿Tiene privilegios de administrador? (S/N): ")
            if confirm.lower() != 's':
                return False
        
        # Confirmar ejecución
        if self.catalog.get('security_policies', {}).get('require_confirmation', True):
            confirm = input(f"¿Ejecutar agente '{agent['name']}'? (S/N): ")
            if confirm.lower() != 's':
                return False
        
        # Ejecutar el agente
        self._log_execution(agent_id, "INICIO", f"Ejecutando {agent['name']}")
        
        script_path = agent['script_path']
        if not os.path.exists(script_path):
            self._log_execution(agent_id, "ERROR", f"Script no encontrado: {script_path}")
            print(f"❌ Error: No se encuentra el script {script_path}")
            return False
        
        success = self._execute_batch_script(script_path)
        
        if success:
            self._log_execution(agent_id, "EXITO", "Agente ejecutado correctamente")
            print(f"✅ Agente '{agent['name']}' ejecutado exitosamente")
        else:
            self._log_execution(agent_id, "ERROR", "Error en la ejecución del agente")
            print(f"❌ Error al ejecutar el agente '{agent['name']}'")
        
        return success
    
    def show_agent_details(self, agent_id: str):
        """Mostrar detalles de un agente específico"""
        # Buscar el agente
        agent = None
        categories = ['maintenance_agents', 'system_agents', 'development_agents',
                     'version_control_agents', 'backup_agents', 'utility_agents']
        
        for cat in categories:
            for a in self.catalog.get(cat, []):
                if a['id'] == agent_id:
                    agent = a
                    break
            if agent:
                break
        
        if not agent:
            print(f"❌ Agente '{agent_id}' no encontrado")
            return
        
        print(f"\n🤖 Detalles del Agente")
        print("=" * 40)
        print(f"Nombre: {agent['name']}")
        print(f"ID: {agent['id']}")
        print(f"Descripción: {agent['description']}")
        print(f"Categoría: {agent['category']}")
        print(f"Tags: {', '.join(agent['tags'])}")
        print(f"Script: {agent['script_path']}")
        print(f"Modo de ejecución: {agent['execution_mode']}")
        print(f"Nivel de seguridad: {agent['safety_level']}")
        
        if agent.get('deprecated'):
            print("⚠️ ESTE AGENTE ESTÁ DEPRECADO")
        
        print(f"\n📋 Requisitos:")
        for req in agent.get('requirements', []):
            print(f"  • {req}")
        
        print(f"\n🔧 Capacidades:")
        for cap in agent.get('capabilities', []):
            print(f"  • {cap}")

def main():
    """Función principal"""
    executor = AgentExecutor()
    
    if len(sys.argv) < 2:
        print("🤖 Ejecutor de Agentes - UNS-CLAUDEJP")
        print("=" * 40)
        print("Uso:")
        print("  python agent_executor.py list [categoría]")
        print("  python agent_executor.py execute <agent_id>")
        print("  python agent_executor.py details <agent_id>")
        print("\nCategorías disponibles:")
        print("  maintenance, development, backup, diagnostic, optimization")
        return
    
    command = sys.argv[1].lower()
    
    if command == "list":
        category = sys.argv[2] if len(sys.argv) > 2 else None
        executor.list_agents(category)
    
    elif command == "execute":
        if len(sys.argv) < 3:
            print("❌ Error: Debe especificar el ID del agente")
            return
        agent_id = sys.argv[2]
        executor.execute_agent(agent_id)
    
    elif command == "details":
        if len(sys.argv) < 3:
            print("❌ Error: Debe especificar el ID del agente")
            return
        agent_id = sys.argv[2]
        executor.show_agent_details(agent_id)
    
    else:
        print(f"❌ Comando desconocido: {command}")

if __name__ == "__main__":
    main()