# Siwel Beats App

## Overview

Siwel Beats is a backend-driven web application for a music producer to showcase, stream, and sell beats. The platform allows users to browse tracks, stream preview audio, and purchase licenses for beats.

This repository contains both backend and frontend code (frontend in progress).

## Project Structure

- backend/ → Node.js API and core business logic
- frontend/ → React frontend (in progress)

## Backend Overview

The backend powers all core functionality including authentication, track management, file handling, and order processing.

### Tech Stack

- Node.js / Express (TypeScript)
- MongoDB (Mongoose)
- Supabase (file storage: audio, images, documents)
- Redis + BullMQ (queues & background jobs)
- Joi (validation)

## Core Backend Features

### Authentication

- Email/password signup and login
- Google OAuth
- Email verification
- Password reset
- Refresh token handling

---

### Track Management

- Upload beats with:
  - Audio files (stream version and downloadable version)
  - Cover images
  - License documents

- Admin-controlled publishing
- Track interactions (comments, likes)

---

### Streaming

- Stream preview
- Full audio available after purchase

---

### User Features

- Add tracks to favorites
- Cart system
- Order history
- Purchase tracking

---

### Orders & Checkout

- Order creation logic implemented
- Payment integration planned

---

### File Storage

- Supabase integration for:
  - Audio files
  - Images
  - Documents

- Custom service layer for uploads and retrieval

---

### Background Jobs

- Queue system using BullMQ
- Handles email sending and async tasks

---

### Data Integrity & Security

- Joi validation
- Input sanitization (XSS protection)
- Indexed schemas
- Unique constraints
- Race condition handling in user creation

---

### API Documentation

Link: [Postman Documentation](https://documenter.getpostman.com/view/44782397/2sBXqJJKoD)

---

## Current Project Status

- Backend: actively in development
- Frontend: not yet implemented
- Payments: planned
