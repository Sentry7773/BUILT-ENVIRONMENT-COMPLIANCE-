import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  CheckCircle2, 
  Database, 
  Server, 
  X, 
  Code2, 
  Layers, 
  Cpu, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  Key, 
  Phone, 
  AlertCircle, 
  LogOut, 
  Clock, 
  HardHat, 
  Briefcase,
  FileCheck
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface AccountAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated?: (account: any) => void;
}

export type BackendStackId = 
  | 'node_express_mongodb'
  | 'node_express_mysql'
  | 'php_mysql'
  | 'python_flask_django'
  | 'firebase_auth'
  | 'supabase_auth';

interface StackInfo {
  id: BackendStackId;
  name: string;
  badge: string;
  description: string;
  runtime: string;
  database: string;
  driver: string;
  codeSnippet: string;
  schemaSnippet: string;
}

const BACKEND_STACKS: StackInfo[] = [
  {
    id: 'node_express_mongodb',
    name: 'Node.js + Express + MongoDB',
    badge: 'MERN / NoSQL Document',
    description: 'High-concurrency JavaScript/TypeScript microservices storing flexible JSON documents with Mongoose ODM.',
    runtime: 'Node.js v20+ / Express 4.x',
    database: 'MongoDB Atlas / Community 7.0 (BSON)',
    driver: 'mongoose ^8.0 / mongodb ^6.0',
    codeSnippet: `// server.js (Node.js + Express + MongoDB)
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

// User Document Schema
const UserSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['CLIENT','ARCHITECT','ENGINEER','CONTRACTOR','COUNCIL_OFFICER','INSPECTOR','ZIA_ADMIN','STUDENT'], default: 'CLIENT' },
  status: { type: String, enum: ['PENDING_VERIFICATION','ACTIVE','SUSPENDED','LOCKED'], default: 'PENDING_VERIFICATION' },
  zia_membership: String,
  eiz_membership: String,
  pacra_entity_id: String,
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, phone, password, role, zia_membership } = req.body;
  const password_hash = await bcrypt.hash(password, 12);
  const user = new User({ full_name, email, phone, password_hash, role, zia_membership });
  await user.save();
  res.status(201).json({ message: 'Account created. Verify OTP to activate.', user_id: user._id });
});`,
    schemaSnippet: `// MongoDB Collection: "users"
{
  "_id": ObjectId("6701f82b7d5e492b4a112001"),
  "full_name": "MARY BANDA",
  "phone": "0977123456",
  "email": "mary@banda-architects.co.zm",
  "role": "ARCHITECT",
  "status": "ACTIVE",
  "zia_membership": "ZIA-ARCH-00991",
  "email_verified_at": ISODate("2026-10-06T01:00:00Z"),
  "created_at": ISODate("2026-10-06T01:00:00Z")
}`
  },
  {
    id: 'node_express_mysql',
    name: 'Node.js + Express + MySQL',
    badge: 'Relational ACID / SQL',
    description: 'Enterprise relational persistence using MySQL/MariaDB with connection pooling, transactions, and foreign key integrity.',
    runtime: 'Node.js v20+ / Express 4.x',
    database: 'MySQL 8.4 Enterprise / MariaDB 11.2',
    driver: 'mysql2/promise ^3.9 / Prisma / Sequelize',
    codeSnippet: `// server.js (Node.js + Express + MySQL)
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({ host: process.env.DB_HOST, database: 'zape_db' });
const app = express();
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, phone, password, role, zia_membership } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    \`INSERT INTO users (full_name, email, phone, password_hash, role, zia_membership, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'PENDING_VERIFICATION', NOW())\`,
    [full_name, email || null, phone || null, hash, role, zia_membership || null]
  );
  res.status(201).json({ user_id: result.insertId });
});`,
    schemaSnippet: `-- MySQL Table Schema: users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NULL UNIQUE,
  phone VARCHAR(50) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('CLIENT','ARCHITECT','ENGINEER','CONTRACTOR','COUNCIL_OFFICER','INSPECTOR','ZIA_ADMIN','STUDENT') DEFAULT 'CLIENT',
  status ENUM('PENDING_VERIFICATION','ACTIVE','SUSPENDED','LOCKED') DEFAULT 'PENDING_VERIFICATION',
  zia_membership VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    id: 'php_mysql',
    name: 'PHP + MySQL',
    badge: 'LAMP Stack / Proven Standard',
    description: 'Traditional server-side LAMP architecture with PHP PDO prepared statements, session governance, and native password hashing.',
    runtime: 'PHP 8.3 + Apache / Nginx PHP-FPM',
    database: 'MySQL 8.0 / Percona Server',
    driver: 'PDO_MYSQL extension',
    codeSnippet: `<?php
// register.php (PHP PDO)
header('Content-Type: application/json');
$pdo = new PDO("mysql:host=localhost;dbname=zape_db", "user", "pass");
$data = json_decode(file_get_contents('php://input'), true);

$hash = password_hash($data['password'], PASSWORD_BCRYPT);
$stmt = $pdo->prepare("
  INSERT INTO users (full_name, email, phone, password_hash, role, status, created_at)
  VALUES (?, ?, ?, ?, ?, 'PENDING_VERIFICATION', NOW())
");
$stmt->execute([$data['full_name'], $data['email'] ?? null, $data['phone'] ?? null, $hash, $data['role'] ?? 'CLIENT']);
echo json_encode(["status" => "success", "userId" => $pdo->lastInsertId()]);
?>`,
    schemaSnippet: `-- MySQL Schema for PHP
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE,
  phone VARCHAR(40) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) DEFAULT 'CLIENT',
  status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION',
  created_at DATETIME NOT NULL
);`
  },
  {
    id: 'python_flask_django',
    name: 'Python + Flask/Django',
    badge: 'Python WSGI / FastAPI / Django ORM',
    description: 'Clean backend architecture powered by Python with SQLAlchemy / Django Models, Passlib hashing, and REST API serializers.',
    runtime: 'Python 3.12 / Flask 3.x or Django 5.x',
    database: 'PostgreSQL 16 / SQLite / MySQL',
    driver: 'SQLAlchemy / psycopg3 / Django ORM',
    codeSnippet: `# app.py (Python Flask + SQLAlchemy)
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

app = Flask(__name__)
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True)
    phone = db.Column(db.String(50), unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='CLIENT')
    status = db.Column(db.String(50), default='PENDING_VERIFICATION')

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    u = User(
        full_name=data['full_name'],
        email=data.get('email'),
        phone=data.get('phone'),
        password_hash=generate_password_hash(data['password']),
        role=data.get('role', 'CLIENT')
    )
    db.session.add(u)
    db.session.commit()
    return jsonify({"success": True, "id": u.id}), 201`,
    schemaSnippet: `# Django models.py
