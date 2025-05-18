import { Request, Response } from 'express';
import { Notification } from '../models';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user?._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'sender',
        select: 'name username avatar',
      })
      .populate({
        path: 'post',
        select: 'title',
      });

    const total = await Notification.countDocuments({ recipient: req.user?._id });
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user?._id,
      read: false 
    });

    res.status(200).json({
      notifications,
      page,
      pages: Math.ceil(total / limit),
      total,
      unreadCount,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    // Check if the user is the recipient
    if (notification.recipient.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this notification' });
      return;
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { recipient: req.user?._id, read: false },
      { read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    // Check if the user is the recipient
    if (notification.recipient.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this notification' });
      return;
    }

    await Notification.deleteOne({ _id: notification._id });

    res.status(200).json({ message: 'Notification removed' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user?._id,
      read: false 
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
