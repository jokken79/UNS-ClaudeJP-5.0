# Agent & Configuration Systems Clarification

## Overview
This project has multiple agent and configuration systems that serve different purposes. This document clarifies each one.

## Systems

### 1. `.claude/` - Claude Code Agent Orchestration
**Purpose**: Main orchestration system for Claude Code IDE
**Location**: `.claude/`
**Key Files**:
- `CLAUDE.md` - Orchestrator instructions (YOU ARE THE ORCHESTRATOR)
- `agents/coder.md` - Implementation specialist
- `agents/research.md` - Documentation fetcher (Jina AI)
- `agents/stuck.md` - Human escalation agent
- `agents/tester.md` - Playwright visual testing
- `settings.local.json` - Claude Code IDE settings

**Status**: ✅ ACTIVE - Primary system used by Claude Code

### 2. `agentes/` - Batch Script Automation Catalog
**Purpose**: Catalog of Windows batch script automation agents
**Location**: `agentes/`
**Key Files**:
- `agents_catalog.yaml` - Comprehensive catalog of maintenance/system agents
- `README.md` - Documentation

**Agents Categories**:
- Maintenance: cache_cleaner_basic, cache_cleaner_full
- System: system_starter, system_stopper, system_diagnostic
- Development: project_initializer, project_installer
- Version Control: git_pull, git_push
- Backup: data_backup, data_restore
- Utility: log_viewer, clean_general

**Status**: ✅ ACTIVE - Used for automation scripts (START.bat, STOP.bat, etc.)

### 3. `openspec/` - Change Proposal System
**Purpose**: Formal specification and change management system
**Location**: `openspec/`
**Key Files**:
- `AGENTS.md` - OpenSpec agent instructions
- `project.md` - Project specification

**Status**: ⚠️ EXPERIMENTAL - Used for planning major changes via `/openspec:*` slash commands

### 4. `.specify/` - Unknown Purpose
**Purpose**: Unknown/Legacy
**Location**: `.specify/`
**Status**: ❓ NEEDS INVESTIGATION - May be legacy or experimental

### 5. `subagentes/` - Unknown Purpose
**Purpose**: Unknown/Legacy
**Location**: `subagentes/`
**Status**: ❓ NEEDS INVESTIGATION - May be legacy or experimental

## Recommendations

### Active Systems (Keep)
1. **`.claude/`** - Primary orchestration for Claude Code IDE
2. **`agentes/`** - Batch script automation catalog (Windows)
3. **`openspec/`** - Change proposal system (if used)

### Needs Investigation
1. **`.specify/`** - Check if actively used or can be archived
2. **`subagentes/`** - Check if actively used or can be archived

## Usage Guidelines

### When to Use Each System

**`.claude/` agents** (via Task tool):
- When implementing code (invoke coder agent)
- When testing implementations (invoke tester agent)
- When researching new tech (invoke research agent)
- When stuck on errors (invoke stuck agent)

**`agentes/` catalog**:
- Reference for available batch scripts
- Understanding what automation is available
- System maintenance tasks (START.bat, STOP.bat, etc.)

**`openspec/` system**:
- Planning major architectural changes
- Formal specification documents
- Use slash commands: `/openspec:proposal`, `/openspec:apply`

## Notes
- The `.claude/` system is the main orchestration layer
- The `agentes/` catalog is for Windows batch automation
- The `openspec/` system is for formal change management
- `.specify/` and `subagentes/` need investigation

---
*Document created: 2025-10-25*
*Last updated: 2025-10-25*
