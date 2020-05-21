import { action } from 'typesafe-actions';
import { NotificationFilterFunction } from './NotificationBadgeTypes';
import { ACKNOWLEDGE_NOTIFICATIONS } from './NotificationBadgeTypes';

export const acknowledgeNotifications = (withFilter?: NotificationFilterFunction) =>
    action(ACKNOWLEDGE_NOTIFICATIONS, { withFilter });