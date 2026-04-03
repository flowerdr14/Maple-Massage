import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, ChevronDown, ChevronRight, Plus, Send, MessageSquare, Users, X, Check, Paperclip, FileText } from 'lucide-react';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';

type CustomUser = { name: string, id: string, pw: string, photo?: string, role?: string };

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

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('personnel');
  const [activeTab, setActiveTab] = useState<TabType>('의료진');
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({ '응급의학과 EM': true });
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({ '응급의학과 EM-과장': true, '응급의학과 EM-전문의': true, '응급의학과 EM-레지던트': true });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Auth State
  const [usersList, setUsersList] = useState<CustomUser[]>(INITIAL_USERS);
  const [customUser, setCustomUser] = useState<CustomUser | null>(null);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedFile, setSelectedFile] = useState<{name: string, type: string, data: string, size: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [modalType, setModalType] = useState<'1:1' | 'bulk' | 'group' | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkMessageText, setBulkMessageText] = useState('');
  const [groupNameInput, setGroupNameInput] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

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

    const savedUser = localStorage.getItem('haesol_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (!deletedUsers.includes(parsed.id)) {
        const latestUser = merged.find(u => u.id === parsed.id) || parsed;
        setCustomUser(latestUser);
      } else {
        localStorage.removeItem('haesol_user');
      }
    }
  }, []);

  useEffect(() => {
    if (!customUser) return;
    
    // Listen to all messages where the user is a participant or it's a global message
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      const roomsMap = new Map<string, ChatRoom>();
      
      // Add global room
      roomsMap.set('global', { id: 'global', name: '전체 메시지', participants: [], isGroup: true });

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

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => unsubscribe();
  }, [customUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const user = usersList.find(u => u.id === loginId && u.pw === loginPw);
    if (user) {
      setCustomUser(user);
      localStorage.setItem('haesol_user', JSON.stringify(user));
    } else {
      setLoginError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLogout = () => {
    setCustomUser(null);
    setActiveChannelId(null);
    localStorage.removeItem('haesol_user');
  };

  const handleSaveProfile = () => {
    if (!customUser) return;
    const updatedUser = { ...customUser, pw: profileEdit.pw, photo: profileEdit.photo, role: profileEdit.role };
    setCustomUser(updatedUser);
    localStorage.setItem('haesol_user', JSON.stringify(updatedUser));

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
    handleLogout();
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
        senderId: customUser.id,
        senderName: customUser.name,
        channelId: activeChannelId,
        participants: activeRoom.participants,
        channelName: activeRoom.name,
        isGroup: activeRoom.isGroup,
        timestamp: serverTimestamp(),
      });
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
      setActiveChannelId(channelId);
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
      setActiveChannelId(channelId);
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
    }
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
      setSelectedUsers([userId]);
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

  if (!customUser) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 border border-black">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#5cb85c]">Maple Massenger</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">아이디</label>
              <input 
                type="text" 
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className="w-full border border-black p-2 rounded outline-none focus:ring-2 focus:ring-[#5cb85c]"
                placeholder="아이디를 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">비밀번호</label>
              <input 
                type="password" 
                value={loginPw}
                onChange={e => setLoginPw(e.target.value)}
                className="w-full border border-black p-2 rounded outline-none focus:ring-2 focus:ring-[#5cb85c]"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm font-bold">{loginError}</p>}
            <button type="submit" className="w-full bg-[#5cb85c] text-white font-bold py-2 rounded border border-black hover:bg-green-700">
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans text-sm relative">
      
      {/* Global Navigation */}
      <div className="w-16 bg-gray-100 border-r border-black flex flex-col items-center py-4 gap-4">
        <button 
          onClick={() => { setViewMode('personnel'); setActiveChannelId(null); setSelectedFile(null); }}
          className={`p-3 rounded-lg border border-black ${viewMode === 'personnel' ? 'bg-[#5cb85c] text-white' : 'bg-white hover:bg-gray-50'}`}
          title="인원리스트"
        >
          <Users size={24} />
        </button>
        <button 
          onClick={() => setViewMode('messenger')}
          className={`p-3 rounded-lg border border-black ${viewMode === 'messenger' ? 'bg-[#C8E6C9]' : 'bg-white hover:bg-gray-50'}`}
          title="메신저"
        >
          <MessageSquare size={24} />
        </button>
        <div className="mt-auto flex flex-col items-center gap-4 w-full px-2 pb-2">
          <button
            onClick={() => {
              setProfileEdit({ pw: customUser.pw, photo: customUser.photo || '', role: customUser.role || '' });
              setIsProfileModalOpen(true);
            }}
            className="w-10 h-10 rounded-full bg-white border border-black overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-[#5cb85c] transition-all"
            title="프로필 설정"
          >
            {customUser.photo ? (
              <img src={customUser.photo} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-gray-600" />
            )}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Left Pane (List Area) */}
      <div className="w-[350px] border-r border-black flex flex-col bg-white">
        
        {viewMode === 'personnel' ? (
          <>
            {/* Personnel Header */}
            <div className="bg-[#5cb85c] text-white text-center py-2 border-b border-black font-bold text-base">
              인원리스트
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-black">
              {(['의료진', '간호사', '원무과'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-center border-r border-black last:border-r-0 font-medium ${
                    activeTab === tab ? 'bg-[#dcedc8]' : 'bg-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="p-2 border-b border-black">
              <input 
                type="text" 
                className="w-full border border-black p-1.5 outline-none"
              />
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-2">
              {PERSONNEL_DATA[activeTab].length === 0 ? (
                <div className="flex items-center justify-center h-full text-black font-medium">
                  인원이 없습니다.
                </div>
              ) : (
                <div className="space-y-1">
                  {PERSONNEL_DATA[activeTab].map((dept) => (
                    <div key={dept.dept} className="select-none">
                      {/* Department Row */}
                      <div 
                        className="flex items-center gap-1 cursor-pointer py-1 font-bold"
                        onClick={() => toggleDept(dept.dept)}
                      >
                        {expandedDepts[dept.dept] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span>{dept.dept} {dept.count > 0 && `(${dept.count})`}</span>
                      </div>

                      {/* Roles & Members */}
                      {expandedDepts[dept.dept] && (
                        <div className="ml-4">
                          {dept.roles.map((roleGroup, idx) => (
                            <div key={idx}>
                              {/* Role Row (if role exists) */}
                              {roleGroup.role && (
                                <div 
                                  className="flex items-center gap-1 cursor-pointer py-1 font-bold"
                                  onClick={() => toggleRole(dept.dept, roleGroup.role)}
                                >
                                  {expandedRoles[`${dept.dept}-${roleGroup.role}`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  <span>{roleGroup.role} ({roleGroup.members.length})</span>
                                </div>
                              )}

                              {/* Members Row */}
                              {(!roleGroup.role || expandedRoles[`${dept.dept}-${roleGroup.role}`]) && (
                                <div className={roleGroup.role ? "ml-5" : "ml-1"}>
                                  {roleGroup.members.map((member, mIdx) => (
                                    <div key={mIdx} className="flex items-center gap-2 py-1">
                                      <div className="relative flex items-center justify-center text-[#4a148c]">
                                        <User size={16} className="fill-current" />
                                        {member.status === 'away' && (
                                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#ff5252] rounded-full border border-white flex items-center justify-center">
                                            <div className="w-1.5 h-[2px] bg-white rounded-full" />
                                          </div>
                                        )}
                                      </div>
                                      <span className="font-bold">{member.name}</span>
                                      {member.desc && (
                                        <>
                                          <span className="text-gray-500">/</span>
                                          <span className="font-bold">{member.desc}</span>
                                        </>
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
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Messenger Header */}
            <div className="bg-[#C8E6C9] text-black text-center py-2 border-b border-black font-bold text-base">
              메신저
            </div>
            
            {/* Chat List Header */}
            <div className="bg-[#a5d6a7] text-black py-2 px-3 border-b border-black font-bold flex justify-between items-center relative">
              <span>채팅 리스트</span>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <Plus size={20} strokeWidth={3} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full right-2 mt-1 bg-white border border-black rounded-md shadow-lg z-50 w-32 py-1">
                  <button onClick={() => openModal('1:1')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-sm">1 : 1 메시지</button>
                  <button onClick={() => { setActiveChannelId('global'); setIsDropdownOpen(false); setSelectedFile(null); }} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-sm">전체 메시지</button>
                  <button onClick={() => openModal('bulk')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-sm">단체 메시지</button>
                  <button onClick={() => openModal('group')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-sm">그룹 메시지</button>
                </div>
              )}
            </div>

            {/* Chat List Content */}
            <div className="flex-1 bg-white overflow-y-auto">
              {chatRooms.map(room => (
                <div 
                  key={room.id}
                  onClick={() => { setActiveChannelId(room.id); setSelectedFile(null); }}
                  className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex flex-col gap-1 ${activeChannelId === room.id ? 'bg-[#e8f5e9]' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold truncate">{room.name}</span>
                    {room.isGroup && room.id !== 'global' && <span className="text-xs text-gray-500">{room.participants.length}명</span>}
                  </div>
                  <span className="text-xs text-gray-500 truncate">{room.lastMessage || '새로운 채팅방'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Pane (Chat Area or Empty Space) */}
      <div className="flex-1 flex flex-col bg-white relative">
        {viewMode === 'messenger' && activeChannelId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-black py-3 px-4 font-bold text-lg shadow-sm">
              {chatRooms.find(r => r.id === activeChannelId)?.name || '채팅방'}
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]">
              {filteredMessages.map((msg) => {
                const isMe = msg.senderId === customUser.id;
                const senderUser = usersList.find(u => u.id === msg.senderId);
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 overflow-hidden flex-shrink-0 flex items-center justify-center mt-1">
                        {senderUser?.photo ? <img src={senderUser.photo} alt="profile" className="w-full h-full object-cover" /> : <User size={16} className="text-gray-500" />}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-500 mb-1">{msg.senderName} {senderUser?.role ? `(${senderUser.role})` : ''}</span>
                      <div className={`px-3 py-2 border border-black rounded-lg max-w-[70%] ${isMe ? 'bg-[#dcedc8]' : 'bg-white'}`}>
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
                        {msg.text && <div className="whitespace-pre-wrap break-words">{msg.text}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            {selectedFile && (
              <div className="px-4 py-2 bg-gray-50 border-t border-black flex items-center justify-between">
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
            <div className="p-4 border-t border-black bg-white">
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
                    className="w-full border border-black rounded-full py-2.5 pl-4 pr-12 outline-none focus:ring-1 focus:ring-black"
                    placeholder="메시지를 입력하세요..."
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim() && !selectedFile}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black disabled:opacity-30"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-gray-50 flex items-center justify-center text-gray-400 font-bold">
            {viewMode === 'messenger' ? '채팅방을 선택해주세요.' : ''}
          </div>
        )}
      </div>

      {/* User Selection Modal */}
      {modalType && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-black rounded-lg shadow-xl w-[400px] flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-black bg-[#5cb85c] text-white rounded-t-lg">
              <h2 className="font-bold text-lg">
                {modalType === '1:1' ? '1:1 채팅 대상 선택' : modalType === 'bulk' ? '단체 메시지 대상 선택' : '그룹 채팅 대상 선택'}
              </h2>
              <button onClick={closeModal}><X size={24} /></button>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <input 
                type="text" 
                placeholder="이름 검색..." 
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full border border-black rounded p-2 outline-none"
              />
            </div>

            {modalType === 'group' && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <label className="block text-sm font-bold mb-2">그룹 채팅방 이름</label>
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={e => setGroupNameInput(e.target.value)}
                  className="w-full border border-black rounded p-2 outline-none"
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
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer rounded"
                  >
                    <div className={`w-5 h-5 border border-black rounded flex items-center justify-center ${isSelected ? 'bg-[#5cb85c]' : 'bg-white'}`}>
                      {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden border border-gray-300">
                        {u.photo ? <img src={u.photo} alt="profile" className="w-full h-full object-cover" /> : <User size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{u.name}</span>
                        {u.role && <span className="text-xs text-gray-500">{u.role}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {modalType === 'bulk' && (
              <div className="p-4 border-t border-black bg-gray-50">
                <label className="block text-sm font-bold mb-2">보낼 메시지</label>
                <textarea 
                  value={bulkMessageText}
                  onChange={e => setBulkMessageText(e.target.value)}
                  className="w-full border border-black rounded p-2 outline-none resize-none h-24"
                  placeholder="선택한 인원들에게 개별적으로 전송될 메시지를 입력하세요."
                />
              </div>
            )}

            <div className="p-4 border-t border-black flex justify-end gap-2 bg-white rounded-b-lg">
              <button onClick={closeModal} className="px-4 py-2 border border-black rounded font-bold hover:bg-gray-100">취소</button>
              <button 
                onClick={handleCreateChat}
                disabled={selectedUsers.length === 0 || (modalType === 'bulk' && !bulkMessageText.trim())}
                className="px-4 py-2 bg-[#5cb85c] text-white border border-black rounded font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {modalType === 'bulk' ? '전송' : '채팅방 생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {isProfileModalOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-black rounded-lg shadow-xl w-[400px] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-black bg-[#5cb85c] text-white rounded-t-lg">
              <h2 className="font-bold text-lg">프로필 설정</h2>
              <button onClick={() => setIsProfileModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-center mb-2">
                <div className="w-20 h-20 rounded-full border-2 border-[#5cb85c] overflow-hidden flex items-center justify-center bg-gray-100">
                  {profileEdit.photo ? (
                    <img src={profileEdit.photo} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">프로필 사진 URL</label>
                <input type="text" value={profileEdit.photo} onChange={e => setProfileEdit({...profileEdit, photo: e.target.value})} className="w-full border border-black rounded p-2 outline-none" placeholder="이미지 URL을 입력하세요" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">비밀번호 변경</label>
                <input type="password" value={profileEdit.pw} onChange={e => setProfileEdit({...profileEdit, pw: e.target.value})} className="w-full border border-black rounded p-2 outline-none" placeholder="새 비밀번호" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">직급 변경</label>
                <input type="text" value={profileEdit.role} onChange={e => setProfileEdit({...profileEdit, role: e.target.value})} className="w-full border border-black rounded p-2 outline-none" placeholder="예: 과장, 전문의" />
              </div>
            </div>
            <div className="p-4 border-t border-black flex justify-between items-center bg-gray-50 rounded-b-lg">
              <button onClick={handleDeleteAccount} className="text-red-600 font-bold hover:underline text-sm">회원탈퇴</button>
              <div className="flex gap-2">
                <button onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 border border-black rounded font-bold hover:bg-gray-100">취소</button>
                <button onClick={handleSaveProfile} className="px-4 py-2 bg-[#5cb85c] text-white border border-black rounded font-bold hover:bg-green-700">저장</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white border border-black rounded-lg p-6 w-80 text-center shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-red-600">회원탈퇴</h3>
            <p className="text-sm text-gray-600 mb-6">정말로 탈퇴하시겠습니까?<br/>모든 정보가 삭제되며 복구할 수 없습니다.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 border border-black rounded font-bold hover:bg-gray-100">취소</button>
              <button onClick={executeDeleteAccount} className="px-4 py-2 bg-red-600 text-white border border-black rounded font-bold hover:bg-red-700">탈퇴하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
