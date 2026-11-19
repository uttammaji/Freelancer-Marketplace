export const mockConversations = [
  {
    id: 'conv-1',
    participantId: 'usr-freelancer-1',
    participantName: 'Rahul Sharma',
    participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    participantRole: 'freelancer',
    participantTitle: 'Senior Full Stack & AI Engineer',
    isOnline: true,
    projectContext: {
      id: 'proj-1',
      title: 'Build a Modern SaaS Analytics Dashboard in React & Node.js',
      budget: '$3,500'
    },
    unreadCount: 1,
    lastMessage: 'I have prepared a quick architectural diagram of the token telemetry stream.',
    lastMessageTime: '12:45 PM',
    messages: [
      {
        id: 'msg-1-1',
        senderId: 'usr-client-1',
        senderName: 'Sarah Connor',
        text: 'Hi Rahul! Thanks for your proposal on the SaaS Analytics project. Your experience with multi-tenant dashboards looks very relevant.',
        timestamp: '11:20 AM',
        isRead: true
      },
      {
        id: 'msg-1-2',
        senderId: 'usr-freelancer-1',
        senderName: 'Rahul Sharma',
        text: 'Hi Sarah! Thank you. I was looking through your project deliverables and have already built similar real-time charts using Recharts with WebSocket streaming.',
        timestamp: '11:35 AM',
        isRead: true
      },
      {
        id: 'msg-1-3',
        senderId: 'usr-client-1',
        senderName: 'Sarah Connor',
        text: 'That is awesome. How would you handle sub-50ms latency spikes if token throughput surges past 50,000 req/sec?',
        timestamp: '12:10 PM',
        isRead: true
      },
      {
        id: 'msg-1-4',
        senderId: 'usr-freelancer-1',
        senderName: 'Rahul Sharma',
        text: 'I have prepared a quick architectural diagram of the token telemetry stream. We can buffer incoming events via a Redis queue and stream down aggregated buckets to the UI.',
        timestamp: '12:45 PM',
        isRead: false,
        attachment: {
          name: 'Telemetry_Architecture_Buffer.png',
          size: '640 KB',
          type: 'image'
        }
      }
    ]
  },
  {
    id: 'conv-2',
    participantId: 'usr-freelancer-2',
    participantName: 'Elena Rostova',
    participantAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    participantRole: 'freelancer',
    participantTitle: 'Lead UI/UX Designer',
    isOnline: true,
    projectContext: {
      id: 'proj-3',
      title: 'Complete UI/UX Redesign & Design System for FinTech Web App',
      budget: '$2,800'
    },
    unreadCount: 0,
    lastMessage: 'Milestone 2 deliverable has been uploaded for your review!',
    lastMessageTime: 'Yesterday',
    messages: [
      {
        id: 'msg-2-1',
        senderId: 'usr-freelancer-2',
        senderName: 'Elena Rostova',
        text: 'Hello Sarah! I have finished the high-fidelity screens and the clickable prototype for the transaction flows.',
        timestamp: 'Yesterday, 3:15 PM',
        isRead: true
      },
      {
        id: 'msg-2-2',
        senderId: 'usr-freelancer-2',
        senderName: 'Elena Rostova',
        text: 'Milestone 2 deliverable has been uploaded for your review!',
        timestamp: 'Yesterday, 3:16 PM',
        isRead: true
      }
    ]
  },
  {
    id: 'conv-3',
    participantId: 'usr-client-2',
    participantName: 'Marcus Vance',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    participantRole: 'client',
    participantTitle: 'Founder @ Vance Digital Media',
    isOnline: false,
    projectContext: {
      id: 'proj-2',
      title: 'Cross-Platform iOS & Android Mobile App with Flutter',
      budget: '$4,800'
    },
    unreadCount: 0,
    lastMessage: 'Sounds good David, I will review the Flutter repository this evening.',
    lastMessageTime: '2 days ago',
    messages: [
      {
        id: 'msg-3-1',
        senderId: 'usr-client-2',
        senderName: 'Marcus Vance',
        text: 'Sounds good David, I will review the Flutter repository this evening.',
        timestamp: 'Aug 18, 4:00 PM',
        isRead: true
      }
    ]
  }
];
