/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable import/no-cycle */
import { io } from '../index';
import userService from './UserServices';
import database from '../database/models';

const { findUserById } = userService;
/**
 * @class NotificationService
 */
class NotificationService {
  /**
      *
      * @param {Integer} data
      * @returns {object} return null
      */
  static async sendNewTravelRequestNotification(data) {
    const notification = {};
    const { username, line_manager } = await userService.findUserById(data.user_id);
    const { id } = await userService.findUserByEmail(line_manager);

    notification.title = data.request_type;
    notification.from = username;

    const notificationToSave = {};
    notificationToSave.user_id = id;
    notificationToSave.request_id = data.id;
    notificationToSave.message = data.reason;
    notificationToSave.type = data.request_type;

    const { dataValues } = await NotificationService.saveNotification(notificationToSave);
    if (data.status === 'Approved' || data.status === 'Rejected') {
      notification.status = data.status;
      const emitRes = io.emit('travel_request_response', notification);
      return { dataValues, emitRes };
    }
    const emitRes = io.emit('new_travel_request', notification);

    return { dataValues, emitRes };
  }

  /**
   * @func sendNewCommentNotification
   * @param {*} data
   * @returns {*} notification
   */
  static async sendNewCommentNotification(data) {
    const notification = {};
    const { username, line_manager } = await userService.findUserById(data.user_id);
    const { id } = await userService.findUserByEmail(line_manager);

    notification.title = `${username} commented on your request`;
    notification.from = username;
    notification.data = data;

    const notificationToSave = {};
    notificationToSave.user_id = id;
    notificationToSave.message = data.comment;
    notificationToSave.request_id = data.request_id;
    notificationToSave.type = 'comments';

    const { dataValues } = await NotificationService.saveNotification(notificationToSave);
    const emitRes = io.emit('new_comment', notification);
    return { dataValues, emitRes };
  }

  /**
      *
      * @param {Integer} data
      * @returns {object} return null
      */
  static async newUserNotification(data) {
    const notification = {
      from: `${data.firstname} ${data.lastname}`,
      type: 'newUser',
      to: 'All'
    };
    io.emit('new_user', notification);
  }

  /**
      *
      * @param {Integer} data
      * @param {*} req
      * @returns {object} return null
      */
  static async newMessageNotification(data) {
    const user = await findUserById(data.from);
    const notification = {
      from: `${user.firstname} ${user.lastname}`,
      type: 'message',
      to: data.to,
      message: data.message
    };
    io.emit('send_message', notification);
  }

  /**
 *
 * @param {*} data
 * @returns {*} object
 */
  static async updateRequestNotification(data) {
    const notification = {
      user_id: data.user_id,
      request_id: data.id,
      type: 'request update',
      message: `${data.email} updated their request`
    };

    const { dataValues } = await NotificationService.saveNotification(notification);
    const updateNotification = {
      title: `${data.email} updated their request.`,
      requestId: data.id,
    };
    const emitRes = io.emit('request_update', notification);
    return { dataValues, emitRes };
  }

  /**
      *
      * @param {Object} notification
      * @returns {object} returns the notification
      */
  static async saveNotification(notification) {
    return database.Notification.create(notification);
  }
}

export default NotificationService;