class ZapeUser(models.Model):
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, null=True)
    phone = models.CharField(max_length=30, unique=True, null=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=40, default='CLIENT')
    status = models.CharField(max_length=40, default='PENDING_VERIFICATION')`
  },
  {
    id: 'firebase_auth',
    name: 'Firebase Authentication',
    badge: 'BaaS / Google Cloud Identity',
    description: 'Serverless Identity Platform with SDK-managed credential tokens, phone SMS, multi-factor auth, and Firestore rules.',
    runtime: 'Client SDK / Firebase Admin Node.js SDK',
    database: 'Google Cloud Firestore / Identity Platform',
    driver: 'firebase/auth ^10.x / firebase-admin ^12.x',
    codeSnippet: `// firebaseAuth.js (Firebase Auth + Firestore)
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

export async function registerUser({ full_name, email, password, role, phone }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    full_name,
    email,
    phone,
    role,
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  });
  return cred.user;
}`,
    schemaSnippet: `// Firestore Document: /users/{userId}
{
  "uid": "ABcd1234XYZqwe9876",
  "full_name": "MARY BANDA",
  "email": "mary@banda-architects.co.zm",
  "phone": "0977123456",
  "role": "ARCHITECT",
  "status": "ACTIVE"
}`
  },
  {
    id: 'supabase_auth',
    name: 'Supabase Authentication',
    badge: 'BaaS / PostgreSQL with Row-Level Security',
    description: 'Open-source Firebase alternative with built-in GoTrue auth, JWT tokens, PostgreSQL database, and granular RLS policies.',
    runtime: 'GoTrue Auth Microservice + PostgreSQL 15',
    database: 'Supabase PostgreSQL (ACID)',
    driver: '@supabase/supabase-js ^2.40',
    codeSnippet: `// supabaseAuth.js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function createSupabaseAccount({ full_name, email, password, role, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role, phone } }
  });
  if (error) throw error;
  return data.user;
}`,
    schemaSnippet: `-- Supabase PostgreSQL Schema with RLS
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'CLIENT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`
  }
];

