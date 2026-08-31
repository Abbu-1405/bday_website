import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LiveStatusHeader } from './LiveStatusHeader';
import { LiveActiveUsersList } from './LiveActiveUsersList';
import { LiveFeedFilterBar } from './LiveFeedFilterBar';
import { LiveActivityFeedList } from './LiveActivityFeedList';
import {
  subscribeToLiveActivity,
} from '../../../services/adminTrackingService';
import {
  LiveActiveUser,
  LiveFeedItem,
  LiveConnectionStatus,
  LiveFeedFilters,
} from '../../../types/tracking';

interface AdminLiveActivityProps {
  onViewUserDetails?: (userId: string) => void;
}

export const AdminLiveActivity: React.FC<AdminLiveActivityProps> = ({
  onViewUserDetails,
}) => {
  const [users, setUsers] = useState<LiveActiveUser[]>([]);
  const [feedItems, setFeedItems] = useState<LiveFeedItem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<LiveConnectionStatus>('connecting');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Cached buffer while paused
  const pausedFeedBufferRef = useRef<LiveFeedItem[]>([]);
  const pausedUsersBufferRef = useRef<LiveActiveUser[]>([]);

  // Filter state
  const [filters, setFilters] = useState<LiveFeedFilters>({
    selectedUserId: 'all',
    selectedSection: 'all',
    selectedEventType: 'all',
    searchQuery: '',
    uidQuery: '',
    displayNameQuery: '',
  });

  // Subscribe to live activity stream
  useEffect(() => {
    const unsubscribe = subscribeToLiveActivity({
      onUsersUpdate: (updatedUsers) => {
        if (isPaused) {
          pausedUsersBufferRef.current = updatedUsers;
        } else {
          setUsers(updatedUsers);
        }
      },
      onFeedUpdate: (updatedFeed) => {
        if (isPaused) {
          pausedFeedBufferRef.current = updatedFeed;
        } else {
          setFeedItems(updatedFeed);
        }
      },
      onConnectionStatusChange: (status) => {
        setConnectionStatus(status);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [refreshKey, isPaused]);

  const handleTogglePause = () => {
    if (isPaused) {
      // Resuming stream: apply buffered updates
      if (pausedUsersBufferRef.current.length > 0) {
        setUsers(pausedUsersBufferRef.current);
      }
      if (pausedFeedBufferRef.current.length > 0) {
        setFeedItems(pausedFeedBufferRef.current);
      }
      setIsPaused(false);
    } else {
      // Pausing stream
      pausedUsersBufferRef.current = users;
      pausedFeedBufferRef.current = feedItems;
      setIsPaused(true);
    }
  };

  const handleManualRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleFilterChange = (newFilters: Partial<LiveFeedFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      selectedUserId: 'all',
      selectedSection: 'all',
      selectedEventType: 'all',
      searchQuery: '',
      uidQuery: '',
      displayNameQuery: '',
    });
  };

  // Filtered live feed computation
  const filteredFeedItems = useMemo(() => {
    return feedItems.filter((item) => {
      // 1. User Dropdown Filter
      if (filters.selectedUserId !== 'all' && item.userId !== filters.selectedUserId) {
        return false;
      }

      // 2. User UID Text Filter
      if (filters.uidQuery.trim()) {
        const qUid = filters.uidQuery.toLowerCase().trim();
        const itemUid = (item.userId || '').toLowerCase();
        if (!itemUid.includes(qUid)) {
          return false;
        }
      }

      // 3. User Display Name Text Filter
      if (filters.displayNameQuery.trim()) {
        const qName = filters.displayNameQuery.toLowerCase().trim();
        const itemName = (item.userDisplayName || '').toLowerCase();
        if (!itemName.includes(qName)) {
          return false;
        }
      }

      // 4. Section Filter
      if (filters.selectedSection !== 'all') {
        const itemSec = (item.section || '').toLowerCase();
        const selSec = filters.selectedSection.toLowerCase();
        if (!itemSec.includes(selSec) && !selSec.includes(itemSec)) {
          return false;
        }
      }

      // 5. Event Type Filter
      if (filters.selectedEventType !== 'all') {
        if (filters.selectedEventType === 'error') {
          if (!item.isError && item.type !== 'error') return false;
        } else if (filters.selectedEventType === 'sneak_peek') {
          if (!item.type.startsWith('sneak_peek')) return false;
        } else if (item.type !== filters.selectedEventType) {
          return false;
        }
      }

      // 6. Generic Search Query Filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = (item.actionTitle || '').toLowerCase().includes(q);
        const matchDesc = (item.actionDescription || '').toLowerCase().includes(q);
        const matchUser = (item.userDisplayName || '').toLowerCase().includes(q);
        const matchEmail = (item.userEmail || '').toLowerCase().includes(q);
        const matchSec = (item.section || '').toLowerCase().includes(q);
        const matchRoute = (item.route || '').toLowerCase().includes(q);
        const matchUid = (item.userId || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchUser && !matchEmail && !matchSec && !matchRoute && !matchUid) {
          return false;
        }
      }

      return true;
    });
  }, [feedItems, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.selectedUserId !== 'all') count++;
    if (filters.selectedSection !== 'all') count++;
    if (filters.selectedEventType !== 'all') count++;
    if (filters.searchQuery.trim() !== '') count++;
    if (filters.uidQuery.trim() !== '') count++;
    if (filters.displayNameQuery.trim() !== '') count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-5">
      {/* 1. Header with live status, connection indicator & controls */}
      <LiveStatusHeader
        connectionStatus={connectionStatus}
        users={users}
        feedItems={feedItems}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onManualRefresh={handleManualRefresh}
        activeFilterCount={activeFilterCount}
      />

      {/* 2. Global Filter Bar */}
      <LiveFeedFilterBar
        filters={filters}
        users={users}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* 3. Main Live Dashboard Grid (Left: Active Presence List, Right: Chronological Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Active Users & Devices */}
        <div className="lg:col-span-4 xl:col-span-4">
          <LiveActiveUsersList
            users={users}
            selectedUserId={filters.selectedUserId}
            onSelectUser={(uid) => handleFilterChange({ selectedUserId: uid })}
            onViewUserDetails={onViewUserDetails}
          />
        </div>

        {/* Right Column: Chronological Live Event Feed */}
        <div className="lg:col-span-8 xl:col-span-8">
          <LiveActivityFeedList
            feedItems={filteredFeedItems}
            isPaused={isPaused}
            selectedUserId={filters.selectedUserId}
            selectedSection={filters.selectedSection}
            selectedEventType={filters.selectedEventType}
            searchQuery={filters.searchQuery}
            onClearFilters={handleResetFilters}
            onViewUserDetails={onViewUserDetails}
          />
        </div>
      </div>
    </div>
  );
};
