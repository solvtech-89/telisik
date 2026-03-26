import axios from 'axios';
import { API_BASE } from '../config';

export const generateFingerprint = async () => {
  const cached = localStorage.getItem('browser_fingerprint');
  if (cached) {
    return cached;
  }

  const components = [];

  components.push(`screen:${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);
  components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  components.push(`lang:${navigator.language}`);
  components.push(`platform:${navigator.platform}`);
  components.push(`ua:${navigator.userAgent}`);
  if (navigator.hardwareConcurrency) {
    components.push(`cores:${navigator.hardwareConcurrency}`);
  }
  if (navigator.deviceMemory) {
    components.push(`memory:${navigator.deviceMemory}`);
  }

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Telisik fingerprint', 2, 2);
    const canvasData = canvas.toDataURL();
    components.push(`canvas:${canvasData.slice(-50)}`);
  } catch (e) {
    // Canvas fingerprinting might be blocked
  }
  const raw = components.join('|');
  const fingerprint = await hashString(raw);
  localStorage.setItem('browser_fingerprint', fingerprint);

  return fingerprint;
};

const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};


export const getSessionKey = () => {
  let sessionKey = sessionStorage.getItem('session_key');
  if (!sessionKey) {
    sessionKey = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_key', sessionKey);
  }
  return sessionKey;
};


export const recordView = async (contentType, objectId, shareToken = null) => {
  try {
    const fingerprint = await generateFingerprint();
    const sessionKey = getSessionKey();
    const referrer = document.referrer || '';

    const response = await axios.post(`${API_BASE}/api/view/record/`, {
      content_type: contentType, // 'article' or 'diskursus'
      object_id: objectId,
      fingerprint: fingerprint,
      session_key: sessionKey,
      share_token: shareToken,
      referrer: referrer,
    });

    return response.data;
  } catch (error) {
    console.error('Error recording view:', error);
    return { recorded: false, error: error.message };
  }
};

export const createShareLink = async (contentType, objectId, platform = 'copy') => {
  try {
    const sessionKey = getSessionKey();

    const response = await axios.post(`${API_BASE}/api/share/create/`, {
      content_type: contentType,
      object_id: objectId,
      platform: platform,
      session_key: sessionKey,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating share link:', error);
    return null;
  }
};

export const getStats = async (contentType, objectId) => {
  try {
    const response = await axios.get(`${API_BASE}/api/stats/${contentType}/${objectId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
};

export const getShareTokenFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('share');
};

export const formatCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};