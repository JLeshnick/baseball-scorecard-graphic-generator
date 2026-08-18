import React, { useRef } from 'react';
import { X, Trash2, Download, Upload, Plus, FolderOpen, Play } from 'lucide-react';
import { getSavedScorecardsList, deleteSavedScorecard, exportScorecardAsJson, importScorecardFromJson } from '../services/scorecardStorage';

export default function SavedGamesModal({
  isOpen,
  onClose,
  onLoadGame,
  onNewGame,
  currentScorecard,
  isDark = false,
  onToast,
}) {
  if (!isOpen) return null;

  const fileInputRef = useRef(null);
  const savedList = getSavedScorecardsList();

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this saved scorecard?')) {
      deleteSavedScorecard(id);
      onToast?.('Scorecard deleted');
    }
  };

  const handleExport = (gameData, e) => {
    e.stopPropagation();
    exportScorecardAsJson(gameData);
    onToast?.('Scorecard exported as JSON');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedData = await importScorecardFromJson(file);
      onLoadGame(importedData);
      onToast?.('Scorecard imported successfully!');
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to import scorecard.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        backgroundColor: isDark ? '#18181c' : '#ffffff',
        color: isDark ? '#f4f4f5' : '#18181b',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
        border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#111113' : '#faf9f6',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
            <span style={{ fontSize: '14px', fontWeight: 800 }}>
              Saved Scorecards Library
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px', borderRadius: '6px', border: 'none',
              backgroundColor: 'transparent', color: isDark ? '#a1a1aa' : '#78716c',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          gap: '8px',
          borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
          backgroundColor: isDark ? '#141417' : '#f9f9f8',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => {
              onNewGame();
              onClose();
            }}
            style={{
              flex: 1, minWidth: '120px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '7px 12px', borderRadius: '6px',
              border: 'none', backgroundColor: '#3b82f6', color: '#ffffff',
              fontSize: '11.5px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Plus style={{ width: '14px', height: '14px' }} />
            New Blank Game
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '7px 12px', borderRadius: '6px',
              border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
              backgroundColor: isDark ? '#27272a' : '#ffffff',
              color: isDark ? '#fafafa' : '#18181b',
              fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Upload style={{ width: '14px', height: '14px' }} />
            Import JSON
          </button>
        </div>

        {/* Saved List (Scrollable) */}
        <div style={{
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: '200px',
        }}>
          {savedList.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '36px 16px', textAlign: 'center', color: isDark ? '#a1a1aa' : '#78716c',
            }}>
              <FolderOpen style={{ width: '32px', height: '32px', opacity: 0.35, marginBottom: '8px' }} />
              <div style={{ fontSize: '13px', fontWeight: 600 }}>No saved scorecards yet</div>
              <div style={{ fontSize: '11px', marginTop: '4px', maxWidth: '300px' }}>
                Your custom live games will be automatically autosaved, and you can save completed games to your library.
              </div>
            </div>
          ) : (
            savedList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onLoadGame(item.data);
                  onClose();
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '8px',
                  border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
                  backgroundColor: isDark ? '#141417' : '#fcfcfc',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#fafafa' : '#18181b' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: isDark ? '#a1a1aa' : '#78716c', marginTop: '2px', display: 'flex', gap: '8px' }}>
                    <span>{item.date}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{item.score}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={(e) => handleExport(item.data, e)}
                    title="Export JSON"
                    style={{
                      padding: '6px', borderRadius: '4px', border: 'none',
                      backgroundColor: 'transparent', color: isDark ? '#a1a1aa' : '#78716c',
                      cursor: 'pointer',
                    }}
                  >
                    <Download style={{ width: '14px', height: '14px' }} />
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    title="Delete Saved Game"
                    style={{
                      padding: '6px', borderRadius: '4px', border: 'none',
                      backgroundColor: 'transparent', color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
          backgroundColor: isDark ? '#111113' : '#faf9f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px', borderRadius: '6px',
              border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
              backgroundColor: isDark ? '#27272a' : '#ffffff',
              color: isDark ? '#d4d4d8' : '#374151',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
