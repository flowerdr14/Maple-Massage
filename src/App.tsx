import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, ChevronDown, ChevronRight, Plus, Send, MessageSquare, Users, X, Check, Paperclip, FileText, Copy, Forward, Trash2, Reply, MinusSquare, PlusSquare, Search, Settings, Box, Calendar, Save, Grid, Home, Smile, CheckSquare, MessageCircle, Mail, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, deleteDoc, doc } from 'firebase/firestore';

type CustomUser = { name: string, id: string, pw: string, photo?: string, role?: string, status?: string };

const INITIAL_USERS: CustomUser[] = [
  { name: '정루이', id: 'jungroo_2', pw: 'haesol123' },
  { name: '유중혁', id: 'U_joongh', pw: 'haesol123' },
  { name: '강동주', id: 'kangjooo', pw: 'haesol123' },
  { name: '릴리', id: 'lilly_lil', pw: 'haesol123' },
  { name: '박민국', id: 'mincook', pw: 'haesol123' },
  { name: '찬호', id: 'chanho8', pw: 'haesol123' },
  { name: '소나무', id: 'sonamoo', pw: 'haesol123' },
  { name: '이익준', id: 'ikjoooon', pw: 'haesol123' },
  { name: '최가은', id: 'gagaeun', pw: 'haesol123' },
  { name: '박지아', id: 'jiapark84', pw: 'haesol123' },
  { name: '이정원', id: 'leegarden', pw: 'haesol123' },
  { name: '이정인', id: 'jeongout7', pw: 'haesol123' },
  { name: '순후추', id: 'huchu', pw: 'haesol123' },
  { name: '도하', id: 'dohahado', pw: 'haesol123' },
  { name: '박태현', id: 'taehyuns64', pw: 'haesol123' },
  { name: '이수현', id: 'siuuhyun', pw: 'haesol123' },
  { name: '양재원', id: 'sheepone', pw: 'haesol123' },
  { name: '이도윤', id: 'leedoyoon', pw: 'haesol123' },
  { name: '김부각', id: 'kimbookack', pw: 'haesol123' },
  { name: '윤아름', id: 'yoonareum', pw: 'haesol123' },
  { name: '크림', id: 'sangcream', pw: 'haesol123' },
  { name: '강한별', id: 'kangonestar', pw: 'haesol123' },
  { name: '이든', id: 'leedeun', pw: 'haesol123' },
  { name: '델런', id: 'delrun', pw: 'haesol123' },
  { name: '준석준', id: 'ilbae', pw: 'haesol123' },
  { name: '박시윤', id: 'bbaksi', pw: 'haesol123' },
];

const DEFAULT_PROFILE_PIC = 'https://e7.pngegg.com/pngimages/906/222/png-clipart-computer-icons-user-profile-avatar-french-people-computer-network-heroes-thumbnail.png';

// --- Mock Data based on the provided images ---
const PERSONNEL_DATA = {
  의료진: [
    {
      dept: '응급의학과 EM', count: 6,
      roles: [
        { role: '과장', count: 1, members: [{ name: '강동주', desc: 'EM 과장 / GS 전문의', status: 'away' }] },
        { role: '전문의', count: 2, members: [{ name: '이도윤', desc: 'EM 전문의 / PED R1', status: 'online' }, { name: '김부각', desc: 'EM 전문의', status: 'online' }] },
        { role: '레지던트', count: 2, members: [{ name: '윤아름', desc: 'EM R1', status: 'online' }, { name: '찬호', desc: 'EM R1', status: 'online' }, { name: '소나무', desc: 'EM R1', status: 'online' }] }
      ]
    },
    {
      dept: '일반외과 GS', count: 3,
      roles: [
        { role: '전문의', count: 2, members: [{ name: '이익준', desc: 'GS, NS, CS 전문의', status: 'away' }, { name: '강동주', desc: 'EM 과장 / GS 전문의', status: 'away' }] },
        { role: '레지던트', count: 1, members: [{ name: '혜정', desc: 'GS R1', status: 'online' }] }
      ]
    },
    {
      dept: '정형외과 OS', count: 3,
      roles: [
        { role: '과장', count: 1, members: [{ name: '정루이', desc: 'OS 과장', status: 'online' }] },
        { role: '전문의', count: 1, members: [{ name: 'Cream', desc: 'OS 전문의', status: 'online' }] }
      ]
    },
    {
      dept: '흉부외과 CS', count: 1,
      roles: [
        { role: '전문의', count: 1, members: [{ name: '이익준', desc: 'GS, NS, CS 전문의', status: 'away' }] }
      ]
    },
    {
      dept: '산부인과 OBGY', count: 1,
      roles: [
        { role: '레지던트', count: 1, members: [{ name: '최다은', desc: 'OBGY R1', status: 'online' }] }
      ]
    },
    {
      dept: '소아청소년과 PED', count: 1,
      roles: [
        { role: '레지던트', count: 2, members: [{ name: '박지아', desc: 'PED R4', status: 'online' }, { name: '이도윤', desc: 'EM 전문의 / PED R1', status: 'away' }] }
      ]
    },
    {
      dept: '소아외과 PES', count: 1,
      roles: [
        { role: '전문의', count: 1, members: [{ name: '이정원', desc: '소아외과', status: 'online' }] }
      ]
    },
    {
      dept: '마취통증의학과 AN', count: 7,
      roles: [
        { role: '과장', count: 1, members: [{ name: '유중혁', desc: 'AN 과장 / RD 대리', status: 'away' }] },
        { role: '전문의', count: 2, members: [{ name: '릴리', desc: 'AN 전문의 / PS 과장', status: 'online' }, { name: '박민국', desc: 'AN, NS, TS 전문의 / RD 과장', status: 'online' }] },
        { role: '레지던트', count: 4, members: [{ name: '이정인', desc: 'AN 치프', status: 'online' }, { name: '강한별', desc: 'AN R3', status: 'away' }, { name: '후추', desc: 'AN R3', status: 'online' }, { name: '도하', desc: 'AN R2', status: 'online' }] }
      ]
    },
    {
      dept: '성형외과 PS', count: 1,
      roles: [
        { role: '과장', count: 1, members: [{ name: '박민국', desc: 'AN, NS, TS 전문의 / RD 과장', status: 'online' }] },
        { role: '대리', count: 1, members: [{ name: '유중혁', desc: 'AN 과장 / RD 대리', status: 'away' }] }
      ]
    },
    {
      dept: '신경외과 NS', count: 4,
      roles: [
        { role: '과장', count: 1, members: [{ name: '박태현', desc: 'NS 과장 / GI 전문의', status: 'online' }] },
        { role: '전문의', count: 3, members: [{ name: '박민국', desc: 'AN, NS, TS 전문의 / RD 과장', status: 'online' }, { name: '이익준', desc: 'GS, NS, CS 전문의', status: 'online' }, { name: '양재원', desc: 'NS 전문의', status: 'online' }] }
      ]
    },
    {
      dept: '영상의학과 RD', count: 2,
      roles: [
        { role: '과장', count: 1, members: [{ name: '릴리', desc: 'AN 전문의 / PS 과장', status: 'online' }] }
      ]
    },
    {
      dept: '소화기내과 GI', count: 1,
      roles: [
        { role: '전문의', count: 1, members: [{ name: '박태현', desc: 'NS 과장 / GI 전문의', status: 'online' }] }
      ]
    },
    {
      dept: '외상외과 TS', count: 2,
      roles: [
        { role: '전문의', count: 1, members: [{ name: '안정원', desc: 'TS 전문의', status: 'online' }, { name: '박민국', desc: 'AN, NS, TS 전문의 / RD 과장', status: 'online' }] }
      ]
    },
    {
      dept: '인턴', count: 3,
      roles: [
        { role: '', count: 0, members: [{ name: '이수현', desc: 'OS 희망', status: 'online' }, { name: '이든', desc: 'EM 희망', status: 'online' }, { name: '델런', desc: 'GS 희망', status: 'away' }] }
      ]
    }
  ],
  간호사: [],
  원무과: [
    {
      dept: '원무과', count: 1,
      roles: [
        { role: '', count: 0, members: [{ name: '준석준', desc: '원무과', status: 'online' }] }
      ]
    },
    {
      dept: '보안팀', count: 1,
      roles: [
        { role: '', count: 0, members: [{ name: '박시윤', desc: '보안', status: 'online' }] }
      ]
    }
  ]
};

