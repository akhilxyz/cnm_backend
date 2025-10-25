import Model from '@/db/models';

export class NotificationRepository {
  async createAsync(data: {
    whatsappAccountId: number;
    contactId: number;
    title: string;
    message: string;
  }) {
    const notification = await Model.Notification.create(data);
    const result :any = notification.get({ plain: true });
    result.id = notification.id ?? null
    return result
  }

  async findRecentAsync(whatsappAccountId: number, limit = 5) {
    return await Model.Notification.findAll({
      where: { whatsappAccountId },
      order: [['created_at', 'DESC']],
      limit,
    });
  }

  async markAsReadAsync(id: string) {
    return await Model.Notification.update({ read: true }, { where: { id } });
  }
}
