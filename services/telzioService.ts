import { TelzioRecording } from '../types';

/**
 * Mock service for Telzio API V3 interaction.
 * Documentation reference: https://api.telzio.com/v3/index.html#tag/Recordings
 */

const MOCK_RECORDINGS: TelzioRecording[] = [
    {
        id: 'rec-001',
        call_id: 'call-xyz-101',
        direction: 'inbound',
        from: '+15125550100',
        to: '+15129990001',
        duration: 145,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        status: 'completed',
        internal_notes: 'Prospective student inquiring about AEPM program eligibility.',
        tags: ['New Student', 'Support']
    },
    {
        id: 'rec-002',
        call_id: 'call-xyz-102',
        direction: 'outbound',
        from: '+15129990001',
        to: '+12105550202',
        duration: 320,
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        status: 'completed',
        internal_notes: 'Follow-up regarding missed Module 2 session.',
        tags: ['Follow-up']
    },
    {
        id: 'rec-003',
        call_id: 'call-xyz-103',
        direction: 'inbound',
        from: '+17375550303',
        to: '+15129990001',
        duration: 0,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        uri: '',
        status: 'missed',
        is_missed: true,
        reconciled: false,
        tags: ['Support']
    },
    {
        id: 'rec-005',
        call_id: 'call-xyz-105',
        direction: 'inbound',
        from: '555-123-4567', // Matches Alex Johnson
        to: '+15129990001',
        duration: 0,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        uri: '',
        status: 'missed',
        is_missed: true,
        reconciled: false
    },
    {
        id: 'rec-004',
        call_id: 'call-xyz-104',
        direction: 'outbound',
        from: '+15129990001',
        to: '+15125550404',
        duration: 512,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        status: 'completed',
        internal_notes: 'Coordinate with Probation Officer Smith regarding Alex Johnson certificate.',
        tags: ['Certificates', 'Legal']
    }
];

export const fetchRecordings = async (): Promise<TelzioRecording[]> => {
    // Simulate network latency
    return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_RECORDINGS]), 500);
    });
};

// FIX: Renamed updateRecordingNotes to updateRecordingNotesAndTags and added tags parameter to resolve import errors and functionality gaps in AdminCallLogs.
export const updateRecordingNotesAndTags = async (recordingId: string, notes: string, tags: string[]): Promise<boolean> => {
    // Simulate API update
    return new Promise((resolve) => {
        setTimeout(() => {
            const index = MOCK_RECORDINGS.findIndex(r => r.id === recordingId);
            if (index !== -1) {
                MOCK_RECORDINGS[index].internal_notes = notes;
                MOCK_RECORDINGS[index].tags = tags;
                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    });
};

export const reconcileCall = async (recordingId: string, reconciled: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const index = MOCK_RECORDINGS.findIndex(r => r.id === recordingId);
            if (index !== -1) {
                MOCK_RECORDINGS[index].reconciled = reconciled;
                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    });
};
