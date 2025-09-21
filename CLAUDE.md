# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` - Starts both Vite dev server (port 1420) and Tauri dev environment
- **Build**: `pnpm build` - Compiles TypeScript and builds the production bundle
- **Preview**: `pnpm preview` - Serves the production build locally
- **Tauri commands**: `pnpm tauri [command]` - Run Tauri-specific commands (build, dev, etc.)

## Architecture Overview

This is a **Tauri-based desktop application** for AI-powered image editing, built with React + TypeScript + Vite frontend.

### Core Structure

- **Frontend**: React 19 with TypeScript, using Vite as build tool
- **Backend**: Rust-based Tauri backend for native desktop functionality
- **State Management**: Zustand stores for different app modules
- **Routing**: React Router DOM with nested route structure
- **UI**: Radix UI components with TailwindCSS styling
- **Database**: Tauri's invoke API for Rust backend data operations

### Key Directories

- `src/pages/` - Main application pages (Editor, Gallery, Styles, Settings)
- `src/components/` - Reusable React components including UI components
- `src/store/` - Zustand state management stores by feature
- `src/utils/` - Utilities including AI API integration and database layer
- `src/types/` - TypeScript type definitions
- `src-tauri/` - Rust backend code and Tauri configuration

### State Management Architecture

The app uses feature-based Zustand stores:
- `conversation.ts` - Manages AI conversations, messages, and token usage tracking
- `editor.ts` - Image editing state and operations
- `gallery.ts` - Image history and gallery management  
- `settings.ts` - Application settings and configuration

### Data Flow

1. **Image Processing**: Upload → Editor → AI API → Gallery storage
2. **Conversations**: Message creation → Token tracking → Database persistence
3. **Database Layer**: Frontend calls → Tauri invoke → Rust backend → SQLite

### AI Integration

- Supports multiple models (GPT-4, Claude, etc.) with token cost calculation
- Conversation system with message history and token usage tracking
- Configurable model settings and API endpoints via Settings page

### Tauri Configuration

- **Window size**: 1280x768 default
- **Dev URL**: http://localhost:1420 (fixed port)
- **Build commands**: Automatically runs `pnpm build` before bundling
- **Rust backend**: Handles database operations, file system access, and native APIs

## Development Notes

- Uses `@` alias for `src/` directory imports
- Vite HMR configured for Tauri development
- TypeScript strict mode enabled
- Component library uses Radix UI primitives with custom styling