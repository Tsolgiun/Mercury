import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        if (notification.post?._id) {
          navigate(`/post/${notification.post._id}`);
        }
        break;
      case 'follow':
        navigate(`/profile/${notification.sender._id}`);
        break;
      case 'mention':
        if (notification.post?._id) {
          navigate(`/post/${notification.post._id}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'like':
        return `liked your post`;
      case 'comment':
        return `commented on your post`;
      case 'follow':
        return `started following you`;
      case 'mention':
        return `mentioned you in a post`;
      default:
        return 'interacted with you';
    }
  };

  return (
    <div className="container-narrow mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-error">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-muted">No notifications yet</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border ${
                notification.read ? 'border-outline bg-bg' : 'border-primary bg-hover'
              } cursor-pointer transition-colors`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                {/* User avatar */}
                <div className="flex-shrink-0">
                  {notification.sender.avatar ? (
                    <img
                      src={notification.sender.avatar}
                      alt={notification.sender.name}
                      className="avatar-sm"
                    />
                  ) : (
                    <div className="avatar-sm bg-outline flex items-center justify-center text-muted">
                      {notification.sender.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Notification content */}
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <p>
                      <span className="font-medium">{notification.sender.name}</span>{' '}
                      <span className="text-muted">
                        {getNotificationText(notification)}
                      </span>
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="text-muted hover:text-error"
                      aria-label="Delete notification"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Post title if available */}
                  {notification.post?.title && (
                    <p className="text-sm text-muted mt-1 truncate">
                      {notification.post.title}
                    </p>
                  )}
                  
                  {/* Timestamp */}
                  <p className="text-xs text-muted mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {notifications.length >= 20 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setPage(page + 1)}
                className="btn-outline"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