export const AccountAuthModal: React.FC<AccountAuthModalProps> = ({
  isOpen,
  onClose,
  onAccountCreated
}) => {
  const [modalTab, setModalTab] = useState<'auth' | 'session' | 'backend_stacks' | 'database_records'>('auth');
  const [selectedStack, setSelectedStack] = useState<BackendStackId>('node_express_mongodb');
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'reset_password'>('register');
  const [registerStep, setRegisterStep] = useState<'details' | 'otp'>('details');
  
  // Registration Form Fields (Matching Section 4 of Brief)
  const [fullName, setFullName] = useState('MARY BANDA');
  const [phone, setPhone] = useState('0977123456');
  const [email, setEmail] = useState('mary@banda-architects.co.zm');
  const [password, setPassword] = useState('Zambia@2026');
  const [role, setRole] = useState<'CLIENT' | 'ARCHITECT' | 'ENGINEER' | 'CONTRACTOR' | 'COUNCIL_OFFICER' | 'INSPECTOR' | 'ZIA_ADMIN' | 'STUDENT'>('ARCHITECT');
  const [ziaMembership, setZiaMembership] = useState('ZIA-ARCH-00991');
  const [eizMembership, setEizMembership] = useState('');
  const [pacraEntityId, setPacraEntityId] = useState('120000/2021');

  // OTP Fields
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  // Login Form Fields
  const [loginIdentifier, setLoginIdentifier] = useState('0977123456');
  const [loginPassword, setLoginPassword] = useState('Zambia@2026');

  // Password Reset Fields
  const [resetIdentifier, setResetIdentifier] = useState('0977123456');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('Zambia@2027');
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');

  // Authenticated Session State
  const [currentAccessToken, setCurrentAccessToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('zape_access_token') : null;
  });
  const [currentProfile, setCurrentProfile] = useState<any | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Telemetry from backend
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [recentOtps, setRecentOtps] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUsersAndOtps();
      if (currentAccessToken) {
        fetchCurrentProfile(currentAccessToken);
      }
    }
  }, [isOpen, currentAccessToken]);

  const fetchUsersAndOtps = async () => {
    try {
      const [uRes, oRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/auth/otps')
      ]);
      if (uRes.ok) {
        const uData = await uRes.json();
        setRegisteredUsers(uData.users || []);
      }
      if (oRes.ok) {
        const oData = await oRes.json();
        setRecentOtps(oData.otps || []);
      }
    } catch (e) {
      // offline
    }
  };

  const fetchCurrentProfile = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentProfile(data);
      }
    } catch {
      // unauthenticated
    }
  };

  if (!isOpen) return null;

  const currentStackInfo = BACKEND_STACKS.find(s => s.id === selectedStack) || BACKEND_STACKS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentStackInfo.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // STEP 1: Registration Request
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email,
          password,
          role,
          zia_membership: ziaMembership,
          eiz_membership: eizMembership,
          pacra_entity_id: pacraEntityId
        })
      });

      const data = await res.json();

      if (res.ok) {
        setOtpIdentifier(data.identifier);
        setDevOtpCode(data.dev_otp_code);
        setOtpCode(data.dev_otp_code || ''); // auto-prefill for testing!
        setRegisterStep('otp');
        setStatusMessage({
          type: 'info',
          text: `Account created in PostgreSQL database. Enter the 6-digit OTP code sent to ${data.identifier}.`
        });
        fetchUsersAndOtps();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Registration failed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP and Activate Session
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: otpIdentifier,
          code: otpCode
        })
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentAccessToken(data.accessToken);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('zape_access_token', data.accessToken);
        }
        setCurrentProfile(data.user);
        setModalTab('session');
        setStatusMessage({
          type: 'success',
          text: `Account activated! Active session JWT token generated for ${data.user.full_name}.`
        });

        notificationService.dispatch({
          eventType: 'PROJECT_STATUS_UPDATED',
          priority: 'MEDIUM',
          targetRole: (data.user.role || 'architect').toLowerCase() as any,
          title: `Account Activated: ${data.user.full_name}`,
          message: `Real user verified via OTP in PostgreSQL database (${data.user.email || data.user.phone}).`,
          actionTab: 'architect',
          actionLabel: 'Open Studio'
        });

        if (onAccountCreated) onAccountCreated(data.user);
        fetchUsersAndOtps();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'OTP verification failed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentAccessToken(data.accessToken);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('zape_access_token', data.accessToken);
        }
        setCurrentProfile(data.user);
        setModalTab('session');
        setStatusMessage({
          type: 'success',
          text: `Login successful. Active session token generated for ${data.user.full_name} (${data.user.role}).`
        });
        fetchUsersAndOtps();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Login failed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // SILENT REFRESH
  const handleRefreshToken = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentAccessToken(data.accessToken);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('zape_access_token', data.accessToken);
        }
        setStatusMessage({ type: 'success', text: 'Access token rotated via refresh token cookie.' });
        fetchCurrentProfile(data.accessToken);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Refresh failed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentAccessToken(null);
    setCurrentProfile(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('zape_access_token');
    }
    setModalTab('auth');
    setAuthMode('login');
    setStatusMessage({ type: 'info', text: 'Logged out. Session revoked.' });
  };

  // PASSWORD RESET REQUEST
  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: resetIdentifier })
      });
      const data = await res.json();
      if (res.ok) {
        setResetStep('confirm');
        setResetOtpCode(data.dev_otp_code || '');
        setStatusMessage({ type: 'info', text: `Reset code sent. Code: ${data.dev_otp_code || 'via SMS'}` });
      } else {
        setStatusMessage({ type: 'error', text: data.error });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // PASSWORD RESET CONFIRM
  const handlePasswordResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: resetIdentifier,
          code: resetOtpCode,
          new_password: resetNewPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthMode('login');
        setResetStep('request');
        setStatusMessage({ type: 'success', text: 'Password reset successful. You can now log in.' });
      } else {
        setStatusMessage({ type: 'error', text: data.error });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl my-6 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-600/80 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                <span>ZAPE Sovereign Auth &amp; Account Service</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                  :4009 Service
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                PostgreSQL · Password Hashing · OTP Activation · Rotating Refresh JWTs · RBAC Protection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-900 border border-neutral-800 transition-colors font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* REQUIRED ARCHITECTURAL DIRECTIVE BANNER */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-neutral-950 to-neutral-950 px-6 py-3.5 border-b border-neutral-800 text-xs shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 shrink-0 mt-0.5">
              <Server className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-emerald-200 font-semibold text-xs leading-relaxed">
                The frontend can collect the account details, but to actually create/save an account, you need a backend and database.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-neutral-300">
                <span className="text-neutral-400 font-bold">For example:</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">Node.js + Express + MongoDB</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">Node.js + Express + MySQL</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">PHP + MySQL</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">Python + Flask/Django</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">Firebase Authentication</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">Supabase Authentication</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-neutral-950 px-6 py-2 border-b border-neutral-800 flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalTab('auth')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                modalTab === 'auth' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-neutral-400 hover:text-white bg-neutral-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Real Auth Flow (Register / Login / OTP)</span>
            </button>

            {currentProfile && (
              <button
                onClick={() => setModalTab('session')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  modalTab === 'session' 
                    ? 'bg-emerald-600 text-white font-bold' 
                    : 'text-neutral-400 hover:text-white bg-neutral-900'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Session Profile</span>
              </button>
            )}

            <button
              onClick={() => setModalTab('backend_stacks')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                modalTab === 'backend_stacks' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-neutral-400 hover:text-white bg-neutral-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Backend &amp; DB Stacks</span>
            </button>

            <button
              onClick={() => {
                setModalTab('database_records');
                fetchUsersAndOtps();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                modalTab === 'database_records' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-neutral-400 hover:text-white bg-neutral-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database Users ({registeredUsers.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Auth Service :4009 Online</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: REAL AUTH FLOW */}
          {modalTab === 'auth' && (
            <div className="space-y-4">
              {/* Sub-modes: Register, Login, Reset */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setRegisterStep('details');
                      setStatusMessage(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      authMode === 'register' ? 'bg-emerald-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    1. Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setStatusMessage(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      authMode === 'login' ? 'bg-emerald-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    2. Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('reset_password');
                      setResetStep('request');
                      setStatusMessage(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      authMode === 'reset_password' ? 'bg-emerald-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Reset Password
                  </button>
                </div>

                {authMode === 'register' && registerStep === 'otp' && (
                  <button
                    onClick={() => setRegisterStep('details')}
                    className="text-xs text-emerald-400 hover:underline font-mono"
                  >
                    ← Back to form details
                  </button>
                )}
              </div>

              {/* Status Message Banner */}
              {statusMessage && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200' 
                    : statusMessage.type === 'error'
                    ? 'bg-red-950/80 border-red-800 text-red-200'
                    : 'bg-blue-950/80 border-blue-800 text-blue-200'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* SUB-VIEW 1: REGISTER STEP 1 (DETAILS) */}
              {authMode === 'register' && registerStep === 'details' && (
                <form onSubmit={handleRegister} className="space-y-4 max-w-xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="text-neutral-400 font-medium block mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                        placeholder="MARY BANDA"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 font-medium block mb-1">Professional Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                      >
                        <option value="CLIENT">Client / Property Owner</option>
                        <option value="ARCHITECT">Architect (ZIA Registered)</option>
                        <option value="ENGINEER">Engineer (EIZ Registered)</option>
                        <option value="CONTRACTOR">Contractor (NCC Registered)</option>
                        <option value="COUNCIL_OFFICER">Council Planning Officer</option>
                        <option value="INSPECTOR">Building Inspector</option>
                        <option value="ZIA_ADMIN">ZIA Registrar General</option>
                        <option value="STUDENT">Student / Graduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-neutral-400 font-medium block mb-1">Phone Number (Zambian Format)</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="0977123456"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 font-medium block mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="mary@banda-architects.co.zm"
                      />
                    </div>

                    {role === 'ARCHITECT' && (
                      <div>
                        <label className="text-neutral-400 font-medium block mb-1">ZIA Membership Number</label>
                        <input
                          type="text"
                          value={ziaMembership}
                          onChange={(e) => setZiaMembership(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                          placeholder="ZIA-ARCH-00991"
                        />
                      </div>
                    )}

                    {role === 'ENGINEER' && (
                      <div>
                        <label className="text-neutral-400 font-medium block mb-1">EIZ Membership Number</label>
                        <input
                          type="text"
                          value={eizMembership}
                          onChange={(e) => setEizMembership(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                          placeholder="EIZ-ENG-4471"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-neutral-400 font-medium block mb-1">PACRA Entity ID (If applicable)</label>
                      <input
                        type="text"
                        value={pacraEntityId}
                        onChange={(e) => setPacraEntityId(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="120000/2021"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-neutral-400 font-medium block mb-1">Password (8+ chars, 1 uppercase, 1 number)</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="Zambia@2026"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/80 transition-all flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{isSubmitting ? 'Creating in Database...' : 'Register (Sends 6-Digit OTP)'}</span>
                  </button>
                </form>
              )}

              {/* SUB-VIEW 2: REGISTER STEP 2 (OTP VERIFICATION) */}
              {authMode === 'register' && registerStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-sm mx-auto text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-600/80 text-emerald-400 flex items-center justify-center mx-auto">
                    <Key className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">Enter 6-Digit OTP Code</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Sent to <strong>{otpIdentifier}</strong>
                    </p>
                  </div>

                  {devOtpCode && (
                    <div 
                      onClick={() => setOtpCode(devOtpCode)}
                      className="p-2.5 rounded-xl bg-neutral-950 border border-amber-800/80 text-amber-300 text-xs font-mono cursor-pointer hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2"
                      title="Click to auto-fill"
                    >
                      <span>Simulated OTP: <strong>{devOtpCode}</strong> (Click to paste)</span>
                    </div>
                  )}

                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-700 text-center text-lg tracking-widest text-white font-mono p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="123456"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length !== 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    {isSubmitting ? 'Activating Session...' : 'Verify & Activate Account'}
                  </button>
                </form>
              )}

              {/* SUB-VIEW 3: LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto">
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-white">Log in to ZAPE 3.0</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Enter registered phone number or email</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-neutral-400 font-medium block mb-1">Email or Phone</label>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="0977123456 or email"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 font-medium block mb-1">Password</label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Log In'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('reset_password')}
                      className="text-xs text-neutral-400 hover:text-white underline font-mono"
                    >
                      Forgot password?
                    </button>
                  </div>
                </form>
              )}

              {/* SUB-VIEW 4: PASSWORD RESET */}
              {authMode === 'reset_password' && (
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-white">Reset Password</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Verified via temporary 6-digit OTP</p>
                  </div>

                  {resetStep === 'request' ? (
                    <form onSubmit={handlePasswordResetRequest} className="space-y-3 text-xs">
                      <div>
                        <label className="text-neutral-400 font-medium block mb-1">Registered Phone or Email</label>
                        <input
                          type="text"
                          value={resetIdentifier}
                          onChange={(e) => setResetIdentifier(e.target.value)}
                          required
                          className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg font-mono"
                          placeholder="0977123456"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl"
                      >
                        Send Reset OTP
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handlePasswordResetConfirm} className="space-y-3 text-xs">
                      <div>
                        <label className="text-neutral-400 font-medium block mb-1">Enter 6-Digit Reset Code</label>
                        <input
                          type="text"
                          value={resetOtpCode}
                          onChange={(e) => setResetOtpCode(e.target.value)}
                          required
                          className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg font-mono"
                          placeholder="123456"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 font-medium block mb-1">New Password</label>
                        <input
                          type="password"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          required
                          className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg font-mono"
                          placeholder="New password"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                      >
                        Confirm New Password
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE SESSION PROFILE */}
          {modalTab === 'session' && currentProfile && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600/80 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      {currentProfile.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{currentProfile.full_name}</h4>
                      <span className="text-[11px] text-neutral-400">{currentProfile.id}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    {currentProfile.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-neutral-500 block">Phone:</span>
                    <span className="text-white">{currentProfile.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Email:</span>
                    <span className="text-white">{currentProfile.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Status:</span>
                    <span className="text-emerald-400 font-bold">{currentProfile.status}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">ZIA Membership:</span>
                    <span className="text-white">{currentProfile.zia_membership || 'N/A'}</span>
                  </div>
                </div>

                {currentAccessToken && (
                  <div className="space-y-1 pt-2 border-t border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">JWT Access Token (15-min TTL):</span>
                    <p className="p-2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-emerald-400 truncate">
                      {currentAccessToken}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                  <button
                    onClick={handleRefreshToken}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                    <span>Silent Refresh Token</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BACKEND & DATABASE STACKS */}
          {modalTab === 'backend_stacks' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Supported Backend &amp; Database Technology Stacks
                </h4>
                <p className="text-xs text-neutral-400">
                  Select an industry-standard stack below to inspect how accounts are created, hashed, and persisted on the server:
                </p>
              </div>

              {/* Stack Pills / Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BACKEND_STACKS.map(stack => (
                  <button
                    key={stack.id}
                    onClick={() => setSelectedStack(stack.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedStack === stack.id
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                        {stack.badge}
                      </span>
                      <span className="text-xs font-bold block text-white">
                        {stack.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-2 font-mono">
                      {stack.database}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Stack Details Card */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-white font-mono">{currentStackInfo.name}</h5>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        {currentStackInfo.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {currentStackInfo.description}
                    </p>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-mono flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                    <span>{copiedCode ? 'Copied Snippet' : 'Copy Handler'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Server Runtime:</span>
                    <span className="text-neutral-200 font-mono font-medium">{currentStackInfo.runtime}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Database Storage:</span>
                    <span className="text-emerald-400 font-mono font-medium">{currentStackInfo.database}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Driver / Client SDK:</span>
                    <span className="text-neutral-200 font-mono font-medium">{currentStackInfo.driver}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-mono text-neutral-300 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Server-Side Authentication Handler</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">POST /api/auth/register</span>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    <code>{currentStackInfo.codeSnippet}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-mono text-neutral-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Database Schema / Collection Entity</span>
                    </span>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
                    <code>{currentStackInfo.schemaSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE RECORDS & RECENT OTPS */}
          {modalTab === 'database_records' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Active Users in PostgreSQL Database</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                      {registeredUsers.length} Records
                    </span>
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Real persistent user rows in PostgreSQL `users` table via Auth Service (:4009).
                  </p>
                </div>

                <button
                  onClick={fetchUsersAndOtps}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-mono flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh DB</span>
                </button>
              </div>

              {/* Users List */}
              <div className="space-y-2.5">
                {registeredUsers.map((u, idx) => (
                  <div key={u.id || idx} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{u.full_name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-emerald-300">
                            {u.role}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${u.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                            {u.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {u.phone || u.email} · ID: {u.id}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-neutral-500 self-end sm:self-auto">
                      Joined: {u.created_at?.replace('T', ' ').substring(0, 19)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent OTP Delivery Monitor */}
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recent OTP Verification Codes (SMS &amp; Email Delivery Queue)</span>
                  </h5>
                  <span className="text-[10px] font-mono text-neutral-400">Total: {recentOtps.length}</span>
                </div>

                <div className="space-y-2">
                  {recentOtps.map((otp, idx) => (
                    <div key={otp.id || idx} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">{otp.identifier}</span>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 text-[10px]">{otp.purpose}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-bold tracking-wider">{otp.code_plain || '******'}</span>
                        <span className={`text-[10px] ${otp.consumed_at ? 'text-emerald-400' : 'text-neutral-500'}`}>
                          {otp.consumed_at ? 'Consumed' : 'Valid'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-950 px-6 py-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Sovereign Full-Stack Auth: Express :4009 + PostgreSQL</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Close Auth Modal
          </button>
        </div>
      </div>
    </div>
  );
};
