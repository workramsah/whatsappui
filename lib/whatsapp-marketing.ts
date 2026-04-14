/**
 * WhatsApp Marketing Service
 */

export interface MarketingCampaign {
  id: string;
  name: string;
  message: string;
  targetAudience: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  status: string;
  language: string;
  components?: any[];
  variables?: string[];
}

const mockTemplates: WhatsAppTemplate[] = [
  {
    id: 'welcome_1',
    name: 'Welcome Message',
    category: 'MARKETING',
    status: 'APPROVED',
    language: 'en',
  },
  {
    id: 'offer_1',
    name: 'Special Offer',
    category: 'MARKETING',
    status: 'APPROVED',
    language: 'en',
  },
  {
    id: 'reminder_1',
    name: 'Order Reminder',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en',
  },
];

export class WhatsAppMarketingService {
  static async sendCampaign(campaign: MarketingCampaign): Promise<{ success: boolean; messageId?: string }> {
    console.log('Sending WhatsApp marketing campaign:', campaign);
    return { success: true, messageId: 'msg_' + Math.random().toString(36).substr(2, 9) };
  }

  static getTemplates(): WhatsAppTemplate[] {
    return mockTemplates;
  }

  static createPersonalizedMessage(
    customer: any,
    templateId: string,
    variables: Record<string, string>
  ): string {
    let message = `Hello ${customer.name}!`;
    const template = mockTemplates.find((t) => t.id === templateId);
    if (template) {
      message = template.name;
    }
    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });
    return message;
  }

  static sendClickToChat(phoneNumber: string, message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  static async validatePhoneNumbers(numbers: string[]): Promise<{ valid: string[]; invalid: string[] }> {
    return { valid: numbers, invalid: [] };
  }
}