type ViewMode = 'personnel' | 'messenger';
type TabType = '의료진' | '간호사' | '원무과';
type ChatRoom = { id: string, name: string, participants: string[], isGroup: boolean, lastMessage?: string, timestamp?: any };
type Note = { id: string, senderId: string, senderName: string, receiverIds: string[], title: string, content: string, timestamp: any, isRead?: boolean };
type ThemeColor = 'pink' | 'navy' | 'blue' | 'lavender' | 'green';
type FontSize = 'small' | 'medium' | 'large';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('personnel');
  const [activeTab, setActiveTab] = useState<TabType>('의료진');
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({ 'root': true, '의료진': true, '응급의학과 EM': true });
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({ '응급의학과 EM-과장': true, '응급의학과 EM-전문의': true, '응급의학과 EM-레지던트': true });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeColor>('blue');
  const [fontSize, setFontSize] = useState<FontSize>('small');
  
  // Auth State
  const [usersList, setUsersList] = useState<CustomUser[]>(INITIAL_USERS);
  const [customUser, setCustomUser] = useState<CustomUser | null>(null);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAutoLogin, setIsAutoLogin] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const changeActiveChannel = (channelId: string | null) => {
    setActiveChannelId(channelId);
    activeChannelIdRef.current = channelId;
  };
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedFile, setSelectedFile] = useState<{name: string, type: string, data: string, size: number} | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Note State
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteTab, setNoteTab] = useState<'inbox' | 'sent'>('inbox');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteReceivers, setNoteReceivers] = useState<string[]>([]);
  const [noteFontSize, setNoteFontSize] = useState('14px');
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<{ id: string; title: string; body: string; type: 'message' | 'note' }[]>([]);
  const isInitialMessagesLoad = useRef(true);
  const isInitialNotesLoad = useRef(true);
  const activeChannelIdRef = useRef(activeChannelId);

  useEffect(() => {
    activeChannelIdRef.current = activeChannelId;
  }, [activeChannelId]);

  // Modal State
  const [modalType, setModalType] = useState<'1:1' | 'bulk' | 'group' | 'forward' | 'note_receivers' | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkMessageText, setBulkMessageText] = useState('');
  const [groupNameInput, setGroupNameInput] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [forwardMessage, setForwardMessage] = useState<any>(null);

  // Tree Selection State
  const [selectedTreeMembers, setSelectedTreeMembers] = useState<string[]>([]);

  // Profile State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ pw: '', photo: '', role: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const dbUsers = JSON.parse(localStorage.getItem('haesol_users_db') || '[]');
    const deletedUsers = JSON.parse(localStorage.getItem('haesol_deleted_users') || '[]');

    const merged = INITIAL_USERS.map(u => {
      const updated = dbUsers.find((dbU: any) => dbU.id === u.id);
      return updated ? updated : u;
    }).filter(u => !deletedUsers.includes(u.id));

    setUsersList(merged);

    const savedUser = sessionStorage.getItem('haesol_user') || localStorage.getItem('haesol_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (!deletedUsers.includes(parsed.id)) {
        const latestUser = merged.find(u => u.id === parsed.id) || parsed;
        setCustomUser(latestUser);
      } else {
        localStorage.removeItem('haesol_user');
        sessionStorage.removeItem('haesol_user');
      }
    }
  }, []);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addToast = (title: string, body: string, type: 'message' | 'note') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, body, type }]);
    
    // Play notification sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.play().catch(() => {}); // Ignore errors if browser blocks autoplay

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    if (!customUser) return;
    
    // Reset initial load flag for new user/session
    isInitialMessagesLoad.current = true;
    
    // Listen to all messages where the user is a participant or it's a global message
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      const roomsMap = new Map<string, ChatRoom>();
      
      // Add global room
      roomsMap.set('global', { id: 'global', name: '전체 메시지', participants: [], isGroup: true });

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !isInitialMessagesLoad.current) {
          const data = change.doc.data();
          if (data.senderId !== customUser.id && data.channelId !== activeChannelIdRef.current) {
            setUnreadCounts(prev => ({
              ...prev,
              [data.channelId]: (prev[data.channelId] || 0) + 1
            }));
            
            if (Notification.permission === 'granted' && document.hidden) {
              new Notification(`새 메시지: ${data.senderName}`, {
                body: data.text || '(파일)',
              });
            }
            addToast(`새 메시지: ${data.senderName}`, data.text || '(파일)', 'message');
          }
        }
      });

      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({ id: doc.id, ...data });

        // Extract chat rooms from messages
        if (data.channelId !== 'global') {
          const isParticipant = data.participants?.includes(customUser.id);
          if (isParticipant) {
            if (!roomsMap.has(data.channelId)) {
              let roomName = data.channelName;
              if (!data.isGroup) {
                // For 1:1, find the other person's name
                const otherId = data.participants.find((p: string) => p !== customUser.id);
                const otherUser = usersList.find(u => u.id === otherId);
                roomName = otherUser ? otherUser.name : '알 수 없음';
              }
              roomsMap.set(data.channelId, {
                id: data.channelId,
                name: roomName || '채팅방',
                participants: data.participants,
                isGroup: data.isGroup,
                lastMessage: data.text || (data.file ? '(파일)' : ''),
                timestamp: data.timestamp
              });
            } else {
              // Update last message
              const room = roomsMap.get(data.channelId)!;
              room.lastMessage = data.text || (data.file ? '(파일)' : '');
              room.timestamp = data.timestamp;
            }
          }
        } else {
           const globalRoom = roomsMap.get('global')!;
           globalRoom.lastMessage = data.text || (data.file ? '(파일)' : '');
           globalRoom.timestamp = data.timestamp;
        }
      });
      
      setMessages(msgs);
      setChatRooms(Array.from(roomsMap.values()).sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return b.timestamp.toMillis() - a.timestamp.toMillis();
      }));

      if (isInitialMessagesLoad.current) {
        isInitialMessagesLoad.current = false;
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => unsubscribe();
  }, [customUser]);

  useEffect(() => {
    if (activeChannelId) {
      setUnreadCounts(prev => ({
        ...prev,
        [activeChannelId]: 0
      }));
    }
  }, [activeChannelId]);

  useEffect(() => {
    if (activeChannelId === 'notes_management') {
      setUnreadCounts(prev => ({
        ...prev,
        'notes': 0
      }));
    }
  }, [activeChannelId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const user = usersList.find(u => u.id === loginId && u.pw === loginPw);
    if (user) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      setCustomUser(user);
      if (isAutoLogin) {
        localStorage.setItem('haesol_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('haesol_user', JSON.stringify(user));
      }
    } else {
      setLoginError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLogout = () => {
    setCustomUser(null);
    changeActiveChannel(null);
    localStorage.removeItem('haesol_user');
    sessionStorage.removeItem('haesol_user');
  };

  const handleSaveProfile = () => {
    if (!customUser) return;
    const updatedUser = { ...customUser, pw: profileEdit.pw, photo: profileEdit.photo, role: profileEdit.role };
    setCustomUser(updatedUser);
    if (localStorage.getItem('haesol_user')) {
      localStorage.setItem('haesol_user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('haesol_user', JSON.stringify(updatedUser));
    }

    const dbUsers = JSON.parse(localStorage.getItem('haesol_users_db') || '[]');
    const existingIdx = dbUsers.findIndex((u: any) => u.id === customUser.id);
    if (existingIdx !== -1) {
      dbUsers[existingIdx] = updatedUser;
    } else {
      dbUsers.push(updatedUser);
    }
    localStorage.setItem('haesol_users_db', JSON.stringify(dbUsers));

    setUsersList(prev => prev.map(u => u.id === customUser.id ? updatedUser : u));
    setIsProfileModalOpen(false);
  };

  const handleDeleteAccount = () => {
    setConfirmDelete(true);
  };

  const executeDeleteAccount = () => {
    if (!customUser) return;
    const deletedUsers = JSON.parse(localStorage.getItem('haesol_deleted_users') || '[]');
    deletedUsers.push(customUser.id);
    localStorage.setItem('haesol_deleted_users', JSON.stringify(deletedUsers));

    setUsersList(prev => prev.filter(u => u.id !== customUser.id));
    setConfirmDelete(false);
    setIsProfileModalOpen(false);
    
    setCustomUser(null);
    changeActiveChannel(null);
    localStorage.removeItem('haesol_user');
    sessionStorage.removeItem('haesol_user');
  };

  const toggleDept = (deptName: string) => {
    setExpandedDepts(prev => ({ ...prev, [deptName]: !prev[deptName] }));
  };

  const toggleRole = (deptName: string, roleName: string) => {
    const key = `${deptName}-${roleName}`;
    setExpandedRoles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('파일 크기는 500KB 이하여야 합니다. (프로토타입 제한)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        name: file.name,
        type: file.type,
        data: reader.result as string,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !customUser || !activeChannelId) return;

    const text = inputText.trim();
    const fileToSend = selectedFile;
    setInputText('');
    setSelectedFile(null);

    const activeRoom = chatRooms.find(r => r.id === activeChannelId);
    if (!activeRoom) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text,
        file: fileToSend,
        replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text || '(파일)', senderName: replyingTo.senderName } : null,
        senderId: customUser.id,
        senderName: customUser.name,
        channelId: activeChannelId,
        participants: activeRoom.participants,
        channelName: activeRoom.name,
        isGroup: activeRoom.isGroup,
        timestamp: serverTimestamp(),
      });
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateChat = async () => {
    if (!customUser) return;

    if (modalType === '1:1') {
      if (selectedUsers.length !== 1) return;
      const otherId = selectedUsers[0];
      const channelId = [customUser.id, otherId].sort().join('_');
      
      // Check if room exists, if not, create a dummy message or just set active
      // Since we derive rooms from messages, we need to send an initial message to actually "create" it in the list.
      // But for UX, we can just set it as active and let the user send the first message.
      if (!chatRooms.find(r => r.id === channelId)) {
        setChatRooms(prev => [{
          id: channelId,
          name: usersList.find(u => u.id === otherId)?.name || '알 수 없음',
          participants: [customUser.id, otherId],
          isGroup: false
        }, ...prev]);
      }
      changeActiveChannel(channelId);
      closeModal();
    } else if (modalType === 'group') {
      if (selectedUsers.length < 2) return;
      const channelId = `group_${Date.now()}`;
      const participants = [customUser.id, ...selectedUsers];
      const groupName = groupNameInput.trim() || `${customUser.name} 외 ${selectedUsers.length}명`;
      
      setChatRooms(prev => [{
        id: channelId,
        name: groupName,
        participants,
        isGroup: true
      }, ...prev]);
      changeActiveChannel(channelId);
      closeModal();
    } else if (modalType === 'bulk') {
      if (selectedUsers.length === 0 || !bulkMessageText.trim()) return;
      
      // Send individual 1:1 messages
      for (const otherId of selectedUsers) {
        const channelId = [customUser.id, otherId].sort().join('_');
        try {
          await addDoc(collection(db, 'messages'), {
            text: bulkMessageText,
            senderId: customUser.id,
            senderName: customUser.name,
            channelId: channelId,
            participants: [customUser.id, otherId],
            channelName: '',
            isGroup: false,
            timestamp: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error sending bulk message:", error);
        }
      }
      closeModal();
      // Switch to messenger view
      setViewMode('messenger');
    } else if (modalType === 'forward') {
      if (selectedUsers.length === 0 || !forwardMessage) return;
      
      for (const otherId of selectedUsers) {
        const channelId = [customUser.id, otherId].sort().join('_');
        try {
          await addDoc(collection(db, 'messages'), {
            text: forwardMessage.text || '',
            file: forwardMessage.file || null,
            senderId: customUser.id,
            senderName: customUser.name,
            channelId: channelId,
            participants: [customUser.id, otherId],
            channelName: '',
            isGroup: false,
            timestamp: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error forwarding message:", error);
        }
      }
      closeModal();
      setForwardMessage(null);
      setViewMode('messenger');
    } else if (modalType === 'note_receivers') {
      setNoteReceivers(prev => Array.from(new Set([...prev, ...selectedUsers])));
      closeModal();
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (window.confirm('메시지를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'messages', msgId));
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const handleCopyMessage = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('메시지가 복사되었습니다.');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const openForwardModal = (msg: any) => {
    setForwardMessage(msg);
    setModalType('forward');
    setSelectedUsers([]);
    setUserSearchQuery('');
  };

  const openModal = (type: '1:1' | 'bulk' | 'group') => {
    setModalType(type);
    setSelectedUsers([]);
    setBulkMessageText('');
    setGroupNameInput('');
    setUserSearchQuery('');
    setIsDropdownOpen(false);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUsers([]);
    setBulkMessageText('');
  };

  const toggleUserSelection = (userId: string) => {
    if (modalType === '1:1') {
      setSelectedUsers(prev => prev.includes(userId) ? [] : [userId]);
    } else {
      setSelectedUsers(prev => 
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
    }
  };

  const filteredMessages = useMemo(() => {
    if (!activeChannelId) return [];
    return messages.filter(m => m.channelId === activeChannelId);
  }, [messages, activeChannelId]);

  const handleCreateChatFromTree = (member: any) => {
    if (!customUser || member.name === customUser.name) return;
    const otherUser = usersList.find(u => u.name === member.name);
    if (!otherUser) return;
    
    const otherId = otherUser.id;
    const channelId = [customUser.id, otherId].sort().join('_');
    
    if (!chatRooms.find(r => r.id === channelId)) {
      setChatRooms(prev => [{
        id: channelId,
        name: otherUser.name,
        participants: [customUser.id, otherId],
        isGroup: false
      }, ...prev]);
    }
    changeActiveChannel(channelId);
    setViewMode('messenger');
  };

  const handleUpdateDisplayName = (newRole: string) => {
    if (!customUser) return;
    const updatedUser = { ...customUser, role: newRole };
    setCustomUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === customUser.id ? updatedUser : u));
    localStorage.setItem('haesol_user', JSON.stringify(updatedUser));
  };

  const handleUpdateName = (newName: string) => {
    if (!customUser || !newName.trim()) return;
    const updatedUser = { ...customUser, name: newName };
    setCustomUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === customUser.id ? updatedUser : u));
    localStorage.setItem('haesol_user', JSON.stringify(updatedUser));
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!customUser) return;
    const updatedUser = { ...customUser, status: newStatus };
    setCustomUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === customUser.id ? updatedUser : u));
    localStorage.setItem('haesol_user', JSON.stringify(updatedUser));
  };

  const themeColors: Record<ThemeColor, string> = {
    pink: '#ff80ab',
    navy: '#2c3e50',
    blue: '#3b82f6',
    lavender: '#9b59b6',
    green: '#2ecc71'
  };

  const getFontSizeClass = () => {
    if (fontSize === 'small') return 'text-[11px]';
    if (fontSize === 'medium') return 'text-[13px]';
    return 'text-[15px]';
  };

  const handleToggleTreeMember = (memberId: string) => {
    setSelectedTreeMembers(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleToggleDeptSelection = (deptName: string, members: any[]) => {
    const memberIds = members.map(m => {
      const u = usersList.find(ul => ul.name === m.name);
      return u?.id;
    }).filter(Boolean) as string[];

    if (memberIds.length === 0) return;

    const allSelected = memberIds.every(id => selectedTreeMembers.includes(id));
    if (allSelected) {
      setSelectedTreeMembers(prev => prev.filter(id => !memberIds.includes(id)));
    } else {
      setSelectedTreeMembers(prev => Array.from(new Set([...prev, ...memberIds])));
    }
  };

  const handleSendNote = () => {
    if (!customUser) return;
    setNoteReceivers(selectedTreeMembers);
    setNoteModalOpen(true);
  };

  const handleReplyNote = (note: Note) => {
    setNoteReceivers([note.senderId]);
    setNoteTitle(`Re: ${note.title}`);
    setNoteContent(`\n\n----- Original Message -----\nFrom: ${note.senderName}\nDate: ${note.timestamp?.toDate().toLocaleString()}\n\n${note.content}`);
    setNoteModalOpen(true);
  };

  const handleForwardNote = (note: Note) => {
    setNoteReceivers([]);
    setNoteTitle(`Fwd: ${note.title}`);
    setNoteContent(`\n\n----- Forwarded Message -----\nFrom: ${note.senderName}\nDate: ${note.timestamp?.toDate().toLocaleString()}\n\n${note.content}`);
    setNoteModalOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      setSelectedNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const submitNote = async () => {
    if (!customUser) return;
    if (!noteTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (noteReceivers.length === 0) {
      alert('받는 사람을 선택해주세요.');
      return;
    }
    if (!noteContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      await addDoc(collection(db, 'notes'), {
        senderId: customUser.id,
        senderName: customUser.name,
        receiverIds: noteReceivers,
        title: noteTitle,
        content: noteContent,
        timestamp: serverTimestamp(),
        isRead: false
      });
      alert('쪽지를 성공적으로 보냈습니다.');
      setNoteModalOpen(false);
      setNoteTitle('');
      setNoteContent('');
      setNoteReceivers([]);
      setSelectedTreeMembers([]); // Clear selection after sending
    } catch (e) {
      console.error("Error sending note: ", e);
      alert('쪽지 전송 중 오류가 발생했습니다: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  useEffect(() => {
    if (!customUser) return;
    
    // Reset initial load flag for new user/session
    isInitialNotesLoad.current = true;
    
    const q = query(collection(db, 'notes'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nts: Note[] = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !isInitialNotesLoad.current) {
          const data = change.doc.data();
          if (data.senderId !== customUser.id && data.receiverIds.includes(customUser.id)) {
            setUnreadCounts(prev => ({
              ...prev,
              'notes': (prev['notes'] || 0) + 1
            }));
            
            if (Notification.permission === 'granted' && document.hidden) {
              new Notification(`새 쪽지: ${data.senderName}`, {
                body: data.title,
              });
            }
            addToast(`새 쪽지: ${data.senderName}`, data.title, 'note');
          }
        }
      });

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.senderId === customUser.id || data.receiverIds.includes(customUser.id)) {
          nts.push({ id: doc.id, ...data } as Note);
        }
      });
      setNotes(nts);
      
      if (isInitialNotesLoad.current) {
        isInitialNotesLoad.current = false;
      }
    });
    return () => unsubscribe();
  }, [customUser]);

  if (!customUser) {
    return (
      <div className="flex h-screen bg-[#e8f0fe] items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-200">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#3b82f6] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">메이플 메신저</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="text" 
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all text-sm"
                placeholder="아이디"
              />
            </div>
            <div>
              <input 
                type="password" 
                value={loginPw}
                onChange={e => setLoginPw(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all text-sm"
                placeholder="비밀번호"
              />
            </div>
            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="autoLogin" 
                checked={isAutoLogin} 
                onChange={e => setIsAutoLogin(e.target.checked)} 
                className="w-4 h-4 text-[#3b82f6] border-gray-300 rounded focus:ring-[#3b82f6] cursor-pointer"
              />
              <label htmlFor="autoLogin" className="text-sm text-gray-600 cursor-pointer select-none">자동 로그인</label>
            </div>
            {loginError && <p className="text-red-500 text-xs font-medium px-1">{loginError}</p>}
            <button type="submit" className="w-full bg-[#3b82f6] text-white font-bold py-3 rounded-lg shadow-sm hover:bg-blue-600 hover:shadow transition-all mt-2">
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-sm relative">
      
      {/* Left Pane (Buddy List Window) */}
      <div className="w-[400px] border-r border-gray-400 flex flex-col bg-white shrink-0 shadow-md z-10">
        {/* Header */}
        <div className="h-20 flex flex-col justify-between p-2 text-white" style={{ backgroundColor: themeColors[theme] }}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="relative cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                <img src={customUser.photo || DEFAULT_PROFILE_PIC} className="w-12 h-12 rounded-full border-2 border-white/50 object-cover bg-white" alt="profile" />
                <Settings size={14} className="absolute bottom-0 right-0 bg-gray-600 rounded-full p-0.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    className="bg-transparent text-white font-bold text-sm outline-none w-20 border-b border-transparent focus:border-white/30"
                    defaultValue={customUser.name}
                    onBlur={(e) => handleUpdateName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  />
                  <select 
                    className="bg-white/10 text-white text-[10px] rounded px-1 outline-none border-none cursor-pointer"
                    value={customUser.status || '수신가능'}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                  >
                    <option className="text-black">수신가능</option>
                    <option className="text-black">휴가</option>
                    <option className="text-black">사직요청</option>
                    <option className="text-black">자리비움</option>
                  </select>
                </div>
                <input 
                  type="text" 
                  placeholder="대화명을 입력하세요." 
                  className="bg-transparent text-white placeholder-white/70 outline-none text-xs mt-0.5 w-40 border-b border-white/20 focus:border-white/50"
                  defaultValue={customUser.role || ''}
                  onBlur={(e) => handleUpdateDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateDisplayName((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="relative">
                <Grid 
                  size={18} 
                  className="cursor-pointer hover:text-gray-200" 
                  title="테마 변경" 
                  onClick={() => setIsThemePickerOpen(!isThemePickerOpen)} 
                />
                {isThemePickerOpen && (
                  <div className="absolute right-0 top-6 flex bg-white border border-gray-300 shadow-xl p-2 rounded-md z-[100] gap-2">
                    {(['pink', 'navy', 'blue', 'lavender', 'green'] as ThemeColor[]).map(c => (
                      <div 
                        key={c} 
                        className="w-6 h-6 rounded-full cursor-pointer border border-gray-200 hover:scale-110 transition-transform" 
                        style={{ backgroundColor: themeColors[c] }}
                        onClick={() => {
                          setTheme(c);
                          setIsThemePickerOpen(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <Home size={18} className="cursor-pointer hover:text-gray-200" title="공지" onClick={() => openModal('1:1')} />
              <Smile size={18} className="cursor-pointer hover:text-gray-200" title="설문" onClick={() => { changeActiveChannel('global'); setViewMode('messenger'); }} />
              <CheckSquare size={18} className={`cursor-pointer hover:text-gray-200 ${activeChannelId === 'notes_management' ? 'text-blue-200' : ''}`} title="쪽지 관리함" onClick={() => { changeActiveChannel('notes_management'); setViewMode('messenger'); }} />
              <MessageCircle size={18} className="cursor-pointer hover:text-gray-200" title="메신저" onClick={() => setViewMode(viewMode === 'messenger' ? 'personnel' : 'messenger')} />
              <Save size={18} className="cursor-pointer hover:text-gray-200" title="저장" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-32 bg-[#f8f9fa] border-r border-gray-300 flex flex-col overflow-hidden text-[11px] text-gray-700">
            <div className="flex-1 overflow-y-auto">
              <div className={`p-2 border-b border-gray-300 flex justify-between items-center cursor-pointer ${viewMode === 'personnel' ? 'bg-white font-bold' : 'hover:bg-white'}`} onClick={() => setViewMode('personnel')}>
                조직도 <ChevronDown size={12} />
              </div>
              <div className="p-2 border-b border-gray-300 hover:bg-white cursor-pointer" onClick={() => openModal('1:1')}>1:1 채팅</div>
              <div 
                className={`p-2 border-b border-gray-300 hover:bg-white cursor-pointer relative ${activeChannelId === 'global' && viewMode === 'messenger' ? 'bg-white font-bold border-l-2 border-blue-500' : ''}`} 
                onClick={() => { changeActiveChannel('global'); setViewMode('messenger'); }}
              >
                전체채팅
              </div>
              <div 
                className={`p-2 border-b border-gray-300 hover:bg-white cursor-pointer relative ${activeChannelId === 'notes_management' && viewMode === 'messenger' ? 'bg-white font-bold border-l-2 border-blue-500' : ''}`} 
                onClick={() => { changeActiveChannel('notes_management'); setViewMode('messenger'); }}
              >
                <div className="flex justify-between items-center">
                  <span>쪽지 관리함</span>
                  {unreadCounts['notes'] > 0 && (
                    <span className="bg-red-500 text-white text-[9px] px-1 rounded-full min-w-[14px] text-center">
                      {unreadCounts['notes']}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2 border-b border-gray-300 hover:bg-white cursor-pointer" onClick={() => openModal('group')}>단체채팅</div>
              <div className="p-2 border-b border-gray-300 flex justify-between items-center hover:bg-white cursor-pointer" onClick={() => openModal('group')}>
                그룹채팅 <ChevronDown size={12} />
              </div>
              
              {/* Integrated Chat List */}
              <div className="bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 flex justify-between items-center">
                채팅방 목록
                <Plus size={10} className="cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
              </div>
              <div className="flex flex-col">
                {chatRooms.length === 0 && <div className="p-2 text-gray-400 italic text-[9px]">참여 중인 채팅방이 없습니다.</div>}
                {chatRooms.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => { changeActiveChannel(room.id); setViewMode('messenger'); setSelectedFile(null); setReplyingTo(null); }}
                    className={`p-2 border-b border-gray-200 cursor-pointer hover:bg-white flex flex-col gap-0.5 relative ${activeChannelId === room.id && viewMode === 'messenger' ? 'bg-white border-l-2 border-blue-500' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[10px] truncate">{room.name}</span>
                      {unreadCounts[room.id] > 0 && (
                        <span className="bg-red-500 text-white text-[8px] px-1 rounded-full min-w-[14px] text-center">
                          {unreadCounts[room.id]}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 truncate">{room.lastMessage || '...'}</span>
                  </div>
                ))}
              </div>

              <div className="p-2 border-b border-gray-300 hover:bg-white cursor-pointer" onClick={handleSendNote}>쪽지</div>
              <div className="p-2 border-b border-gray-300 hover:bg-white cursor-pointer flex justify-between items-center" onClick={() => { changeActiveChannel('notes_management'); setViewMode('messenger'); }}>
                <span>쪽지 관리함</span>
                {unreadCounts['notes'] > 0 && (
                  <span className="bg-red-500 text-white text-[8px] px-1 rounded-full min-w-[14px] text-center">
                    {unreadCounts['notes']}
                  </span>
                )}
              </div>
            </div>
            <div className="p-2 border-t border-gray-300 hover:bg-white cursor-pointer text-red-500 text-center text-[10px]" onClick={handleLogout}>로그아웃</div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-white">
            {viewMode === 'personnel' ? (
              <>
                {/* Search Bar Area */}
                <div className="p-1.5 border-b border-gray-300 flex gap-1 bg-gray-50">
                  <input type="text" placeholder="이름(아이디) 또는 그룹명 검색" className="flex-1 border border-gray-300 px-2 py-1 text-xs outline-none" />
                  <select 
                    className="border border-gray-300 px-1 py-1 text-xs outline-none bg-white"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as FontSize)}
                  >
                    <option value="small">작게</option>
                    <option value="medium">중간</option>
                    <option value="large">크게</option>
                  </select>
                </div>

                {/* Tree View */}
                <div className={`flex-1 overflow-y-auto p-2 font-sans ${getFontSizeClass()}`}>
                  <div className="flex items-center gap-1 mb-1 cursor-pointer select-none" onClick={() => toggleDept('root')}>
                    {expandedDepts['root'] !== false ? <MinusSquare size={14} className="text-gray-500" /> : <PlusSquare size={14} className="text-gray-500" />}
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5" 
                      checked={(() => {
                        const ids = Object.values(PERSONNEL_DATA).flatMap(tab => tab.flatMap(d => d.roles.flatMap(r => r.members))).map(m => usersList.find(ul => ul.name === m.name)?.id).filter(Boolean) as string[];
                        return ids.length > 0 && ids.every(id => selectedTreeMembers.includes(id));
                      })()}
                      onChange={e => {
                        e.stopPropagation();
                        const allMembers = Object.values(PERSONNEL_DATA).flatMap(tab => tab.flatMap(d => d.roles.flatMap(r => r.members)));
                        handleToggleDeptSelection('root', allMembers);
                      }} 
                      onClick={e => e.stopPropagation()}
                    />
                    <span className="font-bold">해솔병원</span>
                  </div>
                  
                  {expandedDepts['root'] !== false && (
                    <div className="ml-1.5 border-l border-dotted border-gray-300 pl-3">
                      {(['의료진', '간호사', '원무과'] as TabType[]).map((tab) => (
                        <div key={tab} className="mb-1">
                          <div className="flex items-center gap-1 cursor-pointer py-0.5 select-none" onClick={() => toggleDept(tab)}>
                            {expandedDepts[tab] ? <MinusSquare size={14} className="text-gray-500" /> : <PlusSquare size={14} className="text-gray-500" />}
                            <input 
                              type="checkbox" 
                              className="w-3.5 h-3.5" 
                              checked={(() => {
                                const ids = PERSONNEL_DATA[tab].flatMap(d => d.roles.flatMap(r => r.members)).map(m => usersList.find(ul => ul.name === m.name)?.id).filter(Boolean) as string[];
                                return ids.length > 0 && ids.every(id => selectedTreeMembers.includes(id));
                              })()}
                              onChange={e => {
                                e.stopPropagation();
                                const allMembers = PERSONNEL_DATA[tab].flatMap(d => d.roles.flatMap(r => r.members));
                                handleToggleDeptSelection(tab, allMembers);
                              }} 
                              onClick={e => e.stopPropagation()}
                            />
                            <span className="font-bold">{tab}</span>
                          </div>
                          
                          {expandedDepts[tab] && (
                            <div className="ml-1.5 border-l border-dotted border-gray-300 pl-3">
                              {PERSONNEL_DATA[tab].map((dept) => (
                                <div key={dept.dept} className="mb-0.5">
                                  <div className="flex items-center gap-1 cursor-pointer py-0.5 select-none" onClick={() => toggleDept(dept.dept)}>
                                    {expandedDepts[dept.dept] ? <MinusSquare size={14} className="text-gray-500" /> : <PlusSquare size={14} className="text-gray-500" />}
                                    <input 
                                      type="checkbox" 
                                      className="w-3.5 h-3.5" 
                                      checked={(() => {
                                        const ids = dept.roles.flatMap(r => r.members).map(m => usersList.find(ul => ul.name === m.name)?.id).filter(Boolean) as string[];
                                        return ids.length > 0 && ids.every(id => selectedTreeMembers.includes(id));
                                      })()}
                                      onChange={e => {
                                        e.stopPropagation();
                                        const allMembers = dept.roles.flatMap(r => r.members);
                                        handleToggleDeptSelection(dept.dept, allMembers);
                                      }} 
                                      onClick={e => e.stopPropagation()}
                                    />
                                    <span className="font-bold">{dept.dept} ({dept.count})</span>
                                  </div>
                                  
                                  {expandedDepts[dept.dept] && (
                                    <div className="ml-1.5 border-l border-dotted border-gray-300 pl-3">
                                      {dept.roles.map((roleGroup, idx) => (
                                        <React.Fragment key={idx}>
                                          {roleGroup.role && (
                                            <div className="flex items-center gap-1 cursor-pointer py-0.5 select-none" onClick={() => toggleRole(dept.dept, roleGroup.role)}>
                                              {expandedRoles[`${dept.dept}-${roleGroup.role}`] ? <MinusSquare size={14} className="text-gray-500" /> : <PlusSquare size={14} className="text-gray-500" />}
                                              <input 
                                                type="checkbox" 
                                                className="w-3.5 h-3.5" 
                                                checked={(() => {
                                                  const ids = roleGroup.members.map(m => usersList.find(ul => ul.name === m.name)?.id).filter(Boolean) as string[];
                                                  return ids.length > 0 && ids.every(id => selectedTreeMembers.includes(id));
                                                })()}
                                                onChange={e => {
                                                  e.stopPropagation();
                                                  handleToggleDeptSelection(`${dept.dept}-${roleGroup.role}`, roleGroup.members);
                                                }} 
                                                onClick={e => e.stopPropagation()}
                                              />
                                              <span>{roleGroup.role}</span>
                                            </div>
                                          )}
                                          
                                          {(!roleGroup.role || expandedRoles[`${dept.dept}-${roleGroup.role}`]) && (
                                            <div className={roleGroup.role ? "ml-1.5 border-l border-dotted border-gray-300 pl-3" : ""}>
                                              {roleGroup.members.map((member, mIdx) => {
                                                const u = usersList.find(ul => ul.name === member.name);
                                                const isSelected = u ? selectedTreeMembers.includes(u.id) : false;
                                                return (
                                                  <div key={mIdx} className={`flex items-center gap-1 py-0.5 hover:bg-blue-50 cursor-pointer select-none ${isSelected ? 'bg-blue-50' : ''}`} onDoubleClick={() => handleCreateChatFromTree(member)}>
                                                    <input 
                                                      type="checkbox" 
                                                      className="w-3.5 h-3.5" 
                                                      checked={isSelected}
                                                      onChange={() => u && handleToggleTreeMember(u.id)}
                                                      onClick={e => e.stopPropagation()} 
                                                    />
                                                    {u?.status === '수신가능' || (!u?.status && member.status === 'online') ? (
                                                      <User size={14} className="text-blue-500 fill-blue-500" />
                                                    ) : (
                                                      <div className="relative">
                                                        <User size={14} className="text-gray-400" />
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                      </div>
                                                    )}
                                                    <span className="text-gray-800">{member.name}</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Chat List View */}
                <div className="p-2 border-b border-gray-300 bg-gray-50 font-bold text-sm flex justify-between items-center relative">
                  <span>채팅 리스트</span>
                  <Plus size={16} className="cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
                  {isDropdownOpen && (
                    <div className="absolute top-8 right-2 bg-white border border-gray-300 shadow-md z-50 w-32 py-1 text-xs font-normal">
                      <div className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer" onClick={() => openModal('1:1')}>1:1 메시지</div>
                      <div className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer" onClick={() => { changeActiveChannel('global'); setIsDropdownOpen(false); }}>전체 메시지</div>
                      <div className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer" onClick={() => openModal('group')}>그룹 메시지</div>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {chatRooms.map(room => (
                    <div 
                      key={room.id}
                      onClick={() => { changeActiveChannel(room.id); setSelectedFile(null); setReplyingTo(null); }}
                      className={`p-2 border-b border-gray-200 cursor-pointer hover:bg-blue-50 flex flex-col gap-1 ${activeChannelId === room.id ? 'bg-blue-100' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs truncate">{room.name}</span>
                        {room.isGroup && room.id !== 'global' && <span className="text-[10px] text-gray-500">{room.participants.length}명</span>}
                      </div>
                      <span className="text-[10px] text-gray-500 truncate">{room.lastMessage || '새로운 채팅방'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane (Chat Area) */}
      <div className="flex-1 flex flex-col bg-white relative">
        {activeChannelId === 'notes_management' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Note Management View */}
            <div className="h-[60px] border-b border-gray-300 text-white flex items-center px-4 gap-2 shadow-sm" style={{ backgroundColor: themeColors[theme] }}>
              <div className="flex items-center gap-2 mr-6">
                <Mail size={24} />
                <span className="font-bold text-xl tracking-tight">쪽지 관리함</span>
              </div>
              <div className="flex items-center h-full pt-2">
                <div 
                  className={`px-5 py-2 text-sm font-bold cursor-pointer rounded-t-lg transition-colors ${noteTab === 'inbox' ? 'bg-white text-gray-800' : 'hover:bg-white/10 text-white/80'}`} 
                  onClick={() => setNoteTab('inbox')}
                >
                  받은 쪽지
                </div>
                <div 
                  className={`px-5 py-2 text-sm font-bold cursor-pointer rounded-t-lg transition-colors ${noteTab === 'sent' ? 'bg-white text-gray-800' : 'hover:bg-white/10 text-white/80'}`} 
                  onClick={() => setNoteTab('sent')}
                >
                  보낸 쪽지
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="쪽지 검색..." 
                    className="bg-white/20 text-white placeholder:text-white/60 text-xs px-4 py-2 rounded-full outline-none w-56 focus:bg-white focus:text-black focus:placeholder:text-gray-400 transition-all border border-white/10" 
                    value={noteSearchQuery}
                    onChange={(e) => setNoteSearchQuery(e.target.value)}
                  />
                  <Search size={14} className="absolute right-4 text-white/60" />
                </div>
                <button 
                  className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center" 
                  title="새 쪽지 쓰기" 
                  onClick={() => setNoteModalOpen(true)}
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden bg-gray-50">
              {/* Note List */}
              <div className="w-[450px] border-r border-gray-300 overflow-y-auto bg-white shadow-inner">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 sticky top-0 border-b border-gray-300 z-10">
                    <tr>
                      <th className="w-10 p-3"></th>
                      <th className="p-3 text-left border-r border-gray-200 font-bold text-gray-600">{noteTab === 'inbox' ? '보낸사람' : '받는사람'}</th>
                      <th className="p-3 text-left border-r border-gray-200 font-bold text-gray-600">제목</th>
                      <th className="p-3 text-left font-bold text-gray-600">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.filter(n => {
                      const isRecipient = noteTab === 'inbox' ? n.receiverIds.includes(customUser.id) : n.senderId === customUser.id;
                      const matchesSearch = n.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) || n.content.toLowerCase().includes(noteSearchQuery.toLowerCase()) || n.senderName.toLowerCase().includes(noteSearchQuery.toLowerCase());
                      return isRecipient && matchesSearch;
                    }).map(note => (
                      <tr 
                        key={note.id} 
                        className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50 ${selectedNote?.id === note.id ? 'bg-blue-100' : ''}`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <td className="p-3 text-center">
                          <Star size={14} className="text-gray-300 hover:text-yellow-400 cursor-pointer" />
                        </td>
                        <td className="p-3 border-r border-gray-100 truncate max-w-[100px] font-medium">
                          {noteTab === 'inbox' ? note.senderName : `${note.receiverIds.length}명`}
                        </td>
                        <td className="p-3 border-r border-gray-100 truncate max-w-[200px]">
                          {note.title}
                        </td>
                        <td className="p-3 text-gray-400 text-xs whitespace-nowrap">
                          {note.timestamp?.toDate().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                    {notes.filter(n => {
                      const isRecipient = noteTab === 'inbox' ? n.receiverIds.includes(customUser.id) : n.senderId === customUser.id;
                      const matchesSearch = n.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) || n.content.toLowerCase().includes(noteSearchQuery.toLowerCase()) || n.senderName.toLowerCase().includes(noteSearchQuery.toLowerCase());
                      return isRecipient && matchesSearch;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-gray-400 italic">표시할 쪽지가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Note Detail */}
              <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col shadow-lg m-4 rounded-lg border border-gray-200">
                {selectedNote ? (
                  <>
                    <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedNote.title}</h2>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex gap-2">
                            <span className="text-gray-400 font-bold">일시</span>
                            <span className="text-gray-600">{selectedNote.timestamp?.toDate().toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-400 font-bold">{noteTab === 'inbox' ? '보낸사람' : '받는사람'}</span>
                            <span className="text-blue-600 font-bold">{noteTab === 'inbox' ? selectedNote.senderName : selectedNote.receiverIds.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-md border border-gray-200">
                        <span className="text-xs text-gray-500 font-bold">글자 크기</span>
                        <select 
                          className="text-xs border border-gray-300 px-2 py-1 rounded outline-none bg-white font-medium"
                          value={noteFontSize}
                          onChange={(e) => setNoteFontSize(e.target.value)}
                        >
                          <option value="12px">작게 (9pt)</option>
                          <option value="14px">보통 (10pt)</option>
                          <option value="16px">크게 (12pt)</option>
                          <option value="18px">매우 크게 (14pt)</option>
                          <option value="24px">대형 (18pt)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex-1 whitespace-pre-wrap leading-relaxed text-gray-700 bg-gray-50/30 p-4 rounded-md" style={{ fontSize: noteFontSize }}>
                      {selectedNote.content}
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                      <button 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm"
                        onClick={() => handleReplyNote(selectedNote)}
                      >
                        <Reply size={16} /> 회신하기
                      </button>
                      <button 
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => handleForwardNote(selectedNote)}
                      >
                        <Forward size={16} /> 전달
                      </button>
                      <button 
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-md text-sm font-bold hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteNote(selectedNote.id)}
                      >
                        <Trash2 size={16} /> 삭제
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                    <Mail size={64} className="mb-4 opacity-20" />
                    <p className="text-xl font-bold opacity-50">목록에서 쪽지를 선택하여 내용을 확인하세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeChannelId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-300 py-3 px-4 font-bold text-lg shadow-sm flex items-center justify-between">
              <span>{chatRooms.find(r => r.id === activeChannelId)?.name || '채팅방'}</span>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f3f4f6]">
              {filteredMessages.map((msg) => {
                const isMe = msg.senderId === customUser.id;
                const senderUser = usersList.find(u => u.id === msg.senderId);
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 overflow-hidden flex-shrink-0 flex items-center justify-center mt-1">
                        <img src={senderUser?.photo || DEFAULT_PROFILE_PIC} alt="profile" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}>
                      <span className="text-xs text-gray-500 mb-1">{msg.senderName} {senderUser?.role ? `(${senderUser.role})` : ''}</span>
                      <div className="flex items-center gap-2">
                        {isMe && (
                          <div className="hidden group-hover:flex items-center gap-1 text-gray-400">
                            {msg.text && <button onClick={() => handleCopyMessage(msg.text)} title="복사"><Copy size={14} className="hover:text-black"/></button>}
                            <button onClick={() => setReplyingTo(msg)} title="답장"><Reply size={14} className="hover:text-black"/></button>
                            <button onClick={() => openForwardModal(msg)} title="전달"><Forward size={14} className="hover:text-black"/></button>
                            <button onClick={() => handleDeleteMessage(msg.id)} title="삭제"><Trash2 size={14} className="hover:text-red-500"/></button>
                          </div>
                        )}
                        <div className={`px-3 py-2 border border-gray-300 rounded-lg max-w-[70%] shadow-sm ${isMe ? 'bg-[#fff59d]' : 'bg-white'}`}>
                          {msg.replyTo && (
                            <div className="mb-2 p-2 bg-black/5 rounded text-sm border-l-2 border-black/20 flex flex-col">
                              <span className="font-bold text-xs">{msg.replyTo.senderName}</span>
                              <span className="text-gray-600 truncate">{msg.replyTo.text}</span>
                            </div>
                          )}
                          {msg.file && (
                            <div className="mb-2">
                              {msg.file.type.startsWith('image/') ? (
                                <img src={msg.file.data} alt={msg.file.name} className="max-w-full rounded border border-gray-300 max-h-48 object-contain" />
                              ) : (
                                <a href={msg.file.data} download={msg.file.name} className="flex items-center gap-2 p-2 bg-black/5 rounded hover:bg-black/10 transition-colors">
                                  <FileText size={24} className="text-gray-600" />
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold truncate">{msg.file.name}</span>
                                    <span className="text-xs text-gray-500">{(msg.file.size / 1024).toFixed(1)} KB</span>
                                  </div>
                                </a>
                              )}
                            </div>
                          )}
                          {msg.text && <div className="whitespace-pre-wrap break-words text-sm">{msg.text}</div>}
                        </div>
                        {!isMe && (
                          <div className="hidden group-hover:flex items-center gap-1 text-gray-400">
                            {msg.text && <button onClick={() => handleCopyMessage(msg.text)} title="복사"><Copy size={14} className="hover:text-black"/></button>}
                            <button onClick={() => setReplyingTo(msg)} title="답장"><Reply size={14} className="hover:text-black"/></button>
                            <button onClick={() => openForwardModal(msg)} title="전달"><Forward size={14} className="hover:text-black"/></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-300 flex items-center justify-between">
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold">{replyingTo.senderName}에게 답장</span>
                  <span className="text-sm text-gray-600 truncate">{replyingTo.text || '(파일)'}</span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:bg-gray-200 p-1 rounded">
                  <X size={16} />
                </button>
              </div>
            )}
            {selectedFile && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip size={16} className="text-gray-500" />
                  <span className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="p-4 border-t border-gray-300 bg-white">
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  title="파일 첨부 (최대 500KB)"
                >
                  <Paperclip size={20} />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2.5 pl-4 pr-12 outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="메시지를 입력하세요..."
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim() && !selectedFile}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 disabled:opacity-30"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p>조직도에서 대화할 상대를 더블클릭하거나<br/>메신저 탭에서 채팅방을 선택하세요.</p>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-gray-200 shadow-2xl rounded-lg p-4 w-72 pointer-events-auto flex gap-3 items-start border-l-4 border-blue-500"
            >
              <div className={`p-2 rounded-full ${toast.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {toast.type === 'message' ? <MessageCircle size={18} /> : <Mail size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate">{toast.title}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{toast.body}</p>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* User Selection Modal */}
      {modalType && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[150]">
          <div className="bg-white border border-gray-300 rounded shadow-xl w-[400px] flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-3 border-b border-gray-300 bg-[#3b82f6] text-white rounded-t">
              <h2 className="font-bold text-sm">
                {modalType === '1:1' ? '1:1 채팅 대상 선택' : modalType === 'bulk' ? '단체 메시지 대상 선택' : modalType === 'forward' ? '메시지 전달 대상 선택' : modalType === 'note_receivers' ? '쪽지 대상 선택' : '그룹 채팅 대상 선택'}
              </h2>
              <button onClick={closeModal} className="hover:text-gray-200"><X size={18} /></button>
            </div>
            
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <input 
                type="text" 
                placeholder="이름 검색..." 
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full border border-gray-300 p-1.5 outline-none text-sm"
              />
            </div>

            {modalType === 'group' && (
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <label className="block text-xs font-bold mb-1">그룹 채팅방 이름</label>
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={e => setGroupNameInput(e.target.value)}
                  className="w-full border border-gray-300 p-1.5 outline-none text-sm"
                  placeholder="채팅방 이름을 입력하세요 (선택)"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2">
              {usersList.filter(u => u.id !== customUser.id && u.name.includes(userSearchQuery)).map(u => {
                const isSelected = selectedUsers.includes(u.id);
                return (
                  <div 
                    key={u.id} 
                    onClick={() => toggleUserSelection(u.id)}
                    className="flex items-center gap-3 p-2 hover:bg-blue-50 cursor-pointer rounded"
                  >
                    <div className={`w-4 h-4 border border-gray-400 rounded-sm flex items-center justify-center ${isSelected ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-white'}`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden border border-gray-300">
                        <img src={u.photo || DEFAULT_PROFILE_PIC} alt="profile" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{u.name}</span>
                        {u.role && <span className="text-xs text-gray-500">{u.role}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {modalType === 'bulk' && (
              <div className="p-3 border-t border-gray-300 bg-gray-50">
                <label className="block text-xs font-bold mb-1">보낼 메시지</label>
                <textarea 
                  value={bulkMessageText}
                  onChange={e => setBulkMessageText(e.target.value)}
                  className="w-full border border-gray-300 p-2 outline-none resize-none h-20 text-sm"
                  placeholder="선택한 인원들에게 개별적으로 전송될 메시지를 입력하세요."
                />
              </div>
            )}

            <div className="p-3 border-t border-gray-300 flex justify-end gap-2 bg-gray-100 rounded-b">
              <button onClick={closeModal} className="px-3 py-1.5 border border-gray-400 bg-white rounded text-xs hover:bg-gray-50">취소</button>
              <button 
                onClick={handleCreateChat}
                disabled={selectedUsers.length === 0 || (modalType === 'bulk' && !bulkMessageText.trim()) || (modalType === 'forward' && !forwardMessage)}
                className="px-3 py-1.5 bg-[#3b82f6] text-white border border-[#2563eb] rounded text-xs hover:bg-blue-600 disabled:opacity-50"
              >
                {modalType === 'bulk' ? '전송' : modalType === 'forward' ? '전달' : modalType === 'note_receivers' ? '추가' : '채팅방 생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Send Modal (Image 1 style) */}
      {noteModalOpen && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-[100]">
          <div className="bg-white border border-gray-400 shadow-2xl w-[600px] flex flex-col rounded-sm overflow-hidden">
            <div className="bg-[#2c3e50] text-white p-2 flex justify-between items-center">
              <span className="text-xs font-bold">메시지 전송</span>
              <div className="flex gap-1">
                <button className="hover:bg-white/20 p-0.5 rounded"><MinusSquare size={14} /></button>
                <button className="hover:bg-white/20 p-0.5 rounded"><PlusSquare size={14} /></button>
                <button onClick={() => setNoteModalOpen(false)} className="hover:bg-red-500 p-0.5 rounded"><X size={14} /></button>
              </div>
            </div>

            <div className="flex bg-[#4b5563] p-4 gap-4 items-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
                <img src={customUser.photo || DEFAULT_PROFILE_PIC} alt="profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs w-12 font-bold">제 목</span>
                  <input 
                    type="text" 
                    className="flex-1 bg-white border border-gray-400 px-2 py-1 text-xs outline-none rounded-sm" 
                    placeholder="제목을 입력하세요."
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs w-12 font-bold">받는사람</span>
                  <div className="flex-1 bg-white border border-gray-400 px-2 py-1 text-xs min-h-[26px] flex flex-wrap gap-1 rounded-sm items-center">
                    {noteReceivers.map(id => {
                      const u = usersList.find(ul => ul.id === id);
                      return (
                        <span key={id} className="bg-gray-100 border border-gray-300 px-1 rounded-sm flex items-center gap-1">
                          {u?.name} <X size={10} className="cursor-pointer" onClick={() => setNoteReceivers(prev => prev.filter(rid => rid !== id))} />
                        </span>
                      );
                    })}
                    <button 
                      onClick={() => {
                        setModalType('note_receivers');
                        setSelectedUsers([]);
                        setUserSearchQuery('');
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-14">
                   <label className="flex items-center gap-1 text-white text-[10px] cursor-pointer">
                     <input type="checkbox" className="w-3 h-3" /> 예약전송
                   </label>
                   <label className="flex items-center gap-1 text-white text-[10px] cursor-pointer">
                     <input type="checkbox" className="w-3 h-3" /> 나에게 보내기
                   </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 border-b border-gray-300 p-1 flex items-center gap-2">
              <select className="text-[10px] border border-gray-300 px-1 py-0.5 outline-none bg-white"><option>나눔고딕</option></select>
              <select 
                className="text-[10px] border border-gray-300 px-1 py-0.5 outline-none bg-white"
                value={noteFontSize}
                onChange={(e) => setNoteFontSize(e.target.value)}
              >
                <option value="12px">9pt</option>
                <option value="14px">10pt</option>
                <option value="16px">12pt</option>
                <option value="18px">14pt</option>
                <option value="24px">18pt</option>
              </select>
              <div className="flex gap-1 border-l border-gray-300 pl-2">
                <button className="p-1 hover:bg-gray-200 rounded-sm font-bold text-xs">A+</button>
                <button className="p-1 hover:bg-gray-200 rounded-sm font-bold text-xs italic">I</button>
                <button className="p-1 hover:bg-gray-200 rounded-sm font-bold text-xs underline">U</button>
              </div>
            </div>

            <textarea 
              className="flex-1 p-4 text-sm outline-none resize-none min-h-[200px]"
              style={{ fontSize: noteFontSize }}
              placeholder="내용을 입력하세요."
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
            />

            <div className="bg-gray-100 p-2 flex justify-between items-center border-t border-gray-300">
              <div className="flex gap-1">
                <button className="px-2 py-1 bg-white border border-gray-300 text-[10px] rounded-sm hover:bg-gray-50">파일첨부</button>
                <button className="px-2 py-1 bg-white border border-gray-300 text-[10px] rounded-sm hover:bg-gray-50">편지</button>
                <button className="px-2 py-1 bg-white border border-gray-300 text-[10px] rounded-sm hover:bg-gray-50">스티커</button>
                <button className="px-2 py-1 bg-white border border-gray-300 text-[10px] rounded-sm hover:bg-gray-50">채팅하기</button>
              </div>
              <div className="flex gap-1">
                <button onClick={submitNote} className="px-4 py-1 bg-white border border-gray-400 text-[10px] font-bold rounded-sm hover:bg-gray-50">보내기</button>
                <button onClick={() => setNoteModalOpen(false)} className="px-4 py-1 bg-white border border-gray-400 text-[10px] font-bold rounded-sm hover:bg-gray-50">닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isProfileModalOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-300 rounded shadow-xl w-[350px] flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-gray-300 bg-[#3b82f6] text-white rounded-t">
              <h2 className="font-bold text-sm">프로필 설정</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="hover:text-gray-200"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full border-2 border-[#3b82f6] overflow-hidden flex items-center justify-center bg-gray-100">
                  <img src={profileEdit.photo || DEFAULT_PROFILE_PIC} alt="preview" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">프로필 사진 URL</label>
                <input type="text" value={profileEdit.photo} onChange={e => setProfileEdit({...profileEdit, photo: e.target.value})} className="w-full border border-gray-300 p-1.5 outline-none text-sm" placeholder="이미지 URL을 입력하세요" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">비밀번호 변경</label>
                <input type="password" value={profileEdit.pw} onChange={e => setProfileEdit({...profileEdit, pw: e.target.value})} className="w-full border border-gray-300 p-1.5 outline-none text-sm" placeholder="새 비밀번호" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">직급 변경</label>
                <input type="text" value={profileEdit.role} onChange={e => setProfileEdit({...profileEdit, role: e.target.value})} className="w-full border border-gray-300 p-1.5 outline-none text-sm" placeholder="예: 과장, 전문의" />
              </div>
            </div>
            <div className="p-3 border-t border-gray-300 flex justify-between items-center bg-gray-100 rounded-b">
              <button onClick={handleDeleteAccount} className="text-red-500 hover:text-red-600 text-xs hover:underline">회원탈퇴</button>
              <div className="flex gap-2">
                <button onClick={() => setIsProfileModalOpen(false)} className="px-3 py-1.5 border border-gray-400 bg-white rounded text-xs hover:bg-gray-50">취소</button>
                <button onClick={handleSaveProfile} className="px-3 py-1.5 bg-[#3b82f6] text-white border border-[#2563eb] rounded text-xs hover:bg-blue-600">저장</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white border border-gray-300 rounded p-5 w-72 text-center shadow-xl">
            <h3 className="text-sm font-bold mb-2 text-red-500">회원탈퇴</h3>
            <p className="text-xs text-gray-600 mb-5">정말로 탈퇴하시겠습니까?<br/>모든 정보가 삭제되며 복구할 수 없습니다.</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 border border-gray-400 bg-white rounded text-xs hover:bg-gray-50">취소</button>
              <button onClick={executeDeleteAccount} className="px-3 py-1.5 bg-red-500 text-white border border-red-600 rounded text-xs hover:bg-red-600">탈퇴하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
